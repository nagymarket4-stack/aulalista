// Tests del motor de producción (shared/engine.web.js) con fetch, localStorage y location simulados.
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { sseBody } from './helpers.mjs';

const code = readFileSync(new URL('../shared/engine.web.js', import.meta.url), 'utf8') + '\n;globalThis.Engine = Engine;';
const LIC = 'al_' + 'c'.repeat(36);

function load({ fetchImpl, search = '', stored = {} } = {}) {
  const ls = new Map(Object.entries(stored));
  const calls = [];
  const ctx = {
    fetch: async (url, init) => { calls.push({ url, init }); return fetchImpl(url, init); },
    localStorage: { getItem: k => ls.has(k) ? ls.get(k) : null, setItem: (k, v) => ls.set(k, String(v)), removeItem: k => ls.delete(k) },
    location: { search, pathname: '/app', hash: '' },
    history: { replaceState: (a, b, url) => { ctx.replaced = url; } },
    URLSearchParams, TextDecoder, Response, Blob, URL, setTimeout, console
  };
  vm.createContext(ctx);
  vm.runInContext(code, ctx);
  return { Engine: ctx.Engine, ls, calls, ctx };
}
const stream = (s, headers = {}) => new Response(s, { headers: { 'content-type': 'text/event-stream', 'x-plan': 'free', 'x-usage-used': '1', 'x-usage-limit': '3', ...headers } });

describe('engine.web.js', () => {
  test('concatena los deltas del stream y avisa en cada fragmento', async () => {
    const { Engine } = load({ fetchImpl: () => stream(sseBody(['Hola ', 'mundo'])) });
    const seen = [];
    const text = await Engine.generate('', t => seen.push(t), undefined, { mode: 'sa', d: {} });
    assert.equal(text, 'Hola mundo');
    assert.deepEqual(seen, ['Hola ', 'Hola mundo']);
    assert.deepEqual({ ...(await Engine.usage()) }, { plan: 'Plan Gratis', label: '1/3 este mes' });
  });
  test('stream cortado sin message_stop → error (el texto parcial ya se ha entregado)', async () => {
    const { Engine } = load({ fetchImpl: () => stream(sseBody(['Parcial'], { complete: false })) });
    let last = '';
    await assert.rejects(Engine.generate('', t => { last = t; }, undefined, {}), /se cortó/);
    assert.equal(last, 'Parcial');
  });
  test('stop_reason max_tokens → aviso de documento incompleto', async () => {
    const { Engine } = load({ fetchImpl: () => stream(sseBody(['x'], { stop: 'max_tokens' })) });
    await assert.rejects(Engine.generate('', () => {}, undefined, {}), /longitud máxima/);
  });
  test('evento error del modelo → error legible', async () => {
    const s = sseBody(['a'], { complete: false }) + 'event: error\ndata: {"type":"error","error":{"type":"overloaded_error","message":"Overloaded"}}\n\n';
    const { Engine } = load({ fetchImpl: () => stream(s) });
    await assert.rejects(Engine.generate('', () => {}, undefined, {}), /saturado/);
  });
  test('trozos partidos a mitad de evento y CRLF', async () => {
    const full = sseBody(['uno ', 'dos']).replace(/\n/g, '\r\n');
    const enc = new TextEncoder().encode(full);
    const body = new ReadableStream({ start(c) { for (let i = 0; i < enc.length; i += 7) c.enqueue(enc.slice(i, i + 7)); c.close(); } });
    const { Engine } = load({ fetchImpl: () => stream(body) });
    assert.equal(await Engine.generate('', () => {}, undefined, {}), 'uno dos');
  });
  test('muestra el mensaje del servidor en 400/402/429', async () => {
    for (const st of [400, 402, 429]) {
      const { Engine } = load({ fetchImpl: () => Response.json({ message: 'Mensaje ' + st }, { status: st }) });
      await assert.rejects(Engine.generate('', () => {}, undefined, {}), new RegExp('Mensaje ' + st));
    }
  });
  test('envía la licencia y la olvida si el servidor la marca como inválida', async () => {
    const { Engine, ls, calls } = load({ stored: { 'al-license': JSON.stringify(LIC) }, fetchImpl: () => stream(sseBody(['x']), { 'x-license': 'invalid' }) });
    assert.deepEqual({ ...(await Engine.usage()) }, { plan: 'Pro', label: '' });
    await Engine.generate('', () => {}, undefined, {});
    assert.equal(calls[0].init.headers.authorization, 'Bearer ' + LIC);
    assert.equal(ls.has('al-license'), false);
  });
  test('init: guarda la licencia válida y retira solo session_id de la URL', async () => {
    const { Engine, ls, ctx } = load({ search: '?session_id=cs_test_1&tema=agua', fetchImpl: () => Response.json({ license: LIC }) });
    await Engine.init();
    assert.equal(JSON.parse(ls.get('al-license')), LIC);
    assert.equal(ctx.replaced, '/app?tema=agua');
  });
  test('init: ignora una licencia con formato inesperado', async () => {
    const { Engine, ls } = load({ search: '?session_id=cs_test_1', fetchImpl: () => Response.json({ license: '<img src=x>' }) });
    await Engine.init();
    assert.equal(ls.has('al-license'), false);
  });
});
