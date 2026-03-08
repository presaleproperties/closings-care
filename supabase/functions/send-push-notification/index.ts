import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Minimal Web Push implementation using VAPID
async function base64UrlToUint8Array(base64url: string): Promise<Uint8Array> {
  const base64 = base64url.replace(/-/g, '+').replace(/_/g, '/');
  const padded = base64.padEnd(base64.length + (4 - base64.length % 4) % 4, '=');
  const binary = atob(padded);
  return Uint8Array.from(binary, c => c.charCodeAt(0));
}

async function uint8ArrayToBase64Url(arr: Uint8Array): Promise<string> {
  return btoa(String.fromCharCode(...arr))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

async function generateVapidAuthHeaders(
  vapidPublicKey: string,
  vapidPrivateKey: string,
  audience: string
): Promise<string> {
  const privateKeyBytes = await base64UrlToUint8Array(vapidPrivateKey);
  
  const key = await crypto.subtle.importKey(
    'raw',
    privateKeyBytes,
    { name: 'ECDSA', namedCurve: 'P-256' },
    false,
    ['sign']
  );

  const header = { typ: 'JWT', alg: 'ES256' };
  const payload = {
    aud: audience,
    exp: Math.floor(Date.now() / 1000) + 12 * 60 * 60,
    sub: 'mailto:admin@dealzflow.app',
  };

  const encoder = new TextEncoder();
  const encodedHeader = await uint8ArrayToBase64Url(encoder.encode(JSON.stringify(header)));
  const encodedPayload = await uint8ArrayToBase64Url(encoder.encode(JSON.stringify(payload)));
  const signingInput = `${encodedHeader}.${encodedPayload}`;

  const signature = await crypto.subtle.sign(
    { name: 'ECDSA', hash: { name: 'SHA-256' } },
    key,
    encoder.encode(signingInput)
  );

  const encodedSignature = await uint8ArrayToBase64Url(new Uint8Array(signature));
  const jwt = `${signingInput}.${encodedSignature}`;

  return `vapid t=${jwt}, k=${vapidPublicKey}`;
}

async function sendWebPush(
  subscription: { endpoint: string; p256dh: string; auth: string },
  payload: string,
  vapidPublicKey: string,
  vapidPrivateKey: string
): Promise<Response> {
  const url = new URL(subscription.endpoint);
  const audience = `${url.protocol}//${url.host}`;

  const authHeader = await generateVapidAuthHeaders(vapidPublicKey, vapidPrivateKey, audience);

  // Encrypt the payload using the subscription keys
  const serverKeyPair = await crypto.subtle.generateKey(
    { name: 'ECDH', namedCurve: 'P-256' },
    true,
    ['deriveKey']
  );

  const clientPublicKeyBytes = await base64UrlToUint8Array(subscription.p256dh);
  const clientPublicKey = await crypto.subtle.importKey(
    'raw',
    clientPublicKeyBytes,
    { name: 'ECDH', namedCurve: 'P-256' },
    false,
    []
  );

  const serverPublicKeyRaw = await crypto.subtle.exportKey('raw', serverKeyPair.publicKey);
  const serverPublicKeyBytes = new Uint8Array(serverPublicKeyRaw);

  const authBytes = await base64UrlToUint8Array(subscription.auth);

  const sharedSecret = await crypto.subtle.deriveKey(
    { name: 'ECDH', public: clientPublicKey },
    serverKeyPair.privateKey,
    { name: 'HKDF', hash: 'SHA-256', salt: new Uint8Array(0), info: new Uint8Array(0) },
    false,
    ['deriveBits']
  );

  // HKDF to derive encryption keys
  const encoder = new TextEncoder();
  const prk = await crypto.subtle.importKey(
    'raw',
    await crypto.subtle.exportKey('raw', sharedSecret).catch(async () => {
      // Derive bits instead
      return await crypto.subtle.deriveBits(
        { name: 'ECDH', public: clientPublicKey },
        serverKeyPair.privateKey,
        256
      );
    }),
    { name: 'HKDF' },
    false,
    ['deriveKey', 'deriveBits']
  );

  // For simplicity, use a direct fetch approach with Content-Encoding: aesgcm
  // Generate salt
  const salt = crypto.getRandomValues(new Uint8Array(16));

  // Derive shared secret bits
  const sharedBits = await crypto.subtle.deriveBits(
    { name: 'ECDH', public: clientPublicKey },
    serverKeyPair.privateKey,
    256
  );

  // HKDF-SHA-256 for auth secret
  const authKey = await crypto.subtle.importKey('raw', authBytes, { name: 'HKDF' }, false, ['deriveBits']);
  const authInfo = encoder.encode('Content-Encoding: auth\0');
  const prk2 = await crypto.subtle.deriveBits(
    { name: 'HKDF', hash: 'SHA-256', salt: new Uint8Array(sharedBits), info: authInfo },
    authKey,
    256
  );

  // Derive CEK and nonce
  const prkKey = await crypto.subtle.importKey('raw', prk2, { name: 'HKDF' }, false, ['deriveBits']);
  const cekInfo = encoder.encode('Content-Encoding: aesgcm\0');
  const serverPublicContext = new Uint8Array([
    ...encoder.encode('P-256\0'),
    0, 65, ...clientPublicKeyBytes,
    0, 65, ...serverPublicKeyBytes
  ]);
  const cekInfoFull = new Uint8Array([...cekInfo, ...serverPublicContext]);

  const cekBits = await crypto.subtle.deriveBits(
    { name: 'HKDF', hash: 'SHA-256', salt, info: cekInfoFull },
    prkKey,
    128
  );

  const nonceInfo = encoder.encode('Content-Encoding: nonce\0');
  const nonceInfoFull = new Uint8Array([...nonceInfo, ...serverPublicContext]);
  const nonceBits = await crypto.subtle.deriveBits(
    { name: 'HKDF', hash: 'SHA-256', salt, info: nonceInfoFull },
    prkKey,
    96
  );

  const cek = await crypto.subtle.importKey('raw', cekBits, { name: 'AES-GCM' }, false, ['encrypt']);

  // Pad and encrypt
  const payloadBytes = encoder.encode(payload);
  const padded = new Uint8Array([0, 0, ...payloadBytes]); // 2-byte padding length + content
  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: nonceBits },
    cek,
    padded
  );

  // Build body: salt (16) + record size (4) + key length (1) + server public key (65) + encrypted
  const rs = new Uint8Array(4);
  new DataView(rs.buffer).setUint32(0, 4096);
  const body = new Uint8Array([
    ...salt, ...rs, serverPublicKeyBytes.length, ...serverPublicKeyBytes, ...new Uint8Array(encrypted)
  ]);

  return fetch(subscription.endpoint, {
    method: 'POST',
    headers: {
      'Authorization': authHeader,
      'Content-Type': 'application/octet-stream',
      'Content-Encoding': 'aesgcm',
      'Encryption': `salt=${await uint8ArrayToBase64Url(salt)}`,
      'Crypto-Key': `dh=${await uint8ArrayToBase64Url(serverPublicKeyBytes)}; p256ecdsa=${vapidPublicKey}`,
      'TTL': '86400',
      'Content-Length': body.byteLength.toString(),
    },
    body,
  });
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const vapidPublicKey = Deno.env.get('VAPID_PUBLIC_KEY')!;
    const vapidPrivateKey = Deno.env.get('VAPID_PRIVATE_KEY')!;

    if (!vapidPublicKey || !vapidPrivateKey) {
      return new Response(JSON.stringify({ error: 'VAPID keys not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey);
    const body = await req.json();
    const { user_id, title, message, url } = body;

    const payload = JSON.stringify({ title, body: message, url: url || '/pipeline' });

    // Fetch subscriptions for this user (or all users if no user_id)
    const query = supabase.from('push_subscriptions').select('*');
    if (user_id) query.eq('user_id', user_id);
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
        const res = await sendWebPush(
          { endpoint: sub.endpoint, p256dh: sub.p256dh, auth: sub.auth },
          payload,
          vapidPublicKey,
          vapidPrivateKey
        );

        if (res.status === 201 || res.status === 200 || res.status === 202) {
          sent++;
        } else if (res.status === 410 || res.status === 404) {
          // Subscription expired — remove it
          await supabase.from('push_subscriptions').delete().eq('id', sub.id);
        } else {
          const text = await res.text();
          errors.push({ endpoint: sub.endpoint.substring(0, 40), status: res.status, body: text });
        }
      } catch (err) {
        errors.push({ endpoint: sub.endpoint.substring(0, 40), error: String(err) });
      }
    }

    return new Response(JSON.stringify({ sent, errors }), {
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
