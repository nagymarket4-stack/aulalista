// Comprueba que los ejemplos de SA de Canarias (seo/ejemplos/canarias/**) citan literalmente
// criterios, competencias, descriptores, saberes y descriptores de rúbrica de data/canarias/primaria.
//   node seo/verificar-ejemplos.mjs
// Sale con código 1 si encuentra algún error.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const SEO = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.dirname(SEO);
const DATA = path.join(ROOT, 'data', 'canarias', 'primaria');
const DIR = path.join(SEO, 'ejemplos', 'canarias');

// slug de seo/areas.json → fichero de data/canarias/primaria
const AREA_DATA = {
  'conocimiento-del-medio': 'conocimiento-del-medio-natural-social-y-cultural',
  'educacion-artistica': 'educacion-artistica',
  'educacion-emocional': 'educacion-emocional-y-para-la-creatividad',
  'valores-civicos': 'educacion-en-valores-civicos-y-eticos',
  'educacion-fisica': 'educacion-fisica',
  'lengua-castellana': 'lengua-castellana-y-literatura',
  'ingles': 'lengua-extranjera',
  'segunda-lengua': 'segunda-lengua-extranjera',
  'matematicas': 'matematicas'
};
const NIVELES = ['Insuficiente', 'Suficiente/Bien', 'Notable', 'Sobresaliente'];
const cicloDe = n => (n <= 2 ? 'primer' : n <= 4 ? 'segundo' : 'tercer');
const ROM = { I: 1, II: 2, III: 3, IV: 4, V: 5, VI: 6, VII: 7 };
const norm = s => String(s).replace(/\s+/g, ' ').trim();
const cells = r => r.trim().replace(/^\||\|$/g, '').split('|').map(x => x.trim());

function saberesIndex(d, ciclo) {
  const idx = new Map();
  for (const b of d.saberes[ciclo]) {
    const rom = b.bloque.split('.')[0].trim();
    const items = [...(b.apartados || []).flatMap(a => a.items), ...(b.items || [])];
    for (const it of items) {
      const m = it.match(/^((?:\d+\.)+)\s*(.*)$/);
      const code = `${rom}.${m[1].replace(/\.$/, '')}`;
      // Códigos repetidos en el JSON (numeración ambigua): no se pueden citar
      idx.set(code, idx.has(code) ? null : { texto: m[2], bloque: b.bloque });
    }
  }
  return idx;
}

function seccion(body, n) {
  const m = body.match(new RegExp(`\\n## ${n}\\. [^\\n]*\\n([\\s\\S]*?)(?=\\n## \\d+\\. |$)`));
  return m ? m[1] : null;
}
function tablaTras(texto, cabecera) {
  const lines = texto.split('\n');
  const i = lines.findIndex(l => l.startsWith(cabecera));
  if (i < 0) return null;
  const rows = [];
  for (let j = i; j < lines.length && /^\s*\|/.test(lines[j]); j++) rows.push(lines[j]);
  return rows.filter(r => !/^\s*\|?\s*:?-{2,}/.test(r)).map(cells);
}

