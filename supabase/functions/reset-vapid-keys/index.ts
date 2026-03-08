// Temporary utility — generates a fresh VAPID key pair
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function toBase64url(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let str = '';
  for (const byte of bytes) str += String.fromCharCode(byte);
  return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  const keyPair = await crypto.subtle.generateKey(
    { name: 'ECDSA', namedCurve: 'P-256' },
    true,
    ['sign', 'verify']
  );

  const publicKeyRaw = await crypto.subtle.exportKey('raw', keyPair.publicKey);
  const privateKeyPkcs8 = await crypto.subtle.exportKey('pkcs8', keyPair.privateKey);

  const publicKey = toBase64url(publicKeyRaw);
  const privateKey = toBase64url(privateKeyPkcs8);

  // Verify the key round-trips correctly
  let verified = false;
  try {
    const fromBase64url = (b64: string) => {
      const base64 = b64.replace(/-/g, '+').replace(/_/g, '/');
      const padded = base64.padEnd(base64.length + (4 - base64.length % 4) % 4, '=');
      const binary = atob(padded);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
      return bytes.buffer;
    };
    await crypto.subtle.importKey(
      'pkcs8',
      fromBase64url(privateKey),
      { name: 'ECDSA', namedCurve: 'P-256' },
      false,
      ['sign']
    );
    verified = true;
  } catch (e) {
    return new Response(JSON.stringify({ error: 'Key verification failed: ' + String(e) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify({
    VAPID_PUBLIC_KEY: publicKey,
    VAPID_PRIVATE_KEY: privateKey,
    verified,
    instructions: 'Copy these values and update both secrets in Lovable Cloud settings',
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
});
