import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

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

function fromBase64url(base64url: string): ArrayBuffer {
  const base64 = base64url.replace(/-/g, '+').replace(/_/g, '/');
  const padded = base64.padEnd(base64.length + (4 - base64.length % 4) % 4, '=');
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes.buffer;
}

async function makeVapidJwt(vapidPrivateKeyB64: string, audience: string): Promise<string> {
  const header = { typ: 'JWT', alg: 'ES256' };
  const payload = {
    aud: audience,
    exp: Math.floor(Date.now() / 1000) + 43200,
    sub: 'mailto:notifications@dealzflow.app',
  };

  const encoder = new TextEncoder();
  const encHeader = toBase64url(encoder.encode(JSON.stringify(header)));
  const encPayload = toBase64url(encoder.encode(JSON.stringify(payload)));
  const signingInput = `${encHeader}.${encPayload}`;

  const privateKeyBytes = fromBase64url(vapidPrivateKeyB64);
  const privateKey = await crypto.subtle.importKey(
    'pkcs8',
    privateKeyBytes,
    { name: 'ECDSA', namedCurve: 'P-256' },
    false,
    ['sign']
  );

  const sig = await crypto.subtle.sign(
    { name: 'ECDSA', hash: 'SHA-256' },
    privateKey,
    encoder.encode(signingInput)
  );

  return `${signingInput}.${toBase64url(sig)}`;
}

async function encryptPayload(
  payload: string,
  p256dh: string,
  auth: string
): Promise<{ ciphertext: ArrayBuffer; salt: Uint8Array; serverPublicKey: Uint8Array }> {
  const encoder = new TextEncoder();

  // Generate ephemeral server key pair
  const serverKeys = await crypto.subtle.generateKey(
    { name: 'ECDH', namedCurve: 'P-256' },
    true,
    ['deriveBits']
  );

  // Import client public key
  const clientPublicKeyRaw = fromBase64url(p256dh);
  const clientPublicKey = await crypto.subtle.importKey(
    'raw',
    clientPublicKeyRaw,
    { name: 'ECDH', namedCurve: 'P-256' },
    false,
    []
  );

  // Get server public key as raw bytes
  const serverPublicKeyRaw = await crypto.subtle.exportKey('raw', serverKeys.publicKey);
  const serverPublicKey = new Uint8Array(serverPublicKeyRaw);

  // ECDH shared secret
  const sharedBits = await crypto.subtle.deriveBits(
    { name: 'ECDH', public: clientPublicKey },
    serverKeys.privateKey,
    256
  );

  const authBytes = new Uint8Array(fromBase64url(auth));
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const clientPublicKeyBytes = new Uint8Array(clientPublicKeyRaw);

  // HKDF auth info
  const authInfo = new Uint8Array([
    ...encoder.encode('Content-Encoding: auth\0')
  ]);

  // PRK from auth
  const authKeyMaterial = await crypto.subtle.importKey('raw', authBytes, { name: 'HKDF' }, false, ['deriveBits']);
  const prkBits = await crypto.subtle.deriveBits(
    { name: 'HKDF', hash: 'SHA-256', salt: new Uint8Array(sharedBits), info: authInfo },
    authKeyMaterial,
    256
  );

  const prkKey = await crypto.subtle.importKey('raw', prkBits, { name: 'HKDF' }, false, ['deriveBits']);

  // Context for key derivation
  const context = new Uint8Array([
    ...encoder.encode('P-256\0'),
    0, clientPublicKeyBytes.length,
    ...clientPublicKeyBytes,
    0, serverPublicKey.length,
    ...serverPublicKey,
  ]);

  // CEK
  const cekInfo = new Uint8Array([...encoder.encode('Content-Encoding: aesgcm\0'), ...context]);
  const cekBits = await crypto.subtle.deriveBits(
    { name: 'HKDF', hash: 'SHA-256', salt, info: cekInfo },
    prkKey,
    128
  );

  // Nonce
  const nonceInfo = new Uint8Array([...encoder.encode('Content-Encoding: nonce\0'), ...context]);
  const nonceBits = await crypto.subtle.deriveBits(
    { name: 'HKDF', hash: 'SHA-256', salt, info: nonceInfo },
    prkKey,
    96
  );

  const cek = await crypto.subtle.importKey('raw', cekBits, 'AES-GCM', false, ['encrypt']);

  const payloadBytes = encoder.encode(payload);
  const padded = new Uint8Array([0, 0, ...payloadBytes]);

  const ciphertext = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: nonceBits },
    cek,
    padded
  );

  return { ciphertext, salt, serverPublicKey };
}

