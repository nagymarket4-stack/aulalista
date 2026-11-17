// Comprobaciones de los HTML generados por build.py: sintaxis de cada <script> en línea,
// CSP de public/_headers coherente con los scripts y coherencia UI ↔ validación del Worker.
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import vm from 'node:vm';
import { PERFILES, TEXT_LIMITS } from '../produccion/src/worker.js';

const root = new URL('../', import.meta.url);
const read = p => readFileSync(new URL(p, root), 'utf8');
const inlineScripts = html => [...html.matchAll(/<script(\s[^>]*)?>([\s\S]*?)<\/script>/g)].filter(m => !/src=/.test(m[1] || '')).map(m => m[2]);
const FILES = ['dist/prototipo.html', 'produccion/public/app.html', 'produccion/public/index.html'];

describe('HTML generados', () => {
  for (const f of FILES) {
    test(`${f}: los <script> en línea compilan`, () => {
      const scripts = inlineScripts(read(f));
      assert.ok(scripts.length > 0);
      scripts.forEach((code, i) => assert.doesNotThrow(() => new vm.Script(code, { filename: `${f}#script${i}` }), `script ${i}`));
    });
  }
  test('los marcadores de build.py se han sustituido', () => {
    for (const f of FILES) assert.doesNotMatch(read(f), /\/\*__(PROMPTS|ENGINE)__\*\//, f);
  });
  test('public/_headers existe y su CSP contiene el hash de cada script en línea', () => {
    assert.ok(existsSync(new URL('produccion/public/_headers', root)), 'ejecuta python3 build.py');
    const headers = read('produccion/public/_headers');
    for (const [f, path] of [['produccion/public/app.html', '/app'], ['produccion/public/index.html', '/']]) {
      const block = headers.split(/\n(?=\/)/).find(b => b.split('\n')[0].trim() === path);
      assert.ok(block, 'falta la regla ' + path);
      assert.match(block, /Content-Security-Policy: default-src 'none'/);
      assert.doesNotMatch(block.match(/script-src[^;]*/)[0], /unsafe-inline|unsafe-eval/);
      for (const code of inlineScripts(read(f))) {
        const h = createHash('sha256').update(code, 'utf8').digest('base64');
        assert.ok(block.includes(`'sha256-${h}'`), `${f}: falta el hash de un script (¿has ejecutado build.py?)`);
      }
      assert.match(block, /frame-ancestors 'none'/);
    }
    assert.match(headers, /X-Content-Type-Options: nosniff/);
  });
  test('las CDN usadas en app.html están permitidas por la CSP', () => {
    const html = read('produccion/public/app.html');
    const headers = read('produccion/public/_headers');
    for (const [, src] of html.matchAll(/<script[^>]*\ssrc="([^"]+)"/g)) assert.ok(headers.includes(src), src);
  });
});

describe('coherencia UI ↔ Worker', () => {
  const tpl = read('shared/app.template.html');
  test('los perfiles del <select id="perfil"> son exactamente los que acepta el Worker', () => {
    const sel = tpl.match(/<select id="perfil">([\s\S]*?)<\/select>/)[1];
    const opts = [...sel.matchAll(/<option>([^<]+)<\/option>/g)].map(m => m[1]);
    assert.deepEqual([...opts].sort(), [...PERFILES].sort());
  });
  test('los maxlength de la UI coinciden con TEXT_LIMITS del Worker', () => {
    for (const [id, max] of Object.entries(TEXT_LIMITS)) {
      const m = tpl.match(new RegExp(`id="${id}"[^>]*maxlength="(\\d+)"`));
      assert.ok(m, 'sin maxlength: ' + id);
      assert.equal(Number(m[1]), max, id);
    }
  });
  test('la landing envía el consentimiento RGPD que exige /api/lead', () => {
    assert.match(read('shared/landing.html'), /rgpd:\s*document\.getElementById\('rgpd'\)\.checked/);
  });
});

describe('UI del módulo opositor', () => {
  const tpl = read('shared/app.template.html');
  test('pestaña Opositor y herramientas que coinciden con los modos del Worker', async () => {
    const { MODES } = await import('../produccion/src/worker.js');
    assert.match(tpl, /data-mode="opositor"/);
    const sel = tpl.match(/<select id="opTool">([\s\S]*?)<\/select>/)[1];
    const vals = [...sel.matchAll(/value="([^"]+)"/g)].map(m => m[1]);
    assert.deepEqual(vals, ['oposicion', 'exposicion', 'validador']);
    for (const v of vals.filter(v => v !== 'validador')) assert.ok(MODES.includes(v), v);
    assert.ok(!MODES.includes('validador'), 'el validador no usa el Worker');
  });
  test('el selector de SA para oposición ofrece exactamente 6–12 (lo que acepta el Worker)', () => {
    const sel = tpl.match(/<select id="numSAop">([\s\S]*?)<\/select>/)[1];
    assert.deepEqual([...sel.matchAll(/<option[^>]*>(\d+)<\/option>/g)].map(m => +m[1]), [6, 7, 8, 9, 10, 11, 12]);
  });
  test('aviso de originalidad visible en el modo opositor', () => {
    assert.match(tpl, /class="notice f-op[^"]*"[^>]*>[^<]*califican con <b>0<\/b>/);
  });
  test('el validador solo acepta .md/.txt (sin dependencias de red)', () => {
    assert.match(tpl, /id="pdFile" type="file" accept="\.md,\.txt/);
    assert.doesNotMatch(tpl, /jszip/i);
  });
});
