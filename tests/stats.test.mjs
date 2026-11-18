// Métricas agregadas y anónimas: contadores en KV (track), endpoint /api/admin/stats, agregación y panel /admin/.
import { test, describe, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import vm from 'node:vm';
import worker, { track, aggregateStats, statsRange, ccaaId, planOf, PRICES, FOUNDER_SEATS, STATS_MAX_DAYS, STATS_SHARDS, MODES } from '../produccion/src/worker.js';
import { makeEnv, ctx, req, sseBody, mockFetch, stripeSig, validSA, ADMIN_TOKEN } from './helpers.mjs';

const today = () => new Date().toISOString().slice(0, 10);
const auth = { authorization: 'Bearer ' + ADMIN_TOKEN };
let calls;
afterEach(() => { if (calls) calls.restore(); calls = null; });

// Ejecuta una petición y espera a lo que el Worker deja en segundo plano (waitUntil).
async function run(env, r) {
  const c = ctx();
  const res = await worker.fetch(r, env, c);
  await Promise.all(c.pending);
  return res;
}
const stats = async (env, qs = '') => run(env, req('/api/admin/stats' + qs, { headers: auth }));
const evt = (type, object) => JSON.stringify({ id: 'evt_' + Math.random().toString(36).slice(2), type, created: Math.floor(Date.now() / 1000), data: { object } });
const hook = (env, type, object) => { const p = evt(type, object); return run(env, req('/api/stripe-webhook', { method: 'POST', body: p, headers: { 'stripe-signature': stripeSig(p), 'content-type': 'application/json' } })); };
const statDocs = env => env.KV.keys('stats:').map(k => [k, env.KV.map.get(k).value]);

describe('track(): contadores diarios en KV', () => {
  test('suma en stats:<día>:<fragmento> y reparte entre STATS_SHARDS fragmentos', async () => {
    const env = makeEnv();
    for (let i = 0; i < 40; i++) await track(env, { 'gen.total': 1, 'gen.modo.sa': 1 });
    const keys = env.KV.keys('stats:');
    assert.ok(keys.length > 1 && keys.length <= STATS_SHARDS, 'varios fragmentos: ' + keys.length);
    for (const k of keys) assert.match(k, new RegExp(`^stats:${today()}:[0-${STATS_SHARDS - 1}]$`));
    const sum = keys.reduce((n, k) => n + JSON.parse(env.KV.map.get(k).value).c['gen.total'], 0);
    assert.equal(sum, 40);
  });
  test('ignora claves no válidas, ceros y valores no numéricos', async () => {
    const env = makeEnv();
    await track(env, { 'GEN.total': 1, 'a@b.es': 1, 'gen.ccaa.../x': 1, 'gen.total': 0, 'gen.modo.sa': 'x', 'gen.a.b.c': 1 });
    assert.equal(env.KV.keys('stats:').length, 0);
  });
  test('nunca lanza (un fallo de KV no rompe la generación)', async () => {
    const env = makeEnv();
    env.KV.put = async () => { throw new Error('KV write limit'); };
    await assert.doesNotReject(track(env, { 'gen.total': 1 }));
  });
  test('STATS_KV = "off" no escribe en KV; con STATS_AE escribe data points en Analytics Engine', async () => {
    const points = [];
    const env = makeEnv({ STATS_KV: 'off', STATS_AE: { writeDataPoint: p => points.push(p) } });
    await track(env, { 'gen.total': 1, 'gen.modo.rubrica': 1 });
    assert.equal(env.KV.puts, 0);
    assert.deepEqual(points, [
      { indexes: [today()], blobs: ['gen.total'], doubles: [1] },
      { indexes: [today()], blobs: ['gen.modo.rubrica'], doubles: [1] }
    ]);
  });
});

describe('utilidades', () => {
  test('ccaaId normaliza la comunidad del lead (nombre, id, tildes) y agrupa lo desconocido', () => {
    assert.equal(ccaaId('Canarias'), 'canarias');
    assert.equal(ccaaId('andalucia'), 'andalucia');
    assert.equal(ccaaId('Castilla-La Mancha'), 'clm');
    assert.equal(ccaaId('Ceuta y Melilla'), 'mefp');
    assert.equal(ccaaId('=HYPERLINK("x")'), 'otra');
    assert.equal(ccaaId(''), 'sin_dato');
  });
  test('planOf', () => {
    assert.equal(planOf({ plan: 'fundador' }), 'fundador');
    assert.equal(planOf({ plan: 'pro', intervalo: 'year' }), 'pro-anual');
    assert.equal(planOf({ plan: 'pro', intervalo: 'month' }), 'pro-mensual');
    assert.equal(planOf({ key: 'x', active: true }), 'pro');
  });
  test('statsRange: por defecto 30 días hasta hoy; valida formato, orden y máximo', () => {
    const r = statsRange(null, null, '2026-11-18');
    assert.equal(r.desde, '2026-10-20'); assert.equal(r.hasta, '2026-11-18'); assert.equal(r.days.length, 30);
    assert.equal(statsRange('2026-02-27', '2026-03-01').days.join(), '2026-02-27,2026-02-28,2026-03-01');
    for (const [d, h] of [['2026-13-01', '2026-12-01'], ['2026-02-30', '2026-03-01'], ['ayer', null], ['2026-11-18', '2026-11-01'], ['2026-01-01', '2026-12-31']]) {
      assert.ok(statsRange(d, h, '2026-11-18').error, `${d}..${h}`);
    }
    assert.equal(statsRange('2026-01-01', '2026-04-02').days.length, STATS_MAX_DAYS);
  });
});

describe('aggregateStats (agregación pura)', () => {
  const range = statsRange('2026-11-01', '2026-11-03');
  const perDay = new Map([
    ['2026-11-01', { 'gen.total': 5, 'gen.modo.sa': 3, 'gen.modo.rubrica': 2, 'gen.ccaa.canarias': 4, 'gen.ccaa.madrid': 1, 'gen.plan.free': 4, 'gen.plan.pro': 1, 'leads.total': 4, 'leads.fundador': 2, 'leads.ccaa.canarias': 4 }],
    ['2026-11-02', {}],
    ['2026-11-03', { 'gen.total': 3, 'gen.modo.pd': 3, 'gen.ccaa.madrid': 3, 'gen.plan.pro': 3, 'err.modelo': 1, 'lic.total': 3, 'lic.plan.fundador': 1, 'lic.plan.pro-mensual': 1, 'lic.plan.pro-anual': 1, 'cobro.fundador': 4900, 'cobro.pro-anual': 6900, 'renov.total': 1, 'renov.plan.pro-mensual': 1, 'bajas.total': 1, 'bajas.plan.pro-mensual': 1, 'bajas.motivo.baja': 1, 'aff.ventas': 1, 'aff.importe': 4050 }]
  ]);
  const snap = { activas: { fundador: 2, 'pro-mensual': 3, 'pro-anual': 2, pro: 1 }, inactivas: 4, parcial: false };
  const s = aggregateStats(range, perDay, snap, new Date('2026-11-03T12:00:00Z'));

  test('totales, serie completa (días sin datos a cero) y KPIs', () => {
    assert.deepEqual(s.rango, { desde: '2026-11-01', hasta: '2026-11-03', dias: 3 });
    assert.equal(s.serie.length, 3);
    assert.deepEqual(s.serie[1], { dia: '2026-11-02', generaciones: 0, free: 0, pro: 0, errores: 0, leads: 0, fundador: 0, licencias: 0, bajas: 0 });
    assert.equal(s.kpis.generaciones, 8);
    assert.equal(s.kpis.generaciones_dia, 2.7);
    assert.equal(s.kpis.leads, 4); assert.equal(s.kpis.leads_fundador, 2);
    assert.equal(s.kpis.conversion_lead_pago, 0.75);
    assert.equal(s.kpis.tasa_error, 0.1111);
    assert.deepEqual(Object.keys(s.generaciones.por_modo), MODES, 'todos los modos, también a cero');
    assert.equal(s.generaciones.por_modo.oposicion, 0);
  });
  test('top comunidades y modos ordenados, con nombre', () => {
    assert.deepEqual(s.top.comunidades, [{ id: 'canarias', nombre: 'Canarias', n: 4 }, { id: 'madrid', nombre: 'Comunidad de Madrid', n: 4 }]);
    assert.deepEqual(s.top.modos.map(m => m.id), ['pd', 'sa', 'rubrica']);
  });
  test('MRR con licencias activas: mensuales (y sin periodicidad) × 9 € + anuales × 69 €/12; Fundador no suma', () => {
    assert.equal(s.actual.mrr_estimado_eur, (3 + 1) * 9 + 2 * 69 / 12);
    assert.equal(s.kpis.mrr_estimado_eur, 47.5);
    assert.equal(s.actual.arr_estimado_eur, 570);
    assert.equal(s.actual.pro_activos, 6);
    assert.deepEqual(s.actual.plazas_fundador, { total: FOUNDER_SEATS, ocupadas: 2, libres: FOUNDER_SEATS - 2 });
  });
  test('ingresos estimados por plan con los precios de README y cobrados según Stripe', () => {
    assert.deepEqual(s.ingresos.precios_eur, { fundador: 49, 'pro-mensual': 9, 'pro-anual': 69 });
    assert.deepEqual(s.ingresos.estimados_eur, { fundador: 49, 'pro-mensual': 18, 'pro-anual': 69, total: 136 });
    assert.equal(s.ingresos.cobrados_stripe_eur.total, 118);
    assert.equal(s.afiliados.comision_estimada_eur, 12.15);
    assert.equal(s.embudo.pasos.length, 3);
    assert.equal(s.embudo.conversion_fundador, 0.5);
  });
  test('sin datos: ratios null (no NaN ni Infinity)', () => {
    const e = aggregateStats(range, new Map(), { activas: { fundador: 0, 'pro-mensual': 0, 'pro-anual': 0, pro: 0 }, inactivas: 0 });
    assert.equal(e.kpis.conversion_lead_pago, null);
    assert.equal(e.kpis.tasa_error, null);
    assert.doesNotMatch(JSON.stringify(e), /NaN|Infinity/);
  });
});

describe('GET /api/admin/stats', () => {
  test('misma autenticación que /api/admin/leads: sin token 401, token erróneo 401, token corto 503, POST 405', async () => {
    const env = makeEnv();
    assert.equal((await run(env, req('/api/admin/stats'))).status, 401);
    assert.equal((await run(env, req('/api/admin/stats', { headers: { authorization: 'Bearer ' + ADMIN_TOKEN.slice(0, -1) + 'x' } }))).status, 401);
    assert.equal((await run(makeEnv({ ADMIN_TOKEN: 'corto' }), req('/api/admin/stats', { headers: { authorization: 'Bearer corto' } }))).status, 503);
    assert.equal((await run(env, req('/api/admin/stats', { method: 'POST', headers: auth }))).status, 405);
    const r = await run(env, req('/api/admin/stats?token=' + ADMIN_TOKEN));
    assert.equal(r.status, 200);
    assert.equal(r.headers.get('cache-control'), 'no-store');
    assert.match(r.headers.get('x-robots-tag'), /noindex/);
  });
  test('rango no válido → 400', async () => {
    const env = makeEnv();
    for (const qs of ['?desde=2026-1-1', '?hasta=mañana', '?desde=2026-11-10&hasta=2026-11-01', '?desde=2025-01-01&hasta=2026-01-01']) {
      assert.equal((await stats(env, qs)).status, 400, qs);
    }
  });
  test('extremo a extremo: generaciones, errores, leads, licencias, bajas y afiliados; sin datos personales', async () => {
    const env = makeEnv();
    let fail = false;
    calls = mockFetch(url => {
      if (url.startsWith('https://api.anthropic.com/')) return fail ? new Response('caído', { status: 529 }) : new Response(sseBody(['ok']), { headers: { 'content-type': 'text/event-stream' } });
      throw new Error('fetch inesperado: ' + url);
    });
    // 3 gratis + 1 sin cupo (402) desde la misma IP; 1 rúbrica de Madrid desde otra; 1 fallo del modelo
    for (let i = 0; i < 4; i++) await run(env, req('/api/generate', { method: 'POST', body: validSA() }));
    await run(env, req('/api/generate', { method: 'POST', body: { mode: 'rubrica', d: { ...validSA().d, ccaa: 'madrid', curso: '3º', area: validSA().d.area } }, ip: '198.51.100.20' }));
    fail = true;
    assert.equal((await run(env, req('/api/generate', { method: 'POST', body: validSA(), ip: '198.51.100.30' }))).status, 502);
    // Leads: nuevo, repetido (no cuenta), nuevo Fundador, y el primero pasa a Fundador
    const lead = (b, ip) => run(env, req('/api/lead', { method: 'POST', body: { rgpd: true, comunidad: 'Canarias', ...b }, ip }));
    await lead({ email: 'ana@centro.es' }, '192.0.2.1');
    await lead({ email: 'ana@centro.es' }, '192.0.2.1');
    await lead({ email: 'luis@centro.es', fundador: true, comunidad: 'Comunidad de Madrid' }, '192.0.2.2');
    await lead({ email: 'ana@centro.es', fundador: true }, '192.0.2.1');
    // Licencias: Fundador con afiliado, Pro mensual, Pro anual; reintento del webhook (no cuenta); baja del mensual
    const founder = { id: 'cs_test_st_founder0001', mode: 'payment', payment_status: 'paid', payment_intent: 'pi_st1', amount_total: 4900, client_reference_id: 'maria', customer_details: { email: 'luis@centro.es' } };
    await hook(env, 'checkout.session.completed', founder);
    await hook(env, 'checkout.session.completed', founder);
    await hook(env, 'checkout.session.completed', { id: 'cs_test_st_mensual0001', mode: 'subscription', payment_status: 'paid', subscription: 'sub_m', amount_total: 900, customer_details: { email: 'ana@centro.es' } });
    await hook(env, 'checkout.session.completed', { id: 'cs_test_st_anual00001', mode: 'subscription', payment_status: 'paid', subscription: 'sub_a', amount_total: 6900 });
    await hook(env, 'customer.subscription.deleted', { id: 'sub_m' });
    await hook(env, 'customer.subscription.deleted', { id: 'sub_m' });   // repetido: una sola baja

    const r = await stats(env);
    assert.equal(r.status, 200);
    const s = await r.json();
    assert.equal(s.rango.hasta, today());
    assert.equal(s.rango.dias, 30);
    assert.equal(s.generaciones.total, 4);
    assert.deepEqual(s.generaciones.por_plan, { free: 4, pro: 0 });
    assert.equal(s.generaciones.por_modo.sa, 3); assert.equal(s.generaciones.por_modo.rubrica, 1);
    assert.deepEqual(s.top.comunidades.map(c => [c.id, c.n]), [['canarias', 3], ['madrid', 1]]);
    assert.equal(s.generaciones.cupo_agotado, 1);
    assert.equal(s.kpis.errores_modelo, 1);
    assert.deepEqual(s.errores.por_modo, { sa: 1 });
    assert.equal(s.leads.total, 2); assert.equal(s.leads.fundador, 2);
    assert.deepEqual(s.leads.por_ccaa.map(c => c.id).sort(), ['canarias', 'madrid']);
    assert.deepEqual(s.licencias.por_plan, { fundador: 1, 'pro-mensual': 1, 'pro-anual': 1, pro: 0 });
    assert.equal(s.kpis.conversion_lead_pago, 1.5);
    assert.equal(s.bajas.total, 1); assert.deepEqual(s.bajas.por_plan, { 'pro-mensual': 1 });
    assert.equal(s.afiliados.ventas, 1); assert.equal(s.afiliados.importe_neto_eur, 49);
    assert.equal(s.ingresos.estimados_eur.total, 49 + 9 + 69);
    assert.equal(s.ingresos.cobrados_stripe_eur.total, 49 + 9 + 69);
    // Foto actual: el mensual está de baja
    assert.equal(s.actual.pro_activos, 1); assert.equal(s.actual.pro_anual, 1); assert.equal(s.actual.fundador_activos, 1);
    assert.equal(s.actual.mrr_estimado_eur, 5.75);
    assert.equal(s.actual.plazas_fundador.libres, FOUNDER_SEATS - 1);
    // Ni emails, ni IP (en claro o seudonimizada), ni licencias, ni códigos de afiliado, ni ids de Stripe en las métricas
    const all = JSON.stringify(statDocs(env)) + JSON.stringify(s);
    const lic = await env.KV.get('sub:sub_a');
    for (const bad of ['@', '203.0.113', '198.51.100', '192.0.2', lic, 'maria', 'cs_test', 'sub_', 'pi_st1']) assert.ok(!all.includes(bad), 'filtra: ' + bad);
    for (const k of env.KV.keys('u:')) assert.ok(!all.includes(k.split(':')[1]), 'filtra el seudónimo de IP');
  });
  test('suma los fragmentos del día y filtra por rango', async () => {
    const env = makeEnv();
    await env.KV.put('stats:2026-10-31:0', JSON.stringify({ v: 1, c: { 'gen.total': 100 } }));
    await env.KV.put('stats:2026-11-01:0', JSON.stringify({ v: 1, c: { 'gen.total': 2, 'leads.total': 1 } }));
    await env.KV.put('stats:2026-11-01:3', JSON.stringify({ v: 1, c: { 'gen.total': 5 } }));
    await env.KV.put('stats:2026-11-02:1', JSON.stringify({ v: 1, c: { 'gen.total': 1 } }));
    await env.KV.put('stats:2026-11-02:2', 'no es json');
    await env.KV.put('stats:2026-12-01:0', JSON.stringify({ v: 1, c: { 'gen.total': 100 } }));
    const s = await (await stats(env, '?desde=2026-11-01&hasta=2026-11-30')).json();
    assert.equal(s.kpis.generaciones, 8);
    assert.deepEqual(s.serie.slice(0, 3).map(d => d.generaciones), [7, 1, 0]);
    // Rango que cruza meses
    const s2 = await (await stats(env, '?desde=2026-10-31&hasta=2026-11-01')).json();
    assert.equal(s2.kpis.generaciones, 107);
  });
  test('licencias anteriores al panel (sin metadatos) también cuentan en la foto actual', async () => {
    const env = makeEnv();
    await env.KV.put('lic:al_' + '1'.repeat(36), JSON.stringify({ key: 'al_' + '1'.repeat(36), active: true, plan: 'fundador' }));
    await env.KV.put('lic:al_' + '2'.repeat(36), JSON.stringify({ key: 'al_' + '2'.repeat(36), active: true, plan: 'pro' }));
    await env.KV.put('lic:al_' + '3'.repeat(36), JSON.stringify({ key: 'al_' + '3'.repeat(36), active: false, plan: 'pro' }));
    const s = await (await stats(env)).json();
    assert.equal(s.actual.fundador_activos, 1);
    assert.equal(s.actual.pro_sin_periodicidad, 1);
    assert.equal(s.actual.inactivas, 1);
    assert.equal(s.actual.mrr_estimado_eur, 9);
    assert.equal(s.actual.parcial, false);
  });
  test('cambio mensual → anual en el portal (subscription.updated) actualiza la periodicidad y el MRR', async () => {
    const env = makeEnv();
    await hook(env, 'checkout.session.completed', { id: 'cs_test_st_cambio0001', mode: 'subscription', payment_status: 'paid', subscription: 'sub_c', amount_total: 900 });
    assert.equal((await (await stats(env)).json()).actual.mrr_estimado_eur, 9);
    await hook(env, 'customer.subscription.updated', { id: 'sub_c', status: 'active', items: { data: [{ price: { recurring: { interval: 'year' } } }] } });
    const s = await (await stats(env)).json();
    assert.equal(s.actual.pro_anual, 1);
    assert.equal(s.actual.mrr_estimado_eur, 5.75);
    assert.equal(s.bajas.total, 0);
    // Impago definitivo → baja con su motivo
    await hook(env, 'customer.subscription.updated', { id: 'sub_c', status: 'unpaid' });
    assert.deepEqual((await (await stats(env)).json()).bajas.por_motivo, { unpaid: 1 });
  });
  test('renovaciones (invoice.paid subscription_cycle): idempotentes por factura', async () => {
    const env = makeEnv();
    const inv = { id: 'in_st_1', billing_reason: 'subscription_cycle', subscription: 'sub_x', amount_paid: 900, lines: { data: [{ price: { recurring: { interval: 'month' } } }] } };
    await hook(env, 'invoice.paid', inv);
    await hook(env, 'invoice.paid', inv);
    await hook(env, 'invoice.paid', { ...inv, id: 'in_st_2', billing_reason: 'subscription_create' });
    const s = await (await stats(env)).json();
    assert.deepEqual(s.renovaciones, { total: 1, por_plan: { 'pro-mensual': 1, 'pro-anual': 0, pro: 0 } });
    assert.equal(s.ingresos.cobrados_stripe_eur['renov-pro-mensual'], 9);
  });
  test('escrituras de KV: una por evento como máximo en las rutas calientes', async () => {
    const env = makeEnv();
    calls = mockFetch(() => new Response(sseBody(['ok']), { headers: { 'content-type': 'text/event-stream' } }));
    const before = env.KV.puts;
    await run(env, req('/api/generate', { method: 'POST', body: validSA() }));
    assert.equal(env.KV.puts - before, 2, 'cupo + métricas');
  });
});

describe('panel /admin/ (shared/admin.html → produccion/public/admin/index.html)', () => {
  const root = new URL('../', import.meta.url);
  const read = p => readFileSync(new URL(p, root), 'utf8');
  const html = read('shared/admin.html');
  const inline = (h, tag) => [...h.matchAll(new RegExp(`<${tag}(\\s[^>]*)?>([\\s\\S]*?)<\\/${tag}>`, 'g'))].filter(m => !/src=/.test(m[1] || '')).map(m => m[2]);
  test('build.py lo copia sin cambios y el script compila', () => {
    assert.equal(read('produccion/public/admin/index.html'), html);
    const scripts = inline(html, 'script');
    assert.equal(scripts.length, 1);
    assert.doesNotThrow(() => new vm.Script(scripts[0], { filename: 'admin.html' }));
  });
  test('noindex, sin recursos externos, sin innerHTML, token solo en sessionStorage', () => {
    assert.match(html, /<meta name="robots" content="noindex/);
    assert.doesNotMatch(html, /\s(src|href)="https?:/, 'sin CDN, fuentes ni librerías externas');
    assert.doesNotMatch(html, /fonts\.googleapis|cdn\.|<script[^>]+src=/);
    assert.doesNotMatch(html, /innerHTML|outerHTML|insertAdjacentHTML|document\.write|eval\(|new Function/);
    assert.doesNotMatch(html, /localStorage|document\.cookie/);
    assert.match(html, /sessionStorage\.setItem\(KEY/);
    assert.match(html, /authorization: 'Bearer ' \+ token/);
    assert.match(html, /fetch\('\/api\/admin\/stats\?/);
    assert.doesNotMatch(html, /\sstyle="/, 'la CSP de /admin/ no permite atributos style');
  });
  test('_headers: CSP estricta para /admin y /admin/* con el hash del script y del estilo', () => {
    const blocks = read('produccion/public/_headers').split(/\n(?=\/)/);
    for (const path of ['/admin', '/admin/*']) {
      const b = blocks.find(x => x.split('\n')[0].trim() === path);
      assert.ok(b, 'falta la regla ' + path);
      assert.match(b, /Content-Security-Policy: default-src 'none'/);
      for (const [tag, dir] of [['script', 'script-src'], ['style', 'style-src']]) {
        const src = b.match(new RegExp(dir + "[^;]*"))[0];
        assert.doesNotMatch(src, /unsafe-inline|unsafe-eval|https?:|'self'/, dir);
        for (const code of inline(html, tag)) assert.ok(src.includes(createHash('sha256').update(code, 'utf8').digest('base64')), `${path}: hash de ${tag}`);
      }
      assert.match(b, /connect-src 'self'/);
      assert.match(b, /frame-ancestors 'none'/);
      assert.match(b, /form-action 'none'/);
      assert.match(b, /X-Robots-Tag: noindex/);
      assert.match(b, /Cache-Control: no-store/);
    }
  });
  test('el panel usa los campos que devuelve el endpoint', () => {
    const s = aggregateStats(statsRange('2026-11-01', '2026-11-02'), new Map(), { activas: { fundador: 0, 'pro-mensual': 0, 'pro-anual': 0, pro: 0 }, inactivas: 0 });
    for (const path of ['kpis.leads_fundador', 'actual.mrr_estimado_eur', 'actual.plazas_fundador', 'kpis.conversion_lead_pago', 'top.comunidades', 'embudo.pasos', 'ingresos.estimados_eur', 'ingresos.cobrados_stripe_eur', 'afiliados.comision_estimada_eur', 'kpis.tasa_error']) {
      assert.notEqual(path.split('.').reduce((o, k) => o && o[k], s), undefined, path);
      assert.ok(html.includes(path.split('.').pop()), 'el panel no usa ' + path);
    }
    assert.deepEqual(Object.keys(s.ingresos.precios_eur), Object.keys(PRICES));
  });
});
