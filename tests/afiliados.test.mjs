// Afiliados (?ref → localStorage → client_reference_id → KV aff:) y portal de cliente de Stripe.
import { test, describe, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import worker, { cleanRef, withClientReference, portalUrl, commissionOf, REF_WINDOW_DAYS } from '../produccion/src/worker.js';
import { makeEnv, ctx, req, stripeSig, ADMIN_TOKEN, mockFetch } from './helpers.mjs';

const call = (env, r) => worker.fetch(r, env, ctx());
const DAY = 86400;
const now = () => Math.floor(Date.now() / 1000);
let evtN = 0;
const webhook = (env, type, object, created = now()) => {
  const p = JSON.stringify({ id: 'evt_' + (++evtN), type, created, data: { object } });
  return call(env, req('/api/stripe-webhook', { method: 'POST', body: p, headers: { 'stripe-signature': stripeSig(p), 'content-type': 'application/json' } }));
};
const admin = (env, qs = '', headers = { authorization: 'Bearer ' + ADMIN_TOKEN }) => call(env, req('/api/admin/afiliados' + qs, { headers }));
const csvRows = async r => (await r.text()).replace(/^﻿/, '').trim().split('\r\n').map(l => [...l.matchAll(/"((?:[^"]|"")*)"/g)].map(m => m[1]));
const affKeys = env => env.KV.keys('aff:');
const session = (over = {}) => ({
  id: 'cs_test_aff0000000001', object: 'checkout.session', mode: 'payment', payment_status: 'paid', status: 'complete',
  amount_total: 4900, currency: 'eur', payment_intent: 'pi_aff1', customer_details: { email: 'compra@centro.es' }, ...over
});
let calls;
afterEach(() => { if (calls) calls.restore(); calls = null; });

describe('código de afiliado', () => {
  test('cleanRef: alfanumérico, ≤ 32, en minúsculas', () => {
    assert.equal(cleanRef('Maestra23'), 'maestra23');
    assert.equal(cleanRef(' abc '), 'abc');
    assert.equal(cleanRef('a'.repeat(32)), 'a'.repeat(32));
    for (const bad of ['a'.repeat(33), '', 'con-guion', 'con_barra', 'a:b', 'ñandú', '<x>', 'a b', null, undefined, 42, {}, ['abc']]) {
      assert.equal(cleanRef(bad), null, String(bad));
    }
  });
  test('withClientReference añade client_reference_id solo con código válido', () => {
    assert.equal(withClientReference('https://buy.stripe.com/test_x', 'Ana1'), 'https://buy.stripe.com/test_x?client_reference_id=ana1');
    assert.equal(withClientReference('https://buy.stripe.com/test_x?prefilled_email=a', 'ana1'), 'https://buy.stripe.com/test_x?prefilled_email=a&client_reference_id=ana1');
    assert.equal(withClientReference('https://buy.stripe.com/test_x', 'mal-codigo'), 'https://buy.stripe.com/test_x');
    assert.equal(withClientReference('no es url', 'ana1'), 'no es url');
  });
});

describe('lead con afiliado', () => {
  const lead = (env, body) => call(env, req('/api/lead', { method: 'POST', body: { rgpd: true, ...body } }));
  test('guarda ref y fecha del clic y la añade al enlace de pago de Fundador', async () => {
    const env = makeEnv();
    const t = Date.now() - 5 * DAY * 1000;
    const r = await lead(env, { email: 'f@centro.es', fundador: true, ref: 'Profe1', ref_t: t });
    assert.equal((await r.json()).checkout, 'https://buy.stripe.com/test_founder?client_reference_id=profe1');
    const rec = await env.KV.get('lead:f@centro.es', 'json');
    assert.equal(rec.ref, 'profe1');
    assert.equal(rec.ref_fecha, new Date(t).toISOString());
  });
  test('ref no válido se ignora (sin error); fecha del clic fuera de ventana → ahora', async () => {
    const env = makeEnv();
    const r = await lead(env, { email: 'g@centro.es', fundador: true, ref: 'x'.repeat(33) });
    assert.equal(r.status, 200);
    assert.equal((await r.json()).checkout, 'https://buy.stripe.com/test_founder');
    assert.equal((await env.KV.get('lead:g@centro.es', 'json')).ref, undefined);
    await lead(env, { email: 'h@centro.es', ref: 'abc', ref_t: Date.now() - 400 * DAY * 1000 });
    const f = Date.parse((await env.KV.get('lead:h@centro.es', 'json')).ref_fecha);
    assert.ok(Math.abs(f - Date.now()) < 5000);
  });
  test('gana el último enlace; un alta posterior sin ref conserva el anterior', async () => {
    const env = makeEnv();
    await lead(env, { email: 'i@centro.es', ref: 'uno' });
    await lead(env, { email: 'i@centro.es', ref: 'dos' });
    assert.equal((await env.KV.get('lead:i@centro.es', 'json')).ref, 'dos');
    await lead(env, { email: 'i@centro.es' });
    assert.equal((await env.KV.get('lead:i@centro.es', 'json')).ref, 'dos');
  });
});

describe('webhook: ventas atribuidas', () => {
  test('checkout con client_reference_id → aff:<código>:<YYYY-MM>:<sesión> sin datos personales; idempotente', async () => {
    const env = makeEnv();
    const s = session({ client_reference_id: 'Profe1', total_details: { amount_tax: 0 } });
    assert.equal((await webhook(env, 'checkout.session.completed', s)).status, 200);
    assert.equal((await webhook(env, 'checkout.session.completed', s)).status, 200);
    const keys = affKeys(env);
    assert.equal(keys.length, 1);
    const mes = new Date().toISOString().slice(0, 7);
    assert.equal(keys[0], `aff:profe1:${mes}:${s.id}`);
    const rec = await env.KV.get(keys[0], 'json');
    assert.deepEqual({ tipo: rec.tipo, plan: rec.plan, importe: rec.importe, session: rec.session }, { tipo: 'venta', plan: 'fundador', importe: 4900, session: s.id });
    assert.ok(rec.fecha);
    assert.doesNotMatch(JSON.stringify(rec), /@|compra|cus_/);
    assert.equal(env.KV.keys('lic:').length, 1, 'la licencia se emite igual');
  });
  test('sin código, con código no válido o sin pagar → no se registra venta', async () => {
    const env = makeEnv();
    await webhook(env, 'checkout.session.completed', session({ id: 'cs_test_aff0000000002' }));
    await webhook(env, 'checkout.session.completed', session({ id: 'cs_test_aff0000000003', client_reference_id: 'mal:codigo' }));
    await webhook(env, 'checkout.session.completed', session({ id: 'cs_test_aff0000000004', client_reference_id: 'ok', payment_status: 'unpaid' }));
    assert.equal(affKeys(env).length, 0);
    // pago asíncrono (SEPA) confirmado después → sí
    await webhook(env, 'checkout.session.async_payment_succeeded', session({ id: 'cs_test_aff0000000004', client_reference_id: 'ok', payment_status: 'paid' }));
    assert.equal(affKeys(env).length, 1);
  });
  test('el importe es sin impuestos (total_details.amount_tax)', async () => {
    const env = makeEnv();
    await webhook(env, 'checkout.session.completed', session({ client_reference_id: 'abc', amount_total: 1089, total_details: { amount_tax: 189 }, mode: 'subscription', subscription: 'sub_t' }));
    const rec = await env.KV.get(affKeys(env)[0], 'json');
    assert.equal(rec.importe, 900);
    assert.equal(rec.bruto, 1089);
    assert.equal(rec.plan, 'pro');
  });
  test('sin client_reference_id: se atribuye por el lead del mismo email si el clic fue hace ≤ 60 días', async () => {
    const env = makeEnv();
    const t = Date.now() - 10 * DAY * 1000;
    await env.KV.put('lead:compra@centro.es', JSON.stringify({ email: 'compra@centro.es', ref: 'blog7', ref_fecha: new Date(t).toISOString() }));
    await env.KV.put('lead:viejo@centro.es', JSON.stringify({ email: 'viejo@centro.es', ref: 'blog7', ref_fecha: new Date(Date.now() - (REF_WINDOW_DAYS + 1) * DAY * 1000).toISOString() }));
    await webhook(env, 'checkout.session.completed', session());
    await webhook(env, 'checkout.session.completed', session({ id: 'cs_test_aff0000000009', customer_details: { email: 'viejo@centro.es' } }));
    const keys = affKeys(env);
    assert.equal(keys.length, 1);
    assert.match(keys[0], /^aff:blog7:/);
    assert.doesNotMatch(await env.KV.get(keys[0]), /@/);
  });
  test('client_reference_id tiene prioridad sobre el lead', async () => {
    const env = makeEnv();
    await env.KV.put('lead:compra@centro.es', JSON.stringify({ ref: 'otro', ref_fecha: new Date().toISOString() }));
    await webhook(env, 'checkout.session.completed', session({ client_reference_id: 'directo' }));
    assert.match(affKeys(env)[0], /^aff:directo:/);
  });
});

describe('webhook: renovaciones (30 % durante 12 meses) y devoluciones', () => {
  const inicio = now() - 400 * DAY;          // primer pago hace > 12 meses para recorrer toda la ventana
  const addM = (sec, n) => { const d = new Date(sec * 1000); d.setUTCMonth(d.getUTCMonth() + n); return Math.floor(d.getTime() / 1000); };
  const invoice = (n, over = {}) => ({
    id: 'in_' + n, object: 'invoice', billing_reason: 'subscription_cycle', subscription: 'sub_m', amount_paid: 900, tax: 0, currency: 'eur',
    payment_intent: 'pi_in_' + n, status_transitions: { paid_at: addM(inicio, n) },
    lines: { data: [{ price: { recurring: { interval: 'month' } } }] }, ...over
  });
  const seedSub = async env => {
    await webhook(env, 'checkout.session.completed', session({ id: 'cs_test_sub000000001', mode: 'subscription', subscription: 'sub_m', amount_total: 900, payment_intent: null, invoice: 'in_0', client_reference_id: 'profe1' }), inicio);
  };
  test('mensual: 1 venta + 11 renovaciones = 12 pagos con comisión (máx. 32,40 €); el 13.º no cuenta', async () => {
    const env = makeEnv();
    await seedSub(env);
    await webhook(env, 'invoice.paid', invoice(0, { billing_reason: 'subscription_create' }), inicio);   // ya contado en checkout
    for (let n = 1; n <= 13; n++) await webhook(env, 'invoice.paid', invoice(n), addM(inicio, n));
    const keys = affKeys(env);
    assert.equal(keys.length, 12);
    const r = await admin(env, '?codigo=profe1&formato=resumen');
    const rows = await csvRows(r);
    const total = rows.slice(1).reduce((n, x) => n + Number(x[5]), 0);
    assert.equal(total.toFixed(2), '32.40');
    const renov = await env.KV.get(keys.find(k => k.endsWith(':in_1')), 'json');
    assert.equal(renov.tipo, 'renovacion');
    assert.equal(renov.plan, 'pro-mensual');
  });
  test('factura de una suscripción no atribuida → nada; API nueva (parent.subscription_details) → sí', async () => {
    const env = makeEnv();
    await webhook(env, 'invoice.paid', invoice(1, { subscription: 'sub_otra' }));
    assert.equal(affKeys(env).length, 0);
    await seedSub(env);
    await webhook(env, 'invoice.paid', invoice(2, { subscription: undefined, parent: { subscription_details: { subscription: 'sub_m' } } }));
    assert.equal(affKeys(env).length, 2);
  });
  test('devolución parcial y luego total → dos movimientos negativos por la diferencia; reintento idempotente', async () => {
    const env = makeEnv();
    await webhook(env, 'checkout.session.completed', session({ client_reference_id: 'profe1' }));
    const ch = { id: 'ch_1', object: 'charge', payment_intent: 'pi_aff1', currency: 'eur', amount_refunded: 1000, refunded: false };
    await webhook(env, 'charge.refunded', ch);
    await webhook(env, 'charge.refunded', ch);                                  // reintento
    await webhook(env, 'charge.refunded', { ...ch, amount_refunded: 4900, refunded: true });
    const recs = await Promise.all(affKeys(env).map(k => env.KV.get(k, 'json')));
    const dev = recs.filter(r => r.tipo === 'devolucion').map(r => r.importe).sort((a, b) => a - b);
    assert.deepEqual(dev, [-3900, -1000]);
    assert.equal(recs.reduce((n, r) => n + r.importe, 0), 0);
    // devolución total también desactiva la licencia de Fundador
    const key = await env.KV.get('pi:pi_aff1');
    assert.equal((await env.KV.get('lic:' + key, 'json')).active, false);
  });
  test('devolución de un pago no atribuido → nada', async () => {
    const env = makeEnv();
    await webhook(env, 'charge.refunded', { id: 'ch_2', payment_intent: 'pi_nada', amount_refunded: 900, refunded: true });
    assert.equal(affKeys(env).length, 0);
  });
});

describe('/api/admin/afiliados (CSV de comisiones)', () => {
  const seed = async env => {
    await env.KV.put('aff:ana:2026-10:cs_a', JSON.stringify({ tipo: 'venta', plan: 'fundador', importe: 4900, moneda: 'eur', fecha: '2026-10-03T00:00:00.000Z', session: 'cs_a' }));
    await env.KV.put('aff:ana:2026-11:cs_b', JSON.stringify({ tipo: 'venta', plan: 'pro', importe: 6900, moneda: 'eur', fecha: '2026-11-02T00:00:00.000Z', session: 'cs_b' }));
    await env.KV.put('aff:ana:2026-11:ch_c-900', JSON.stringify({ tipo: 'devolucion', plan: 'pro', importe: -900, moneda: 'eur', fecha: '2026-11-09T00:00:00.000Z', session: 'cs_x', cargo: 'ch_c' }));
    await env.KV.put('aff:luis:2026-11:in_d', JSON.stringify({ tipo: 'renovacion', plan: 'pro-mensual', importe: 900, moneda: 'eur', fecha: '2026-11-05T00:00:00.000Z', session: 'in_d' }));
    await env.KV.put('affsub:sub_z', JSON.stringify({ ref: 'ana', inicio: 1 }));   // índice: no debe salir en el CSV
  };
  test('misma autenticación que /api/admin/leads', async () => {
    const env = makeEnv(); await seed(env);
    assert.equal((await admin(env, '', {})).status, 401);
    assert.equal((await admin(env, '?token=x', {})).status, 401);
    assert.equal((await admin(env, '', { authorization: 'Bearer ' + ADMIN_TOKEN.slice(0, -1) })).status, 401);
    assert.equal((await admin(env, '?token=' + ADMIN_TOKEN, {})).status, 200);
    assert.equal((await admin(makeEnv({ ADMIN_TOKEN: 'corto' }), '', { authorization: 'Bearer corto' })).status, 503);
    assert.equal((await call(env, req('/api/admin/afiliados', { method: 'POST', body: {} }))).status, 405);
  });
  test('detalle: un movimiento por fila, comisión del 30 % y devoluciones en negativo', async () => {
    const env = makeEnv(); await seed(env);
    const r = await admin(env);
    assert.match(r.headers.get('content-type'), /text\/csv/);
    assert.match(r.headers.get('content-disposition'), /afiliados\.csv/);
    assert.equal(r.headers.get('cache-control'), 'no-store');
    const rows = await csvRows(r);
    assert.deepEqual(rows[0], ['codigo', 'mes', 'tipo', 'fecha', 'plan', 'importe_neto', 'comision_30%', 'moneda', 'id_stripe', 'cargo']);
    assert.equal(rows.length, 5);
    const byId = Object.fromEntries(rows.slice(1).map(x => [x[8], x]));
    assert.deepEqual([byId.cs_a[0], byId.cs_a[1], byId.cs_a[5], byId.cs_a[6]], ['ana', '2026-10', '49.00', '14.70']);
    assert.equal(byId.cs_b[6], '20.70');
    assert.equal(byId.cs_x[6], '-2.70');
    assert.equal(byId.in_d[6], '2.70');
  });
  test('filtros ?mes= y ?codigo=; formato=resumen agrupa por afiliado y mes', async () => {
    const env = makeEnv(); await seed(env);
    assert.equal((await csvRows(await admin(env, '?mes=2026-11'))).length, 4);
    assert.equal((await csvRows(await admin(env, '?codigo=LUIS'))).length, 2);
    const res = await csvRows(await admin(env, '?mes=2026-11&formato=resumen'));
    assert.deepEqual(res[0], ['codigo', 'mes', 'ventas', 'devoluciones', 'importe_neto', 'comision_30%', 'moneda']);
    assert.deepEqual(res.find(x => x[0] === 'ana'), ['ana', '2026-11', '1', '1', '60.00', '18.00', 'eur']);
    assert.deepEqual(res.find(x => x[0] === 'luis'), ['luis', '2026-11', '1', '0', '9.00', '2.70', 'eur']);
  });
  test('parámetros no válidos → 400', async () => {
    const env = makeEnv();
    for (const qs of ['?mes=2026-13', '?mes=noviembre', '?codigo=a:b', '?codigo=' + 'a'.repeat(33)]) assert.equal((await admin(env, qs)).status, 400, qs);
  });
  test('commissionOf redondea al céntimo', () => {
    assert.equal(commissionOf(900), 270);
    assert.equal(commissionOf(6900), 2070);
    assert.equal(commissionOf(4900), 1470);
    assert.equal(commissionOf(-900), -270);
  });
});

describe('/api/portal (gestión de la suscripción)', () => {
  test('redirige (302) a STRIPE_PORTAL_URL', async () => {
    const env = makeEnv({ STRIPE_PORTAL_URL: 'https://billing.stripe.com/p/login/test_123' });
    const r = await call(env, req('/api/portal'));
    assert.equal(r.status, 302);
    assert.equal(r.headers.get('location'), 'https://billing.stripe.com/p/login/test_123');
    assert.equal(r.headers.get('cache-control'), 'no-store');
  });
  test('sin configurar o con URL no https → 503 con mensaje legible', async () => {
    for (const v of [undefined, '', 'http://billing.stripe.com/p/login/x', 'javascript:alert(1)', 'no es url']) {
      const r = await call(makeEnv({ STRIPE_PORTAL_URL: v }), req('/api/portal'));
      assert.equal(r.status, 503, String(v));
      assert.equal(r.headers.get('location'), null);
      assert.match(await r.text(), /portal/);
    }
    assert.equal(portalUrl({}), null);
  });
  test('solo GET/HEAD', async () => {
    assert.equal((await call(makeEnv(), req('/api/portal', { method: 'POST', body: {} }))).status, 405);
  });
});

// ---------- Navegador: bloque AulaRef de shared/engine.web.js (también inyectado en la landing) ----------
const engineCode = readFileSync(new URL('../shared/engine.web.js', import.meta.url), 'utf8') + '\n;globalThis.Engine = Engine; globalThis.AulaRef = AulaRef;';
function browser({ search = '', stored = {}, clock = Date.now() } = {}) {
  const ls = new Map(Object.entries(stored));
  const listeners = [];
  const c = {
    localStorage: { getItem: k => ls.has(k) ? ls.get(k) : null, setItem: (k, v) => ls.set(k, String(v)), removeItem: k => ls.delete(k) },
    location: { search, pathname: '/', hash: '#precios' },
    history: { replaceState: (a, b, url) => { c.replaced = url; const q = url.indexOf('?'); c.location.search = q < 0 ? '' : url.slice(q).split('#')[0]; } },
    document: { addEventListener: (type, fn, capture) => listeners.push({ type, fn, capture }) },
    fetch: async () => Response.json({}),
    URLSearchParams, URL, TextDecoder, Response, Blob, setTimeout, console,
    Date: class extends Date { static now() { return clock; } }
  };
  vm.createContext(c);
  vm.runInContext(engineCode, c);
  return { c, ls, listeners, AulaRef: c.AulaRef, Engine: c.Engine };
}

describe('AulaRef (navegador)', () => {
  test('capture: guarda el código en minúsculas con la fecha y retira solo ?ref de la URL', () => {
    const { AulaRef, ls, c } = browser({ search: '?utm_source=ig&ref=Profe1' });
    assert.equal(AulaRef.capture(), 'profe1');
    const v = JSON.parse(ls.get('al-ref'));
    assert.equal(v.c, 'profe1');
    assert.equal(typeof v.t, 'number');
    assert.equal(c.replaced, '/?utm_source=ig#precios');
  });
  test('código no válido: no se guarda, no pisa el anterior y se retira de la URL', () => {
    const prev = JSON.stringify({ c: 'bueno', t: Date.now() });
    const { AulaRef, ls, c } = browser({ search: '?ref=<script>', stored: { 'al-ref': prev } });
    assert.equal(AulaRef.capture(), 'bueno');
    assert.equal(ls.get('al-ref'), prev);
    assert.equal(c.replaced, '/#precios');
    const b = browser({ search: '?ref=' + 'a'.repeat(33) });
    assert.equal(b.AulaRef.capture(), null);
    assert.equal(b.ls.has('al-ref'), false);
  });
  test('sin ?ref no toca la URL; el último enlace gana', () => {
    const { AulaRef, c } = browser({ stored: { 'al-ref': JSON.stringify({ c: 'uno', t: Date.now() }) } });
    assert.equal(AulaRef.capture(), 'uno');
    assert.equal(c.replaced, undefined);
    const b = browser({ search: '?ref=dos', stored: { 'al-ref': JSON.stringify({ c: 'uno', t: Date.now() }) } });
    assert.equal(b.AulaRef.capture(), 'dos');
  });
  test('caduca a los 60 días (y se borra)', () => {
    const t = Date.now();
    const stored = { 'al-ref': JSON.stringify({ c: 'abc', t }) };
    assert.equal(browser({ stored, clock: t + 59 * 864e5 }).AulaRef.get(), 'abc');
    const late = browser({ stored, clock: t + 61 * 864e5 });
    assert.equal(late.AulaRef.get(), null);
    assert.equal(late.ls.has('al-ref'), false);
    assert.equal(browser({ stored: { 'al-ref': '"basura"' } }).AulaRef.get(), null);
    assert.equal(browser({ stored: { 'al-ref': JSON.stringify({ c: 'a:b', t }) } }).AulaRef.get(), null);
  });
  test('checkoutUrl: solo Payment Links https://buy.stripe.com, idempotente', () => {
    const { AulaRef } = browser({ stored: { 'al-ref': JSON.stringify({ c: 'abc', t: Date.now() }) } });
    const u = AulaRef.checkoutUrl('https://buy.stripe.com/test_1');
    assert.equal(u, 'https://buy.stripe.com/test_1?client_reference_id=abc');
    assert.equal(AulaRef.checkoutUrl(u), u);
    assert.equal(AulaRef.checkoutUrl('https://evil.example/buy.stripe.com'), 'https://evil.example/buy.stripe.com');
    assert.equal(AulaRef.checkoutUrl('http://buy.stripe.com/x'), 'http://buy.stripe.com/x');
    assert.equal(browser().AulaRef.checkoutUrl('https://buy.stripe.com/test_1'), 'https://buy.stripe.com/test_1');
  });
  test('decorate: al hacer clic en un enlace a buy.stripe.com añade el código', () => {
    const { AulaRef, listeners } = browser({ stored: { 'al-ref': JSON.stringify({ c: 'abc', t: Date.now() }) } });
    AulaRef.decorate({ addEventListener: (type, fn, capture) => listeners.push({ type, fn, capture }) });
    const l = listeners.find(x => x.type === 'click');
    assert.equal(l.capture, true);
    const a = { href: 'https://buy.stripe.com/test_9' };
    l.fn({ target: { closest: () => a } });
    assert.equal(a.href, 'https://buy.stripe.com/test_9?client_reference_id=abc');
    const other = { href: 'https://aulalista.es/app' };
    l.fn({ target: { closest: () => other } });
    assert.equal(other.href, 'https://aulalista.es/app');
  });
  test('Engine.init captura ?ref en la app y conserva el retorno de Stripe', async () => {
    const LIC = 'al_' + 'd'.repeat(36);
    const { Engine, ls, c } = browser({ search: '?ref=app1&session_id=cs_test_1&tema=agua' });
    c.fetch = async () => Response.json({ license: LIC });
    await Engine.init();
    assert.equal(JSON.parse(ls.get('al-ref')).c, 'app1');
    assert.equal(JSON.parse(ls.get('al-license')), LIC);
    assert.equal(c.replaced, '/?tema=agua#precios');
    assert.equal((await Engine.usage()).manage, '/api/portal');
  });
  test('sin licencia no se ofrece el portal', async () => {
    const { Engine, c } = browser();
    c.fetch = async () => Response.json({ used: 0, limit: 3 });
    assert.equal((await Engine.usage()).manage, undefined);
  });
});