const files = fs.readdirSync(DIR, { recursive: true }).filter(f => f.endsWith('.md')).sort();
let errores = 0, avisos = 0, comprobados = 0;
for (const rel of files) {
  const file = path.join(DIR, rel);
  const err = msg => { errores++; console.log(`ERROR ${rel}: ${msg}`); };
  const src = fs.readFileSync(file, 'utf8').replace(/\r/g, '');
  const fm = src.match(/^---\n([\s\S]*?)\n---\n/);
  const meta = Object.fromEntries((fm ? fm[1] : '').split('\n').map(l => [l.slice(0, l.indexOf(':')).trim(), l.slice(l.indexOf(':') + 1).trim()]));
  const body = fm ? src.slice(fm[0].length) : src;
  const areaSlug = rel.split(path.sep)[0];
  const dataFile = AREA_DATA[areaSlug];
  if (!dataFile) { err(`área ${areaSlug} sin correspondencia en data/canarias/primaria`); continue; }
  const curso = parseInt(meta.curso || (rel.match(/\.(\d)\.md$/) || [])[1], 10);
  if (!curso) { err('sin curso en la cabecera'); continue; }
  const ciclo = cicloDe(curso);
  const d = JSON.parse(fs.readFileSync(path.join(DATA, `${dataFile}.json`), 'utf8'));
  const rub = JSON.parse(fs.readFileSync(path.join(DATA, 'rubricas', `${dataFile}.json`), 'utf8'));
  if (!d.ciclos[ciclo]) { err(`el área no tiene ${ciclo} ciclo`); continue; }
  const crit = new Map(d.ciclos[ciclo].criterios.map(c => [c.id, c]));
  const comp = new Map(d.competencias.map(c => [c.id, c]));
  const rubC = new Map(rub.ciclos[ciclo].map(c => [c.criterio, c]));
  const sab = saberesIndex(d, ciclo);

  if (/\[VERIFICAR CON DECRETO\]/.test(body)) err('quedan marcas [VERIFICAR CON DECRETO]');
  if (!/^(false|no)$/i.test(meta.revisado || '')) { avisos++; console.log(`AVISO ${rel}: revisado = ${meta.revisado}`); }

  // 3. Fundamentación curricular
  const s3 = seccion(body, 3);
  if (!s3) { err('falta el apartado 3'); continue; }
  const t3 = tablaTras(s3, '| Competencia específica');
  if (!t3) { err('falta la tabla de fundamentación curricular'); continue; }
  const citados = new Set();
  const sabCitados = new Set();
  for (const r of t3.slice(1)) {
    const [ce, cr, desc, sb] = r;
    const mc = cr.match(/^\*\*(\d+\.\d+)\.\*\* (.*)$/);
    if (!mc) { err(`criterio sin formato: ${cr.slice(0, 60)}`); continue; }
    const c = crit.get(mc[1]);
    if (!c) { err(`criterio ${mc[1]} no existe en el ${ciclo} ciclo`); continue; }
    citados.add(c.id);
    if (norm(mc[2]) !== norm(c.texto)) err(`criterio ${c.id}: el texto no es literal`);
    const mce = ce.match(/^\*\*(C\d+)(\.\*\* (.*)|\*\* \(continuación\))$/);
    if (!mce) err(`competencia sin formato en ${c.id}`);
    else {
      if (mce[1] !== c.competencia) err(`criterio ${c.id}: pertenece a ${c.competencia}, no a ${mce[1]}`);
      if (mce[3] && norm(mce[3]) !== norm(comp.get(mce[1]).enunciado)) err(`competencia ${mce[1]}: el enunciado no es literal`);
    }
    if (norm(desc) !== c.descriptores.join(', ')) err(`criterio ${c.id}: descriptores ${desc} ≠ ${c.descriptores.join(', ')}`);
    for (const code of sb.split(',').map(x => x.trim()).filter(Boolean)) {
      if (!sab.has(code)) err(`criterio ${c.id}: el saber ${code} no existe en el ${ciclo} ciclo`);
      else if (sab.get(code) === null) err(`criterio ${c.id}: el saber ${code} tiene numeración ambigua en el JSON`);
      sabCitados.add(code);
    }
  }
  // Lista literal de saberes
  const listados = new Set();
  for (const m of s3.matchAll(/^- \*\*([IVX]+(?:\.\d+)+)\.\*\* (.*?)(?: \*\(([^)]*)\)\*)?$/gm)) {
    const s = sab.get(m[1]);
    listados.add(m[1]);
    if (!s) { err(`saber ${m[1]} no existe o es ambiguo`); continue; }
    if (norm(m[2]) !== norm(s.texto)) err(`saber ${m[1]}: el texto no es literal`);
    if (m[3] && norm(m[3]) !== norm(s.bloque.replace(/\.$/, ''))) err(`saber ${m[1]}: el bloque no coincide`);
  }
  for (const c of sabCitados) if (!listados.has(c)) err(`el saber ${c} está en la tabla pero no en la lista literal`);
  for (const c of listados) if (!sabCitados.has(c)) err(`el saber ${c} está en la lista pero no en la tabla`);
  // Técnicas, herramientas e instrumentos
  const tti = tablaTras(s3, '| Criterio | Técnicas | Herramientas |');
  if (!tti) err('falta la tabla de técnicas, herramientas e instrumentos');
  else for (const r of tti.slice(1)) if (!citados.has(r[0])) err(`técnicas: criterio ${r[0]} no está en la fundamentación`);

  // 7. Evaluación
  const s7 = seccion(body, 7) || '';
  if (!/### Productos y tipos de evaluación según el agente/.test(s7)) err('faltan los tipos de evaluación según el agente');
  for (const t of ['Heteroevaluación', 'Coevaluación', 'Autoevaluación']) if (!new RegExp(t, 'i').test(s7)) err(`no aparece ${t.toLowerCase()}`);
  const tr = tablaTras(s7, '| Criterio y evidencia en el producto');
  if (!tr) err('falta la rúbrica con niveles oficiales');
  else {
    if (tr[0].slice(1).join('|') !== NIVELES.join('|')) err(`niveles de la rúbrica: ${tr[0].slice(1).join(', ')}`);
    const enRubrica = new Set();
    for (const r of tr.slice(1)) {
      const id = (r[0].match(/^\*\*(\d+\.\d+)\.\*\*/) || [])[1];
      const rc = rubC.get(id);
      if (!rc) { err(`rúbrica: el criterio ${id} no está en la rúbrica oficial del ${ciclo} ciclo`); continue; }
      if (!citados.has(id)) err(`rúbrica: el criterio ${id} no está en la fundamentación`);
      enRubrica.add(id);
      NIVELES.forEach((n, k) => { if (norm(r[k + 1]) !== norm(rc.descriptores[n])) err(`rúbrica ${id}, ${n}: el descriptor no es literal`); });
    }
    for (const c of citados) if (!enRubrica.has(c)) err(`el criterio ${c} no tiene fila en la rúbrica`);
  }
  if (!/Resolución de 15 de mayo de 2025|Resolución de 15\/05\/2025/.test(s7)) err('la rúbrica no cita la Resolución de 15/05/2025');
  for (const [, t] of s7.matchAll(/\n\| (\d+\.\d+) \|/g)) if (!citados.has(t)) err(`evaluación: criterio ${t} no está en la fundamentación`);
  // Criterios mencionados en el resto del texto
  for (const m of body.matchAll(/criterios? (\d+\.\d+)/g)) if (!citados.has(m[1])) err(`se menciona el criterio ${m[1]}, que no está en la fundamentación`);

  // Apartados de la plantilla oficial
  if (!/\n## \d+\. Programas, planes y ejes temáticos de la Red Canaria-InnovAS\n/.test(body)) err('falta el apartado de la Red Canaria-InnovAS');
  if (!/\n## \d+\. Valoración del ajuste\n[\s\S]*Desarrollo[\s\S]*Propuestas de mejora/.test(body)) err('falta la valoración del ajuste (desarrollo y propuestas de mejora)');
  // Numeración de apartados correlativa
  const nums = [...body.matchAll(/^## (\d+)\. /gm)].map(m => +m[1]);
  if (nums.some((n, i) => n !== i + 1)) err(`apartados no correlativos: ${nums.join(', ')}`);
  comprobados++;
}
console.log(`Ejemplos comprobados: ${comprobados}/${files.length} · errores: ${errores} · avisos: ${avisos}`);
process.exit(errores ? 1 : 0);
