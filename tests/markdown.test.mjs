// Tests del renderizador Markdown de shared/app.template.html (bloque <script id="al-md">).
// El contenido viene del modelo: se trata como NO confiable. Ninguna entrada puede producir
// etiquetas o atributos fuera de la lista blanca.
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const tpl = readFileSync(new URL('../shared/app.template.html', import.meta.url), 'utf8');
const m = tpl.match(/<script id="al-md">([\s\S]*?)<\/script>/);
assert.ok(m, 'no se encuentra <script id="al-md"> en app.template.html');
const sandbox = { module: { exports: {} } };
vm.runInNewContext(m[1], sandbox);
const { md, esc } = sandbox.module.exports;

const ALLOWED = new Set(['h1', 'h2', 'h3', 'h4', 'p', 'ul', 'ol', 'li', 'table', 'thead', 'tbody', 'tr', 'th', 'td', 'b', 'i', 'br', 'hr', 'span']);
function assertSafe(html, src) {
  // Todo '<' del contenido llega escapado, así que cada '<' de la salida debe ser una etiqueta permitida y sin atributos
  // (salvo class="verif" en <span>).
  const re = /<\/?([a-zA-Z0-9]+)([^>]*)>/g;
  let t, count = 0;
  while ((t = re.exec(html))) {
    count++;
    assert.ok(ALLOWED.has(t[1].toLowerCase()), `etiqueta no permitida <${t[1]}> para: ${src}`);
    const attrs = t[2].trim();
    if (attrs) assert.ok(t[1] === 'span' && attrs === 'class="verif"', `atributo no permitido "${attrs}" para: ${src}`);
  }
  const lt = (html.match(/</g) || []).length;
  assert.equal(lt, count, `"<" sin escapar fuera de etiquetas para: ${src}`);
  assert.doesNotMatch(html, /<[^>]*\son\w+\s*=/i);
}

const PAYLOADS = [
  '<script>alert(1)</script>',
  '<img src=x onerror=alert(1)>',
  '<svg/onload=alert(1)>',
  '"><img src=x onerror=alert(1)>',
  "'><iframe src=javascript:alert(1)>",
  '[clic](javascript:alert(1))',
  '<a href="javascript:alert(1)">x</a>',
  '<br onmouseover=alert(1)>',
  '<br/ onload=alert(1)>',
  '<BR ONCLICK=alert(1)>',
  '&lt;script&gt;alert(1)&lt;/script&gt;',
  '<style>*{display:none}</style>',
  '<!-- <script>x</script> -->',
  '<math><mi xlink:href="javascript:alert(1)">x</mi></math>',
  '**<img src=x onerror=alert(1)>**',
  '*<script>x</script>*',
  '[VERIFICAR CON DECRETO]<img src=x onerror=1>',
  '<span class="verif" onclick="alert(1)">x</span>',
  '</td></tr></table><script>alert(1)</script>',
  '<script>alert(1)</script>',
  '<scr<script>ipt>alert(1)</scr</script>ipt>'
];
const CONTEXTS = [
  p => p,
  p => '# ' + p,
  p => '#### ' + p,
  p => '- ' + p,
  p => '1. ' + p,
  p => '| ' + p + ' | b |\n|---|---|\n| ' + p + ' | ' + p + '<br>' + p + ' |',
  p => 'texto\n' + p + '\nmás texto',
  p => '**' + p + '**',
  p => '| a |\n|---|\n| x <br> ' + p + ' |'
];

describe('Markdown: XSS', () => {
  for (const p of PAYLOADS) {
    test('neutraliza: ' + p.slice(0, 50), () => {
      for (const c of CONTEXTS) { const src = c(p); assertSafe(md(src), src); }
    });
  }
  test('las entidades del contenido se muestran literalmente (no se decodifican)', () => {
    assert.equal(md('&lt;b&gt;'), '<p>&amp;lt;b&amp;gt;</p>');
  });
  test('esc escapa las comillas', () => {
    assert.equal(esc(`<a href="x" title='y'>&`), '&lt;a href=&quot;x&quot; title=&#39;y&#39;&gt;&amp;');
  });
  test('fuzz: 3000 cadenas aleatorias con caracteres peligrosos', () => {
    const alphabet = ['<', '>', '"', "'", '&', '*', '**', '|', '#', '-', '1.', '\n', ' ', 'br', '<br>', 'script', 'on', '=', '/', '[VERIFICAR CON DECRETO]', 'a', 'é'];
    let seed = 42; const rnd = () => (seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648;
    for (let n = 0; n < 3000; n++) {
      let s = ''; const len = 1 + Math.floor(rnd() * 40);
      for (let i = 0; i < len; i++) s += alphabet[Math.floor(rnd() * alphabet.length)];
      assertSafe(md(s), JSON.stringify(s));
    }
  });
});

describe('Markdown: funcionamiento', () => {
  test('encabezados, listas, tablas, negrita, cursiva y marca VERIFICAR', () => {
    const html = md('## Título\n\n- uno\n- **dos**\n\n1. a\n2. *b*\n\n| A | B |\n|---|:--|\n| x<br>y | [VERIFICAR CON DECRETO] |\n\n---\nPárrafo\ncontinuado');
    assert.match(html, /<h2>Título<\/h2>/);
    assert.match(html, /<ul><li>uno<\/li><li><b>dos<\/b><\/li><\/ul>/);
    assert.match(html, /<ol><li>a<\/li><li><i>b<\/i><\/li><\/ol>/);
    assert.match(html, /<th>A<\/th><th>B<\/th>/);
    assert.match(html, /<td>x<br>y<\/td><td><span class="verif">VERIFICAR<\/span><\/td>/);
    assert.match(html, /<hr><p>Párrafo continuado<\/p>/);
  });
  test('entradas límite no cuelgan el renderizador', () => {
    for (const s of ['', null, undefined, '#####', '##### cinco', '|', '|---|', ' ', '- ', '1)', '***', '  #', '#\t']) assert.equal(typeof md(s), 'string');
  });
  test('rendimiento: línea adversarial de 50 000 caracteres < 1 s', () => {
    const t0 = Date.now();
    md('*a'.repeat(25000)); md('**'.repeat(25000)); md('|' + 'x|'.repeat(25000));
    assert.ok(Date.now() - t0 < 1000, 'demasiado lento: ' + (Date.now() - t0) + ' ms');
  });
});
