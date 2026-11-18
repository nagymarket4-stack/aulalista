// Utilidades compartidas por los tests: KV en memoria, entorno simulado y fetch simulado.
import { createHmac } from 'node:crypto';

export class FakeKV {
  constructor() { this.map = new Map(); this.puts = 0; }
  async get(k, type) {
    const v = this.map.has(k) ? this.map.get(k).value : null;
    if (v == null) return null;
    return type === 'json' ? JSON.parse(v) : v;
  }
  async put(k, v, opts) { this.puts++; this.map.set(k, { value: String(v), opts }); }
  async delete(k) { this.map.delete(k); }
  async list({ prefix = '', cursor, limit = 2 } = {}) {
    // Paginación pequeña a propósito para probar el bucle del cursor
    const keys = [...this.map.keys()].filter(k => k.startsWith(prefix)).sort();
    const start = cursor ? Number(cursor) : 0;
    const page = keys.slice(start, start + limit).map(name => {
      const md = this.map.get(name).opts && this.map.get(name).opts.metadata;
      return md === undefined ? { name } : { name, metadata: md };
    });
    const done = start + limit >= keys.length;
    return { keys: page, list_complete: done, cursor: done ? undefined : String(start + limit) };
  }
  keys(prefix = '') { return [...this.map.keys()].filter(k => k.startsWith(prefix)); }
}

export const ADMIN_TOKEN = 'admin-token-largo-de-prueba-1234567890';
export const WEBHOOK_SECRET = 'whsec_test_secret';

export function makeEnv(over = {}) {
  return {
    KV: new FakeKV(),
    ASSETS: { fetch: async req => new Response('asset:' + new URL(req.url).pathname, { headers: { 'content-type': 'text/html' } }) },
    ANTHROPIC_API_KEY: 'sk-ant-test',
    STRIPE_SECRET_KEY: 'sk_test_x',
    STRIPE_WEBHOOK_SECRET: WEBHOOK_SECRET,
    ADMIN_TOKEN,
    IP_SALT: 'sal-de-prueba',
    PUBLIC_URL: 'https://aulalista.es',
    STRIPE_FOUNDER_LINK: 'https://buy.stripe.com/test_founder',
    ...over
  };
}

export const ctx = () => { const p = []; return { waitUntil: x => p.push(x), pending: p }; };

export function req(path, { method = 'GET', headers = {}, body, ip = '203.0.113.7' } = {}) {
  const h = { 'cf-connecting-ip': ip, ...headers };
  if (body !== undefined && typeof body !== 'string') { body = JSON.stringify(body); h['content-type'] ??= 'application/json'; }
  return new Request('https://aulalista.es' + path, { method, headers: h, body });
}

export function sseBody(texts, { stop = 'end_turn', complete = true } = {}) {
  const ev = (type, data) => `event: ${type}\ndata: ${JSON.stringify({ type, ...data })}\n\n`;
  let s = ev('message_start', { message: { id: 'msg_1' } });
  for (const t of texts) s += ev('content_block_delta', { index: 0, delta: { type: 'text_delta', text: t } });
  if (complete) s += ev('message_delta', { delta: { stop_reason: stop } }) + ev('message_stop', {});
  return s;
}

// Sustituye fetch global; devuelve las llamadas registradas.
export function mockFetch(handler) {
  const calls = [];
  const orig = globalThis.fetch;
  globalThis.fetch = async (url, init = {}) => { calls.push({ url: String(url), init }); return handler(String(url), init); };
  calls.restore = () => { globalThis.fetch = orig; };
  return calls;
}

export function stripeSig(payload, { secret = WEBHOOK_SECRET, t = Math.floor(Date.now() / 1000) } = {}) {
  const v1 = createHmac('sha256', secret).update(`${t}.${payload}`).digest('hex');
  return `t=${t},v1=${v1}`;
}

export const validSA = (over = {}) => ({
  mode: 'sa',
  d: { ccaa: 'canarias', curso: '3º', area: 'Matemáticas', tema: 'Los charcos de marea', sesiones: '6', duracion: '55',
       otras: '', producto: '', contexto: '', criterios: '', niveles: '4', perfil: 'Discapacidad visual', numSA: '8', ...over }
});
