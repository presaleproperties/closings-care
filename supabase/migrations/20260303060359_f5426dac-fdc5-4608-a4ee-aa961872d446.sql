CREATE OR REPLACE FUNCTION public.encrypt_api_credential(plaintext text, passphrase text)
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'extensions'
AS $function$
BEGIN
  IF plaintext IS NULL OR plaintext = '' THEN
    RETURN NULL;
  END IF;
  RETURN encode(extensions.pgp_sym_encrypt(plaintext, passphrase), 'base64');
END;
$function$;

CREATE OR REPLACE FUNCTION public.decrypt_api_credential(ciphertext text, passphrase text)
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'extensions'
AS $function$
BEGIN
  IF ciphertext IS NULL OR ciphertext = '' THEN
    RETURN NULL;
  END IF;
  BEGIN
    RETURN extensions.pgp_sym_decrypt(decode(ciphertext, 'base64'), passphrase);
  EXCEPTION WHEN OTHERS THEN
    RETURN ciphertext;
  END;
END;
$function$;