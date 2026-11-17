// AulaLista — backend de producción (Cloudflare Worker, sin dependencias).
// Rutas:
//   POST /api/generate        {mode, d}  → stream SSE del modelo (cupo gratis por IP o licencia Pro)
//   GET  /api/usage                       → {used, limit}
//   POST /api/lead            {email, comunidad, rol, fundador}  → guarda lead (+ MailerLite opcional)
//   POST /api/stripe-webhook              → alta/baja de licencias Pro
//   GET  /api/license?session_id=cs_...   → devuelve la licencia tras el pago
//   GET  /api/admin/leads?token=...       → exporta leads en CSV (solo tú)
// Todo lo demás lo sirve el directorio de assets estáticos (public/).

import { promptSA, promptRubrica, promptAdaptacion, CCAA, CURSOS } from './prompts.mjs';

const FREE_LIMIT = 3;
const json = (obj, status = 200, extra = {}) =>
  new Response(JSON.stringify(obj), { status, headers: { 'content-type': 'application/json; charset=utf-8', ...extra } });
const month = () => new Date().toISOString().slice(0, 7);
const clientId = req => req.headers.get('cf-connecting-ip') || 'anon';

export default {
  async fetch(req, env, ctx) {
    const url = new URL(req.url);
    try {
      if (url.pathname === '/api/generate' && req.method === 'POST') return await generate(req, env);
      if (url.pathname === '/api/usage') return await usage(req, env);
      if (url.pathname === '/api/lead' && req.method === 'POST') return await lead(req, env, ctx);
      if (url.pathname === '/api/stripe-webhook' && req.method === 'POST') return await stripeWebhook(req, env);
      if (url.pathname === '/api/license') return await licenseFromSession(url, env);
      if (url.pathname === '/api/admin/leads') return await exportLeads(url, env);
      if (url.pathname.startsWith('/api/')) return json({ message: 'Ruta no encontrada' }, 404);
      return env.ASSETS.fetch(req);
    } catch (err) {
      console.error(err);
      return json({ message: 'Error interno' }, 500);
    }
  }
};

// ---------- Generación ----------
async function checkLicense(req, env) {
  const auth = req.headers.get('authorization') || '';
  const key = auth.startsWith('Bearer ') ? auth.slice(7).trim() : '';
  if (!key) return null;
  const lic = await env.KV.get('lic:' + key, 'json');
  return lic && lic.active ? lic : null;
}

async function generate(req, env) {
  let body;
  try { body = await req.json(); } catch (e) { return json({ message: 'Petición no válida' }, 400); }
  const { mode, d } = body || {};
  if (!d || !['sa', 'rubrica', 'adaptacion'].includes(mode)) return json({ message: 'Petición no válida' }, 400);
  if (!CCAA.some(c => c.id === d.ccaa) || !CURSOS.includes(d.curso)) return json({ message: 'Comunidad o curso no válidos' }, 400);
  const total = JSON.stringify(d).length;
  if (total > 6000 || !String(d.tema || '').trim()) return json({ message: 'Texto demasiado largo o vacío' }, 400);

  const lic = await checkLicense(req, env);
  let used = 0;
  if (!lic) {
    const k = `u:${clientId(req)}:${month()}`;
    used = parseInt((await env.KV.get(k)) || '0', 10);
    if (used >= FREE_LIMIT) {
      return json({ message: `Has usado tus ${FREE_LIMIT} documentos gratis de este mes. Hazte Pro en ${env.PUBLIC_URL || ''}/#precios` }, 402);
    }
    used += 1;
    await env.KV.put(k, String(used), { expirationTtl: 60 * 60 * 24 * 40 });
  } else {
    // Freno anti-abuso para licencias: 60 documentos/día
    const k = `p:${lic.key}:${new Date().toISOString().slice(0, 10)}`;
    const n = parseInt((await env.KV.get(k)) || '0', 10);
    if (n >= 60) return json({ message: 'Has alcanzado el máximo diario. Vuelve mañana.' }, 429);
    await env.KV.put(k, String(n + 1), { expirationTtl: 60 * 60 * 48 });
  }

  const prompt = mode === 'sa' ? promptSA(d) : mode === 'rubrica' ? promptRubrica(d) : promptAdaptacion(d);
  const upstream = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json'
    },
    body: JSON.stringify({
      model: env.MODEL || 'claude-sonnet-5-5',
      max_tokens: mode === 'sa' ? 8000 : 4000,
      stream: true,
      messages: [{ role: 'user', content: prompt }]
    })
  });
  if (!upstream.ok || !upstream.body) {
    console.error('anthropic', upstream.status, await upstream.text());
    return json({ message: 'El motor de IA no está disponible ahora mismo. Inténtalo en unos minutos.' }, 502);
  }
  return new Response(upstream.body, {
    headers: {
      'content-type': 'text/event-stream; charset=utf-8',
      'cache-control': 'no-store',
      'x-plan': lic ? 'pro' : 'free',
      'x-usage-used': String(used),
      'x-usage-limit': String(lic ? 0 : FREE_LIMIT),
      'access-control-expose-headers': 'x-plan, x-usage-used, x-usage-limit'
    }
  });
}

async function usage(req, env) {
  const used = parseInt((await env.KV.get(`u:${clientId(req)}:${month()}`)) || '0', 10);
  return json({ used, limit: FREE_LIMIT });
}

