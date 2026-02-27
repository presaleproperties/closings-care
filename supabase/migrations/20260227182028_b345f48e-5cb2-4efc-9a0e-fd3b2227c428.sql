
-- =====================================================================
-- Encrypt api_key and api_secret in platform_connections using pgcrypto
-- =====================================================================

-- 1. Enable pgcrypto extension
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 2. Helper: encrypt a credential string using the service-level secret
--    We use SUPABASE_DB_URL as a deterministic per-project secret seed.
--    The actual passphrase is injected via app.settings at migration time,
--    but at runtime edge functions handle encrypt/decrypt directly in SQL
--    using pgp_sym_encrypt / pgp_sym_decrypt with the env var.
--
--    These functions are SECURITY DEFINER so only edge functions using
--    the service role can call them.

CREATE OR REPLACE FUNCTION public.encrypt_api_credential(plaintext TEXT, passphrase TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF plaintext IS NULL OR plaintext = '' THEN
    RETURN NULL;
  END IF;
  RETURN encode(pgp_sym_encrypt(plaintext, passphrase), 'base64');
END;
$$;

CREATE OR REPLACE FUNCTION public.decrypt_api_credential(ciphertext TEXT, passphrase TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF ciphertext IS NULL OR ciphertext = '' THEN
    RETURN NULL;
  END IF;
  -- If the value doesn't look like base64 pgp data, return as-is (legacy plaintext)
  BEGIN
    RETURN pgp_sym_decrypt(decode(ciphertext, 'base64'), passphrase);
  EXCEPTION WHEN OTHERS THEN
    -- Legacy plaintext value — return as-is so existing connections still work
    RETURN ciphertext;
  END;
END;
$$;

-- 3. Revoke public execute on these sensitive functions
REVOKE EXECUTE ON FUNCTION public.encrypt_api_credential(TEXT, TEXT) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.decrypt_api_credential(TEXT, TEXT) FROM PUBLIC;
-- Grant only to service_role (used by edge functions)
GRANT EXECUTE ON FUNCTION public.encrypt_api_credential(TEXT, TEXT) TO service_role;
GRANT EXECUTE ON FUNCTION public.decrypt_api_credential(TEXT, TEXT) TO service_role;