async function sendWebPush(
  subscription: { endpoint: string; p256dh: string; auth: string },
  payload: string,
  vapidPublicKey: string,
  vapidPrivateKey: string
): Promise<{ status: number; body: string }> {
  const url = new URL(subscription.endpoint);
  const audience = `${url.protocol}//${url.host}`;
  const jwt = await makeVapidJwt(vapidPrivateKey, audience);

  const { ciphertext, salt, serverPublicKey } = await encryptPayload(payload, subscription.p256dh, subscription.auth);

  // Build encrypted body: salt(16) + rs(4) + keylen(1) + serverPublicKey(65) + ciphertext
  const rs = new Uint8Array(4);
  new DataView(rs.buffer).setUint32(0, 4096, false);
  const body = new Uint8Array([
    ...salt, ...rs, serverPublicKey.length, ...serverPublicKey, ...new Uint8Array(ciphertext)
  ]);

  const res = await fetch(subscription.endpoint, {
    method: 'POST',
    headers: {
      'Authorization': `vapid t=${jwt}, k=${vapidPublicKey}`,
      'Content-Type': 'application/octet-stream',
      'Content-Encoding': 'aesgcm',
      'Encryption': `salt=${toBase64url(salt.buffer)}`,
      'Crypto-Key': `dh=${toBase64url(serverPublicKey.buffer)};p256ecdsa=${vapidPublicKey}`,
      'TTL': '86400',
    },
    body,
  });

  return { status: res.status, body: await res.text() };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const vapidPublicKey = Deno.env.get('VAPID_PUBLIC_KEY')?.trim();
    const vapidPrivateKey = Deno.env.get('VAPID_PRIVATE_KEY')?.trim();

    if (!vapidPublicKey || !vapidPrivateKey) {
      return new Response(JSON.stringify({ error: 'VAPID keys not configured. Add VAPID_PUBLIC_KEY and VAPID_PRIVATE_KEY secrets.' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey);
    const { user_id, title, message, url, all_users } = await req.json();

    const payload = JSON.stringify({ title: title || '📱 Dealzflow', body: message, url: url || '/pipeline' });

    let query = supabase.from('push_subscriptions').select('*');
    if (!all_users && user_id) query = query.eq('user_id', user_id);

    const { data: subs, error } = await query;
    if (error) throw error;
    if (!subs || subs.length === 0) {
      return new Response(JSON.stringify({ message: 'No subscriptions found', sent: 0 }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    let sent = 0;
    const errors: any[] = [];

    for (const sub of subs) {
      try {
        const { status, body: resBody } = await sendWebPush(
          { endpoint: sub.endpoint, p256dh: sub.p256dh, auth: sub.auth },
          payload,
          vapidPublicKey,
          vapidPrivateKey
        );

        if (status >= 200 && status < 300) {
          sent++;
        } else if (status === 410 || status === 404) {
          await supabase.from('push_subscriptions').delete().eq('id', sub.id);
        } else {
          errors.push({ status, body: resBody.substring(0, 100) });
        }
      } catch (err) {
        errors.push({ error: String(err).substring(0, 100) });
      }
    }

    return new Response(JSON.stringify({ sent, total: subs.length, errors }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (err) {
    console.error('send-push-notification error:', err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