// ---------- Leads ----------
async function lead(req, env, ctx) {
  let b;
  try { b = await req.json(); } catch (e) { return json({ message: 'Petición no válida' }, 400); }
  const email = String(b.email || '').trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) || email.length > 200) return json({ message: 'Email no válido' }, 400);
  const rec = {
    email,
    comunidad: String(b.comunidad || '').slice(0, 60),
    rol: String(b.rol || '').slice(0, 60),
    fundador: !!b.fundador,
    origen: String(b.origen || '').slice(0, 100),
    fecha: new Date().toISOString()
  };
  await env.KV.put('lead:' + email, JSON.stringify(rec));
  if (env.MAILERLITE_API_KEY) {
    ctx.waitUntil(fetch('https://connect.mailerlite.com/api/subscribers', {
      method: 'POST',
      headers: { 'content-type': 'application/json', authorization: 'Bearer ' + env.MAILERLITE_API_KEY },
      body: JSON.stringify({
        email,
        fields: { comunidad: rec.comunidad, rol: rec.rol },
        groups: env.MAILERLITE_GROUP_ID ? [env.MAILERLITE_GROUP_ID] : undefined
      })
    }).catch(e => console.error('mailerlite', e)));
  }
  return json({ ok: true, checkout: rec.fundador ? (env.STRIPE_FOUNDER_LINK || null) : null });
}

async function exportLeads(url, env) {
  if (!env.ADMIN_TOKEN || url.searchParams.get('token') !== env.ADMIN_TOKEN) return json({ message: 'No autorizado' }, 401);
  const rows = [['email', 'comunidad', 'rol', 'fundador', 'origen', 'fecha']];
  let cursor;
  do {
    const page = await env.KV.list({ prefix: 'lead:', cursor });
    for (const k of page.keys) {
      const r = await env.KV.get(k.name, 'json');
      if (r) rows.push([r.email, r.comunidad, r.rol, r.fundador ? 'sí' : 'no', r.origen, r.fecha]);
    }
    cursor = page.list_complete ? null : page.cursor;
  } while (cursor);
  const csv = rows.map(r => r.map(v => '"' + String(v ?? '').replace(/"/g, '""') + '"').join(',')).join('\n');
  return new Response(csv, { headers: { 'content-type': 'text/csv; charset=utf-8', 'content-disposition': 'attachment; filename="leads.csv"' } });
}

// ---------- Stripe ----------
function newKey() {
  const a = new Uint8Array(18); crypto.getRandomValues(a);
  return 'al_' + [...a].map(b => b.toString(16).padStart(2, '0')).join('');
}

async function issueLicense(env, session) {
  const existing = await env.KV.get('sess:' + session.id);
  if (existing) return existing;
  const key = newKey();
  const lic = {
    key, active: true,
    email: (session.customer_details && session.customer_details.email) || session.customer_email || '',
    plan: session.mode === 'subscription' ? 'pro' : 'fundador',
    subscription: session.subscription || null,
    creada: new Date().toISOString()
  };
  await env.KV.put('lic:' + key, JSON.stringify(lic));
  await env.KV.put('sess:' + session.id, key);
  if (lic.subscription) await env.KV.put('sub:' + lic.subscription, key);
  if (lic.email) await env.KV.put('email:' + lic.email.toLowerCase(), key);
  return key;
}

async function verifyStripe(req, secret) {
  const sig = req.headers.get('stripe-signature') || '';
  const payload = await req.text();
  const parts = Object.fromEntries(sig.split(',').map(p => p.split('=')));
  const t = parts.t, v1 = sig.split(',').filter(p => p.startsWith('v1=')).map(p => p.slice(3));
  if (!t || !v1.length) return null;
  if (Math.abs(Date.now() / 1000 - Number(t)) > 300) return null;
  const k = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const mac = await crypto.subtle.sign('HMAC', k, new TextEncoder().encode(`${t}.${payload}`));
  const hex = [...new Uint8Array(mac)].map(b => b.toString(16).padStart(2, '0')).join('');
  return v1.includes(hex) ? JSON.parse(payload) : null;
}

async function stripeWebhook(req, env) {
  const event = await verifyStripe(req, env.STRIPE_WEBHOOK_SECRET);
  if (!event) return json({ message: 'Firma no válida' }, 400);
  const obj = event.data && event.data.object;
  if (event.type === 'checkout.session.completed' && obj.payment_status === 'paid') {
    await issueLicense(env, obj);
  }
  if (event.type === 'customer.subscription.deleted') {
    const key = await env.KV.get('sub:' + obj.id);
    if (key) {
      const lic = await env.KV.get('lic:' + key, 'json');
      if (lic) { lic.active = false; lic.baja = new Date().toISOString(); await env.KV.put('lic:' + key, JSON.stringify(lic)); }
    }
  }
  return json({ received: true });
}

async function licenseFromSession(url, env) {
  const sid = url.searchParams.get('session_id') || '';
  if (!/^cs_[A-Za-z0-9_]+$/.test(sid)) return json({ message: 'Sesión no válida' }, 400);
  let key = await env.KV.get('sess:' + sid);
  if (!key) {
    // El webhook puede tardar unos segundos: comprobamos directamente con Stripe
    const r = await fetch('https://api.stripe.com/v1/checkout/sessions/' + sid, { headers: { authorization: 'Bearer ' + env.STRIPE_SECRET_KEY } });
    if (!r.ok) return json({ message: 'Sesión no encontrada' }, 404);
    const s = await r.json();
    if (s.payment_status !== 'paid') return json({ message: 'Pago pendiente' }, 402);
    key = await issueLicense(env, s);
  }
  return json({ license: key });
}
