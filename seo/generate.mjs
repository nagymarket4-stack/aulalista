#!/usr/bin/env node
// AulaLista · Generador de SEO programático (sin dependencias, Node >= 18)
// Uso:  node seo/generate.mjs            (genera produccion/public/recursos, sitemap.xml y robots.txt)
//       node seo/generate.mjs --dry      (solo cuenta páginas, no escribe)
// Fuentes de datos: shared/prompts.js (CCAA, decretos, áreas por curso), seo/areas.json, seo/temas.json,
// seo/config.json y seo/ejemplos/<ccaa>/<area>/<tema>[.<curso>].md

import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const SEO = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(SEO, '..');
const PUB = path.join(ROOT, 'produccion/public');
const OUT = path.join(PUB, 'recursos');
const DRY = process.argv.includes('--dry');
const HOY = new Date().toISOString().slice(0, 10);

// ---------- Datos ----------
function cargarPrompts() {
  const code = fs.readFileSync(path.join(ROOT, 'shared/prompts.js'), 'utf8');
  const sandbox = { module: { exports: {} } };
  vm.createContext(sandbox);
  vm.runInContext(code, sandbox, { filename: 'prompts.js' });
  return sandbox.module.exports;
}
const P = cargarPrompts();
const readJSON = f => JSON.parse(fs.readFileSync(path.join(SEO, f), 'utf8'));
const CONFIG = readJSON('config.json');
const AREAS = readJSON('areas.json').areas;
const TEMAS = readJSON('temas.json').temas;
const BASE = CONFIG.baseUrl.replace(/\/$/, '');
const areaPorSlug = Object.fromEntries(AREAS.map(a => [a.slug, a]));

const COMUNIDADES = CONFIG.ccaa.map(id => {
  const c = P.CCAA.find(x => x.id === id);
  if (!c) throw new Error(`Comunidad desconocida en config.json: ${id}`);
  return c;
});
const corta = c => c.name.replace(/^Comunidad de /, '');
// Nombre con artículo para usar en prosa: «en la Comunidad de Madrid», «en el País Vasco»
const nom = c => /^(Comunidad|Comunitat|Región)\b/.test(c.name) ? 'la ' + c.name : /^País\b/.test(c.name) ? 'el ' + c.name : c.name;

// ---------- Validación del catálogo ----------
(function validarCatalogo() {
  const err = [];
  const slugs = new Set();
  for (const t of TEMAS) {
    for (const k of ['slug', 'titulo', 'area', 'cursos', 'reto', 'producto', 'keywords']) if (!t[k]) err.push(`${t.slug || '?'}: falta ${k}`);
    if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(t.slug)) err.push(`${t.slug}: slug no válido`);
    if (slugs.has(t.slug)) err.push(`${t.slug}: slug duplicado`);
    slugs.add(t.slug);
    if (!areaPorSlug[t.area]) err.push(`${t.slug}: área desconocida ${t.area}`);
    for (const n of t.cursos || []) if (!(n >= 1 && n <= 6)) err.push(`${t.slug}: curso no válido ${n}`);
    for (const s of t.saberes || []) if (!(areaPorSlug[t.area]?.bloques || {})[s]) err.push(`${t.slug}: bloque de saberes desconocido ${s}`);
    for (const a of t.conexiones || []) if (!areaPorSlug[a]) err.push(`${t.slug}: conexión desconocida ${a}`);
    for (const k of Object.keys(t.porCiclo || {})) if (!['1', '2', '3'].includes(k) || !t.cursos.some(n => String(n <= 2 ? 1 : n <= 4 ? 2 : 3) === k)) err.push(`${t.slug}: porCiclo con ciclo no válido ${k}`);
  }
  for (const a of AREAS) if (!P.AREAS_BASE.includes(a.nombre) && !P.CCAA.some(c => (c.extra || []).some(e => (e.name || e) === a.nombre)))
    err.push(`área ${a.slug}: el nombre "${a.nombre}" no existe en shared/prompts.js`);
  if (err.length) { console.error('Errores en el catálogo:\n - ' + err.join('\n - ')); process.exit(1); }
})();

// ---------- Utilidades ----------
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const cursoTxt = n => `${n}.º`;                 // texto visible: 3.º
const cursoApp = n => P.CURSOS[n - 1];          // valor de la app: 3º
const cursoSlug = n => `${n}-primaria`;
const cicloN = n => (n <= 2 ? 1 : n <= 4 ? 2 : 3);
const EDADES = { 1: '6 y 7', 2: '7 y 8', 3: '8 y 9', 4: '9 y 10', 5: '10 y 11', 6: '11 y 12' };
const minus = s => s.charAt(0).toLowerCase() + s.slice(1);
const sinPunto = s => s.replace(/[.\s]+$/, '');
const lista = arr => arr.length <= 1 ? (arr[0] || '') : arr.slice(0, -1).join(', ') + ' y ' + arr[arr.length - 1];
function recorta(s, n) {
  if (s.length <= n) return s;
  const cut = s.slice(0, n - 1);
  return cut.slice(0, cut.lastIndexOf(' ')).replace(/[,;:.\s]+$/, '') + '…';
}
const hashNum = s => parseInt(crypto.createHash('md5').update(s).digest('hex').slice(0, 8), 16);

const ODS = { 1: 'Fin de la pobreza', 2: 'Hambre cero', 3: 'Salud y bienestar', 4: 'Educación de calidad', 5: 'Igualdad de género', 6: 'Agua limpia y saneamiento', 7: 'Energía asequible y no contaminante', 8: 'Trabajo decente y crecimiento económico', 9: 'Industria, innovación e infraestructura', 10: 'Reducción de las desigualdades', 11: 'Ciudades y comunidades sostenibles', 12: 'Producción y consumo responsables', 13: 'Acción por el clima', 14: 'Vida submarina', 15: 'Vida de ecosistemas terrestres', 16: 'Paz, justicia e instituciones sólidas', 17: 'Alianzas para lograr los objetivos' };

// Pedagogía general por ciclo (independiente del área)
const CICLO = {
  1: { nombre: 'primer ciclo', sesiones: 5, agrup: 'parejas y pequeños grupos de 3, con rutinas muy visuales, rincones y mucha manipulación', difusion: 'a las familias o a Educación Infantil', dua: 'pictogramas, apoyos visuales y modelado del docente' },
  2: { nombre: 'segundo ciclo', sesiones: 6, agrup: 'grupos cooperativos de 4 con roles (portavoz, secretaría, material, coordinación) y momentos de trabajo individual', difusion: 'a otras clases del centro y a las familias', dua: 'organizadores gráficos, textos de lectura fácil y opciones de respuesta oral, escrita o gráfica' },
  3: { nombre: 'tercer ciclo', sesiones: 8, agrup: 'equipos de proyecto con roles rotativos, planificación propia de tareas y uso guiado de herramientas digitales', difusion: 'a la comunidad educativa y a destinatarios externos (ayuntamiento, asociaciones, otros centros)', dua: 'andamiajes graduados, elección del formato del producto y listas de autorrevisión' }
};

// ---------- Normativa por comunidad (solo decretos verificados) ----------
function normativa(c) {
  const items = [
    'Ley Orgánica 2/2006, de Educación, modificada por la Ley Orgánica 3/2020 (LOMLOE).',
    'Real Decreto 157/2022, de 1 de marzo, por el que se establecen la ordenación y las enseñanzas mínimas de la Educación Primaria.'
  ];
  if (c.decreto && c.verificado) {
    items.push(c.decreto + '.');
    if (c.evaluacion) items.push(c.evaluacion + '.');
    if (c.diversidad) items.push(c.diversidad + '.');
  } else {
    items.push(`El decreto autonómico de currículo de Educación Primaria vigente en ${nom(c)}.`);
  }
  return items;
}
const decretoCorto = c => (c.decreto && c.verificado) ? c.decreto.split(',')[0] : `decreto de currículo de ${nom(c)}`;
function evaluacionCCAA(c) {
  if (c.id === 'canarias') return 'En Canarias la evaluación es global, continua y formativa, las áreas se evalúan de forma conjunta y la calificación se expresa como Insuficiente, Suficiente, Bien, Notable o Sobresaliente; la promoción se decide al final de cada ciclo.';
  return 'La evaluación es global, continua y formativa, tal como establece el Real Decreto 157/2022, y se concreta en los criterios de evaluación del decreto autonómico.';
}
function curriculoCCAA(c) {
  if (c.id === 'canarias') return 'En el Decreto 211/2022 cada área organiza su currículo en bloques competenciales que vinculan cada competencia específica con sus criterios de evaluación, sus descriptores operativos y los saberes básicos de cada ciclo; la situación de aprendizaje debe tomar de ahí su fundamentación curricular.';
  return `La fundamentación curricular parte de las competencias específicas, los criterios de evaluación y los saberes básicos que concreta para ${nom(c)} el ${decretoCorto(c)}, sobre la base del Real Decreto 157/2022.`;
}

// ---------- Ejemplos (seo/ejemplos) ----------
function frontMatter(src) {
  const m = src.match(/^---\n([\s\S]*?)\n---\n?/);
  if (!m) return { meta: {}, body: src };
  const meta = {};
  for (const l of m[1].split('\n')) { const i = l.indexOf(':'); if (i > 0) meta[l.slice(0, i).trim()] = l.slice(i + 1).trim(); }
  return { meta, body: src.slice(m[0].length) };
}
const siNo = v => /^(s[ií]|true|1|yes)$/i.test(String(v || ''));
function buscarEjemplo(ccaa, area, tema, n, cursosDisponibles) {
  const dir = path.join(SEO, 'ejemplos', ccaa, area);
  const especifico = path.join(dir, `${tema}.${n}.md`);
  const generico = path.join(dir, `${tema}.md`);
  let file = null, propio = false;
  if (fs.existsSync(especifico)) { file = especifico; propio = true; }
  else if (fs.existsSync(generico)) file = generico;
  if (!file) return null;
  const { meta, body } = frontMatter(fs.readFileSync(file, 'utf8').replace(/\r/g, ''));
  const cursoEj = propio ? n : (parseInt(meta.curso, 10) || cursosDisponibles[0]);
  return { meta, body, file: path.relative(ROOT, file), revisado: siNo(meta.revisado), completo: cursoEj === n, cursoEj, mtime: fs.statSync(file).mtime.toISOString().slice(0, 10) };
}

// Markdown mínimo: encabezados, listas, tablas, negrita, cursiva, citas, párrafos
function inlineMd(s) {
  return esc(s)
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/(^|[^*])\*(?!\s)(.+?)\*(?!\*)/g, '$1<em>$2</em>')
    .replace(/\[VERIFICAR CON DECRETO\]/g, '<span class="verif" title="Comprobar con el decreto">VERIFICAR</span>');
}
function md(src, desplazar = 1) {
  const lines = src.split('\n');
  let html = '', i = 0;
  const h = n => Math.min(6, n + desplazar);
  while (i < lines.length) {
    const l = lines[i];
    let m;
    if (!l.trim()) { i++; continue; }
    if ((m = l.match(/^(#{1,6})\s+(.*)$/))) { const n = h(m[1].length); html += `<h${n}>${inlineMd(m[2])}</h${n}>\n`; i++; continue; }
    if (/^\s*\|/.test(l)) {
      const rows = [];
      while (i < lines.length && /^\s*\|/.test(lines[i])) { rows.push(lines[i]); i++; }
      const cells = r => r.trim().replace(/^\||\|$/g, '').split('|').map(x => x.trim());
      const body = rows.filter(r => !/^\s*\|?\s*:?-{2,}/.test(r));
      if (!body.length) continue;
      html += '<div class="tbl"><table><thead><tr>' + cells(body[0]).map(c => `<th>${inlineMd(c)}</th>`).join('') + '</tr></thead><tbody>';
      for (const r of body.slice(1)) html += '<tr>' + cells(r).map(c => `<td>${inlineMd(c)}</td>`).join('') + '</tr>';
      html += '</tbody></table></div>\n';
      continue;
    }
    if (/^\s*[-*]\s+/.test(l) || /^\s*\d+[.)]\s+/.test(l)) {
      const ordered = /^\s*\d+[.)]\s+/.test(l);
      const re = ordered ? /^\s*\d+[.)]\s+/ : /^\s*[-*]\s+/;
      html += ordered ? '<ol>' : '<ul>';
      while (i < lines.length && re.test(lines[i])) { html += `<li>${inlineMd(lines[i].replace(re, ''))}</li>`; i++; }
      html += ordered ? '</ol>\n' : '</ul>\n';
      continue;
    }
    if (/^>\s?/.test(l)) {
      let q = '';
      while (i < lines.length && /^>\s?/.test(lines[i])) { q += lines[i].replace(/^>\s?/, '') + ' '; i++; }
      html += `<blockquote>${inlineMd(q.trim())}</blockquote>\n`;
      continue;
    }
    let p = '';
    while (i < lines.length && lines[i].trim() && !/^(#{1,6}\s|\s*\||\s*[-*]\s|\s*\d+[.)]\s|>)/.test(lines[i])) { p += lines[i].trim() + ' '; i++; }
    if (p) html += `<p>${inlineMd(p.trim())}</p>\n`; else i++;
  }
  return html;
}
// Extracto: hasta el segundo encabezado ## (identificación) para no duplicar el ejemplo completo en otros cursos
function extracto(body) {
  const parts = body.split(/\n(?=##\s)/);
  return parts.slice(0, 2).join('\n');
}

// ---------- Modelo: qué páginas existen ----------
const temaDisponible = (t, c, n) => (!t.ccaa || t.ccaa.includes(c.id)) && t.cursos.includes(n) && P.areasDe(c.id, cursoApp(n)).includes(areaPorSlug[t.area].nombre);
const cursosDe = (t, c) => t.cursos.filter(n => temaDisponible(t, c, n));

const urlTema = (c, n, a, t) => `/recursos/${c.id}/${cursoSlug(n)}/${a}/${t}/`;
const urlCurso = (c, n) => `/recursos/${c.id}/${cursoSlug(n)}/`;
const urlCursoArea = (c, n, a) => `/recursos/${c.id}/${cursoSlug(n)}/${a}/`;
const urlArea = (c, a) => `/recursos/${c.id}/${a}/`;
const urlCCAA = c => `/recursos/${c.id}/`;
const appUrl = (c, n, area, tema) => '/app.html?' + new URLSearchParams({ ccaa: c.id, curso: cursoApp(n), area: area.nombre, tema }).toString();

const paginas = [];   // { url, html, indexable, tipo }
function emit(url, html, indexable, tipo) { paginas.push({ url, html, indexable, tipo }); }

// ---------- Plantilla ----------
function layout({ title, description, url, h1, indexable = true, breadcrumb = [], jsonld = [], body }) {
  const canonical = BASE + url;
  const bc = [{ name: 'AulaLista', url: '/' }, ...breadcrumb];
  const bcLd = { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: bc.map((b, i) => ({ '@type': 'ListItem', position: i + 1, name: b.name, item: BASE + b.url })) };
  const ld = [...jsonld, bcLd].map(o => `<script type="application/ld+json">${JSON.stringify(o).replace(/</g, '\\u003c')}</script>`).join('\n');
  const crumbs = bc.map((b, i) => i === bc.length - 1 ? `<span aria-current="page">${esc(b.name)}</span>` : `<a href="${b.url}">${esc(b.name)}</a>`).join(' <span class="sep">/</span> ');
  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<meta name="robots" content="${indexable ? 'index,follow' : 'noindex,follow'}">
<link rel="canonical" href="${canonical}">
<meta property="og:type" content="website">
<meta property="og:locale" content="es_ES">
<meta property="og:site_name" content="AulaLista">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:url" content="${canonical}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,600;9..144,700&amp;family=Inter:wght@400;500;600&amp;display=swap" rel="stylesheet">
<link rel="stylesheet" href="/recursos/recursos.css">
${ld}
</head>
<body>
<div class="wrap">
<nav class="top"><a class="logo" href="/">Aula<span>Lista</span></a><a class="navcta" href="/app.html">Abrir el generador</a></nav>
<nav class="crumbs" aria-label="Migas de pan">${crumbs}</nav>
<main>
<h1>${esc(h1)}</h1>
${body}
</main>
<footer>
<p><a href="/recursos/">Recursos</a> · ${COMUNIDADES.map(c => `<a href="${urlCCAA(c)}">${esc(corta(c))}</a>`).join(' · ')} · <a href="/">AulaLista</a></p>
<p>AulaLista · Hecho por docentes, para docentes. Las propuestas son orientativas: revisa siempre la redacción literal del decreto de tu comunidad.</p>
</footer>
</div>
</body>
</html>
`;
}

function cta(c, n, area, tema, texto = 'Generar esta situación de aprendizaje') {
  return `<div class="cta"><div><h2>Hazla tuya en 5 minutos</h2><p>Completa «${esc(area.corto)} · ${esc(cursoTxt(n))}» para tu grupo de ${esc(nom(c))}: currículo, sesiones, DUA y rúbrica.</p></div><div><a class="btn alt" href="${esc(appUrl(c, n, area, tema))}">${esc(texto)}</a><p class="sub">3 documentos gratis al mes · sin datos del alumnado</p></div></div>`;
}
const linkList = items => items.length ? '<ul class="links">' + items.map(x => `<li><a href="${x.url}">${esc(x.text)}</a>${x.note ? ` <span class="note">${esc(x.note)}</span>` : ''}</li>`).join('') + '</ul>' : '';

// ---------- Ficha de tema ----------
function secuencia(t, n, area) {
  const N = CICLO[cicloN(n)].sesiones;
  const bloques = (t.saberes || []).map(s => area.bloques[s]);
  const fases = [
    [1, 1, 'Activación y presentación del reto', `Se plantea el reto («${sinPunto(minus(t.reto))}») y su destinatario. Se recogen ideas previas y preguntas del grupo, y se acuerda cómo será el producto final.`],
    [2, Math.max(2, Math.round(N * 0.5)), 'Investigación y aprendizaje', `Las sesiones trabajan los saberes necesarios para resolver el reto${bloques.length ? ` (${lista(bloques.map(minus))})` : ''}, con tareas que dejan evidencias evaluables: ${lista(area.evidencias.slice(0, 2))}.`],
    [Math.max(2, Math.round(N * 0.5)) + 1, N - 1, 'Elaboración del producto', `Los equipos diseñan, prueban y mejoran el producto: ${minus(sinPunto(t.producto))}. Se usan listas de control y coevaluación entre equipos antes de la versión final.`],
    [N, N, 'Difusión, evaluación y cierre', `Presentación del producto ${CICLO[cicloN(n)].difusion}. Autoevaluación con rúbrica, valoración del proceso y propuestas de mejora.`]
  ];
  return '<ol class="fases">' + fases.filter(f => f[1] >= f[0]).map(([a, b, tit, txt]) => `<li><strong>${a === b ? `Sesión ${a}` : `Sesiones ${a}–${b}`} · ${esc(tit)}.</strong> ${esc(txt)}</li>`).join('') + '</ol>';
}

function paginaTema(c, n, t, todos) {
  const area = areaPorSlug[t.area];
  const ciclo = CICLO[cicloN(n)];
  const sesMin = P.sesionPorDefecto(c.id);
  const url = urlTema(c, n, t.area, t.slug);
  const cursosT = cursosDe(t, c);
  const ejemplo = buscarEjemplo(c.id, t.area, t.slug, n, cursosT);
  // Dentro de un mismo ciclo, 3.º y 4.º (por ejemplo) solo difieren en el número de curso: con unoPorCiclo se indexa
  // solo el primer curso del ciclo, salvo que otro curso tenga su propio ejemplo revisado.
  const ejPropio = e => e && e.revisado && e.completo;
  const representante = !CONFIG.indexacion.unoPorCiclo || cursosT.find(x => cicloN(x) === cicloN(n)) === n;
  const indexable = (CONFIG.indexacion.ccaa.includes(c.id) && (t.prioridad || 3) <= CONFIG.indexacion.prioridadMax && representante)
    || (CONFIG.indexacion.siempreConEjemplo && ejPropio(ejemplo));
  const conex = (t.conexiones || []).filter(a => P.areasDe(c.id, cursoApp(n)).includes(areaPorSlug[a].nombre)).map(a => areaPorSlug[a]);
  const areasImpl = [area.corto, ...conex.map(a => a.corto)];
  const ods = (t.ods || []).map(o => `ODS ${o} (${ODS[o]})`);
  const temaApp = `${t.titulo}. ${t.reto}`;

  const title = `${t.titulo} | SA ${cursoTxt(n)} Primaria ${area.corto} · ${corta(c)}`;
  const description = recorta(`Situación de aprendizaje LOMLOE para ${cursoTxt(n)} de Primaria en ${nom(c)}: ${minus(sinPunto(t.reto))}. Producto: ${minus(sinPunto(t.producto))}.`, 158);
  const h1 = `Situación de aprendizaje: ${t.titulo} · ${cursoTxt(n)} Primaria · ${area.corto} · ${c.name}`;

  const contexto = t.contextos && t.contextos[c.id];
  const enfoque = area.ciclos[cicloN(n)] || area.ciclos[3] || '';
  const saberes = (t.saberes || []).map(s => area.bloques[s]);

  let body = `<p class="tags"><span class="tag">${esc(c.name)}</span><span class="tag">${esc(cursoTxt(n))} Primaria · ${esc(ciclo.nombre)}</span><span class="tag">${esc(area.nombre)}</span></p>
<p class="lead">Propuesta de situación de aprendizaje para ${esc(cursoTxt(n))} de Educación Primaria (${esc(ciclo.nombre)}, alumnado de ${EDADES[n]} años) en ${esc(nom(c))}, desde el área de ${esc(area.nombre)}. El trabajo culmina en un producto con destinatario real: ${esc(minus(sinPunto(t.producto)))}.</p>
<div class="facts">
<div><h3>Reto</h3><p${t.area === 'ingles' ? ' lang="en"' : ''}>${esc(t.reto)}</p></div>
<div><h3>Producto final</h3><p>${esc(t.producto)}.</p></div>
<div><h3>Temporalización orientativa</h3><p>${ciclo.sesiones} sesiones de ${sesMin} minutos${c.id === 'canarias' ? ' (duración de referencia en Canarias)' : ''}.</p></div>
<div><h3>Áreas implicadas</h3><p>${esc(lista(areasImpl))}.</p></div>
</div>
${cta(c, n, area, temaApp)}
<section>
<h2>Por qué encaja en ${esc(cursoTxt(n))} de Primaria</h2>
${t.porCiclo && t.porCiclo[cicloN(n)] ? `<p><strong>Qué hace el alumnado en ${esc(cursoTxt(n))}:</strong> <span${t.area === 'ingles' ? ' lang="en"' : ''}>${esc(t.porCiclo[cicloN(n)])}</span></p>` : ''}
<p>${esc(enfoque)}</p>
${contexto ? `<p><strong>Anclaje en ${esc(corta(c))}:</strong> ${esc(contexto)}</p>` : ''}
${ods.length ? `<p>Conecta con la Agenda 2030: ${esc(lista(ods))}.</p>` : ''}
${cursosT.length > 1 ? `<p>Este tema se propone de ${esc(cursoTxt(cursosT[0]))} a ${esc(cursoTxt(cursosT[cursosT.length - 1]))}: en ${esc(cursoTxt(n))} el nivel de autonomía y el producto se ajustan al ${esc(ciclo.nombre)}, con ${esc(ciclo.agrup)}.</p>` : `<p>En ${esc(cursoTxt(n))} se trabaja con ${esc(ciclo.agrup)}.</p>`}
</section>
${saberes.length ? `<section>
<h2>Saberes básicos que moviliza</h2>
<ul>${saberes.map(s => `<li>${esc(s)}</li>`).join('')}</ul>
<p class="note">Bloques de saberes del Real Decreto 157/2022 para ${esc(area.nombre)}. ${c.id === 'canarias' ? 'En Canarias se concretan dentro de los bloques competenciales del Decreto 211/2022.' : `Su concreción para ${esc(nom(c))} está en el ${esc(decretoCorto(c))}.`}</p>
</section>` : ''}
<section>
<h2>Estructura de la situación de aprendizaje</h2>
<ol class="estructura">
<li><strong>Identificación.</strong> «${esc(t.titulo)}», ${esc(cursoTxt(n))} de Primaria, ${esc(lista(areasImpl))}; ${ciclo.sesiones} sesiones de ${sesMin} minutos.</li>
<li><strong>Justificación y contextualización.</strong> Reto real del entorno del alumnado en ${esc(nom(c))}${contexto ? ', con anclaje local' : ''}${ods.length ? ` y vinculación con ${esc(lista((t.ods || []).map(o => 'el ODS ' + o)))}` : ''}.</li>
<li><strong>Fundamentación curricular.</strong> ${esc(curriculoCCAA(c))}</li>
<li><strong>Fundamentación metodológica.</strong> Aprendizaje basado en retos; ${esc(ciclo.agrup)}.</li>
<li><strong>Secuencia de actividades.</strong> Ver la secuencia orientativa de ${ciclo.sesiones} sesiones más abajo.</li>
<li><strong>Atención a las diferencias individuales.</strong> DUA: ${esc(ciclo.dua)}.</li>
<li><strong>Evaluación.</strong> Instrumentos: ${esc(lista(area.evidencias))} y rúbrica del producto. ${esc(evaluacionCCAA(c))}</li>
<li><strong>Producto final y difusión.</strong> ${esc(sinPunto(t.producto))}. Se presenta ${esc(ciclo.difusion)}.</li>
<li><strong>Valoración del ajuste.</strong> Propuestas de mejora para el próximo curso.</li>
</ol>
</section>
<section>
<h2>Secuencia orientativa de sesiones</h2>
${secuencia(t, n, area)}
</section>
<section id="ejemplo">
<h2>Ejemplo</h2>
${bloqueEjemplo(ejemplo, c, n, t, area, temaApp)}
</section>
<section>
<h2>Marco normativo en ${esc(nom(c))}</h2>
<ul>${normativa(c).map(x => `<li>${esc(x)}</li>`).join('')}</ul>
${!(c.decreto && c.verificado) ? '<p class="note">Citamos el decreto autonómico de forma genérica hasta verificar su referencia exacta en la fuente oficial.</p>' : ''}
</section>`;

  // Enlazado interno
  const otrosCursos = cursosT.filter(x => x !== n).map(x => ({ url: urlTema(c, x, t.area, t.slug), text: `${t.titulo} · ${cursoTxt(x)} Primaria` }));
  const delArea = todos.filter(x => x.area === t.area && x.slug !== t.slug && temaDisponible(x, c, n));
  const off = delArea.length ? hashNum(t.slug + n) % delArea.length : 0;
  const rot = delArea.slice(off).concat(delArea.slice(0, off)).slice(0, 8);
  const otrosTemas = rot.map(x => ({ url: urlTema(c, n, x.area, x.slug), text: x.titulo }));
  const otrasCCAA = COMUNIDADES.filter(o => o.id !== c.id && temaDisponible(t, o, n)).map(o => ({ url: urlTema(o, n, t.area, t.slug), text: `${t.titulo} en ${nom(o)}` }));
  body += `<section class="rel">
${otrosCursos.length ? `<div><h2>El mismo tema en otros cursos</h2>${linkList(otrosCursos)}</div>` : ''}
<div><h2>Más situaciones de ${esc(area.corto)} en ${esc(cursoTxt(n))}</h2>${linkList(otrosTemas)}<p><a href="${urlCursoArea(c, n, t.area)}">Todas las de ${esc(area.corto)} en ${esc(cursoTxt(n))} →</a></p></div>
${conex.length ? `<div><h2>Áreas relacionadas</h2>${linkList(conex.map(a => ({ url: urlCursoArea(c, n, a.slug), text: `${a.corto} · ${cursoTxt(n)} Primaria` })))}</div>` : ''}
${otrasCCAA.length ? `<div><h2>En otras comunidades</h2>${linkList(otrasCCAA)}</div>` : ''}
</section>`;

  const jsonld = [{
    '@context': 'https://schema.org', '@type': 'LearningResource',
    name: `Situación de aprendizaje: ${t.titulo}`,
    headline: h1, description, url: BASE + url, inLanguage: 'es-ES',
    learningResourceType: 'Situación de aprendizaje',
    educationalLevel: `${cursoTxt(n)} de Educación Primaria`,
    educationalFramework: 'LOMLOE',
    teaches: t.reto,
    keywords: t.keywords.join(', '),
    about: [area.nombre, ...saberes],
    audience: { '@type': 'EducationalAudience', educationalRole: 'teacher' },
    educationalAlignment: [
      { '@type': 'AlignmentObject', alignmentType: 'educationalSubject', targetName: area.nombre },
      { '@type': 'AlignmentObject', alignmentType: 'educationalLevel', targetName: `${cursoTxt(n)} de Educación Primaria (${ciclo.nombre})` },
      { '@type': 'AlignmentObject', alignmentType: 'educationalFramework', targetName: (c.decreto && c.verificado) ? decretoCorto(c) : 'Real Decreto 157/2022' }
    ],
    spatialCoverage: { '@type': 'AdministrativeArea', name: c.name },
    isAccessibleForFree: true,
    provider: { '@type': 'Organization', name: 'AulaLista', url: BASE + '/' },
    ...(ejemplo && ejemplo.revisado ? { dateModified: ejemplo.mtime } : {})
  }];
  const breadcrumb = [{ name: 'Recursos', url: '/recursos/' }, { name: corta(c), url: urlCCAA(c) }, { name: `${cursoTxt(n)} Primaria`, url: urlCurso(c, n) }, { name: area.corto, url: urlCursoArea(c, n, t.area) }, { name: t.titulo, url }];
  emit(url, layout({ title, description, url, h1, indexable, breadcrumb, jsonld, body }), indexable, 'tema');
  return { ejemplo: !!ejemplo, indexable };
}

function bloqueEjemplo(ej, c, n, t, area, temaApp) {
  if (ej && ej.completo) {
    const aviso = ej.revisado ? `<p class="note">Ejemplo revisado por un docente${ej.meta.fecha ? ` (${esc(ej.meta.fecha)})` : ''}. Generado con AulaLista y ajustado a mano; adáptalo a tu grupo.</p>`
      : '<p class="note warn">Borrador generado con IA pendiente de revisión docente. Las marcas VERIFICAR señalan lo que hay que comprobar con el decreto.</p>';
    return `${aviso}<div class="ejemplo">${md(ej.body, 1)}</div>`;
  }
  if (ej && !ej.completo) {
    return `<p class="note">Extracto de un ejemplo elaborado para ${esc(cursoTxt(ej.cursoEj))} de Primaria. Genera la versión de ${esc(cursoTxt(n))} con el botón de abajo.</p><div class="ejemplo">${md(extracto(ej.body), 1)}</div><p><a href="${urlTema(c, ej.cursoEj, t.area, t.slug)}#ejemplo">Ver el ejemplo completo de ${esc(cursoTxt(ej.cursoEj))} →</a></p>${cta(c, n, area, temaApp, `Generar la versión de ${cursoTxt(n)}`)}`;
  }
  const saberes = (t.saberes || []).map(s => area.bloques[s]);
  return `<p>Todavía no hemos publicado un ejemplo revisado de este tema para ${esc(cursoTxt(n))} en ${esc(nom(c))}. Este es el esquema que completa el generador:</p>
<div class="tbl"><table><thead><tr><th>Competencia específica</th><th>Criterios de evaluación</th><th>Saberes básicos</th><th>Descriptores operativos</th></tr></thead>
<tbody><tr><td>Competencias específicas de ${esc(area.corto)} vinculadas al reto</td><td>Criterios del ${esc(cicloN(n) === 1 ? 'primer' : cicloN(n) === 2 ? 'segundo' : 'tercer')} ciclo, con su numeración oficial</td><td>${esc(saberes.length ? lista(saberes) : 'Saberes del ciclo')}</td><td>Siglas del Perfil de salida (CCL, STEM, CD, CPSAA, CC…)</td></tr></tbody></table></div>
${cta(c, n, area, temaApp, 'Generar el ejemplo completo')}`;
}

// ---------- Índices ----------
// Los índices de una comunidad se indexan solo cuando la comunidad está en el lote activo (config.indexacion.ccaa)
const idxCCAA = c => CONFIG.indexacion.ccaa.includes(c.id);
function paginaCursoArea(c, n, area) {
  const temas = TEMAS.filter(t => t.area === area.slug && temaDisponible(t, c, n));
  if (!temas.length) return;
  const url = urlCursoArea(c, n, area.slug);
  const title = `Situaciones de aprendizaje de ${area.corto} · ${cursoTxt(n)} Primaria · ${corta(c)}`;
  const description = recorta(`${temas.length} situaciones de aprendizaje de ${area.nombre} para ${cursoTxt(n)} de Primaria en ${nom(c)}, con reto, producto final y estructura LOMLOE: ${lista(temas.slice(0, 3).map(t => t.titulo))}…`, 158);
  const body = `<p class="lead">${esc(area.ciclos[cicloN(n)] || area.ciclos[3] || '')}</p>
<div class="cards">${temas.map(t => `<a class="card" href="${urlTema(c, n, area.slug, t.slug)}"><h3>${esc(t.titulo)}</h3><p>${esc(recorta(t.reto, 150))}</p><p class="note">Producto: ${esc(t.producto)}</p></a>`).join('')}</div>
<p><a href="${urlArea(c, area.slug)}">${esc(area.corto)} en todos los cursos →</a> · <a href="${urlCurso(c, n)}">Todas las áreas de ${esc(cursoTxt(n))} →</a></p>`;
  emit(url, layout({ title, description, url, h1: `Situaciones de aprendizaje de ${area.corto} para ${cursoTxt(n)} de Primaria en ${nom(c)}`, breadcrumb: [{ name: 'Recursos', url: '/recursos/' }, { name: corta(c), url: urlCCAA(c) }, { name: `${cursoTxt(n)} Primaria`, url: urlCurso(c, n) }, { name: area.corto, url }], body, indexable: idxCCAA(c) }), idxCCAA(c), 'indice');
}

function paginaCurso(c, n) {
  const url = urlCurso(c, n);
  const areas = AREAS.filter(a => TEMAS.some(t => t.area === a.slug && temaDisponible(t, c, n)));
  const total = TEMAS.filter(t => temaDisponible(t, c, n)).length;
  const title = `Situaciones de aprendizaje ${cursoTxt(n)} Primaria · ${corta(c)} (LOMLOE)`;
  const description = recorta(`${total} situaciones de aprendizaje para ${cursoTxt(n)} de Primaria (${CICLO[cicloN(n)].nombre}) en ${nom(c)}, por áreas: ${lista(areas.map(a => a.corto))}.`, 158);
  const body = `<p class="lead">Alumnado de ${EDADES[n]} años, ${CICLO[cicloN(n)].nombre}. Sesiones de referencia de ${P.sesionPorDefecto(c.id)} minutos. ${esc(curriculoCCAA(c))}</p>
${areas.map(a => { const ts = TEMAS.filter(t => t.area === a.slug && temaDisponible(t, c, n)); return `<section><h2><a href="${urlCursoArea(c, n, a.slug)}">${esc(a.nombre)}</a></h2>${linkList(ts.map(t => ({ url: urlTema(c, n, a.slug, t.slug), text: t.titulo })))}</section>`; }).join('\n')}
<p>Otros cursos: ${[1, 2, 3, 4, 5, 6].filter(x => x !== n).map(x => `<a href="${urlCurso(c, x)}">${cursoTxt(x)}</a>`).join(' · ')}</p>`;
  emit(url, layout({ title, description, url, h1: `Situaciones de aprendizaje para ${cursoTxt(n)} de Primaria en ${nom(c)}`, breadcrumb: [{ name: 'Recursos', url: '/recursos/' }, { name: corta(c), url: urlCCAA(c) }, { name: `${cursoTxt(n)} Primaria`, url }], body, indexable: idxCCAA(c) }), idxCCAA(c), 'indice');
}

function paginaArea(c, area) {
  const temas = TEMAS.filter(t => t.area === area.slug && cursosDe(t, c).length);
  if (!temas.length) return;
  const url = urlArea(c, area.slug);
  const cursos = [1, 2, 3, 4, 5, 6].filter(n => temas.some(t => temaDisponible(t, c, n)));
  const title = `Situaciones de aprendizaje de ${area.corto} en Primaria · ${corta(c)}`;
  const description = recorta(`${temas.length} temas de ${area.nombre} para Primaria en ${nom(c)}, de ${cursoTxt(cursos[0])} a ${cursoTxt(cursos[cursos.length - 1])}, con reto, producto final y estructura LOMLOE.`, 158);
  const bloques = Object.values(area.bloques);
  const body = `<p class="lead">${bloques.length ? `Bloques de saberes del área (Real Decreto 157/2022): ${esc(lista(bloques))}. ` : ''}${esc(curriculoCCAA(c))}</p>
${Object.entries(area.ciclos).map(([k, v]) => `<p><strong>${esc(CICLO[k].nombre[0].toUpperCase() + CICLO[k].nombre.slice(1))}.</strong> ${esc(v)}</p>`).join('\n')}
<div class="tbl"><table class="matriz"><thead><tr><th>Tema</th>${cursos.map(n => `<th>${cursoTxt(n)}</th>`).join('')}</tr></thead><tbody>
${temas.map(t => `<tr><td><strong>${esc(t.titulo)}</strong><br><span class="note">${esc(recorta(t.reto, 110))}</span></td>${cursos.map(n => temaDisponible(t, c, n) ? `<td><a href="${urlTema(c, n, area.slug, t.slug)}" aria-label="${esc(t.titulo)}, ${cursoTxt(n)}">${cursoTxt(n)}</a></td>` : '<td></td>').join('')}</tr>`).join('\n')}
</tbody></table></div>`;
  emit(url, layout({ title, description, url, h1: `Situaciones de aprendizaje de ${area.nombre} en ${nom(c)}`, breadcrumb: [{ name: 'Recursos', url: '/recursos/' }, { name: corta(c), url: urlCCAA(c) }, { name: area.corto, url }], body, indexable: idxCCAA(c) }), idxCCAA(c), 'indice');
}

function paginaCCAA(c) {
  const url = urlCCAA(c);
  const temas = TEMAS.filter(t => cursosDe(t, c).length);
  const propios = temas.filter(t => t.ccaa && t.ccaa.includes(c.id));
  const nPag = temas.reduce((s, t) => s + cursosDe(t, c).length, 0);
  const title = `Situaciones de aprendizaje de Primaria en ${corta(c)} · LOMLOE`;
  const description = recorta(`${nPag} propuestas de situaciones de aprendizaje para Educación Primaria en ${nom(c)}, por curso y área, alineadas con ${c.decreto && c.verificado ? decretoCorto(c) : 'el currículo autonómico'}.`, 158);
  const areas = AREAS.filter(a => temas.some(t => t.area === a.slug));
  const body = `<p class="lead">${esc(curriculoCCAA(c))} Duración de referencia de la sesión: ${P.sesionPorDefecto(c.id)} minutos.</p>
<section><h2>Por curso</h2><div class="cards cursos">${[1, 2, 3, 4, 5, 6].map(n => `<a class="card" href="${urlCurso(c, n)}"><h3>${cursoTxt(n)} Primaria</h3><p>${CICLO[cicloN(n)].nombre} · ${TEMAS.filter(t => temaDisponible(t, c, n)).length} temas</p></a>`).join('')}</div></section>
<section><h2>Por área</h2>${linkList(areas.map(a => ({ url: urlArea(c, a.slug), text: a.nombre, note: `${temas.filter(t => t.area === a.slug).length} temas` })))}</section>
${propios.length ? `<section><h2>Temas propios de ${esc(corta(c))}</h2>${linkList(propios.map(t => ({ url: urlTema(c, cursosDe(t, c)[0], t.area, t.slug), text: t.titulo, note: `${areaPorSlug[t.area].corto} · ${cursosDe(t, c).map(cursoTxt).join(', ')}` })))}</section>` : ''}
<section><h2>Marco normativo</h2><ul>${normativa(c).map(x => `<li>${esc(x)}</li>`).join('')}</ul></section>`;
  emit(url, layout({ title, description, url, h1: `Situaciones de aprendizaje de Educación Primaria en ${nom(c)}`, breadcrumb: [{ name: 'Recursos', url: '/recursos/' }, { name: corta(c), url }], body, indexable: idxCCAA(c) }), idxCCAA(c), 'indice');
}

function paginaHub() {
  const url = '/recursos/';
  const body = `<p class="lead">Ideas de situaciones de aprendizaje para Educación Primaria organizadas por comunidad autónoma, curso y área, con su reto, su producto final y la estructura que piden las plantillas LOMLOE. Cada propuesta se puede completar con el generador de AulaLista en unos minutos.</p>
<div class="cards">${COMUNIDADES.map(c => `<a class="card" href="${urlCCAA(c)}"><h3>${esc(c.name)}</h3><p>${TEMAS.filter(t => cursosDe(t, c).length).length} temas · ${esc(c.decreto && c.verificado ? decretoCorto(c) : 'currículo autonómico')}</p></a>`).join('')}</div>
<section><h2>Áreas</h2>${COMUNIDADES.map(c => `<p><strong>${esc(corta(c))}:</strong> ${AREAS.filter(a => TEMAS.some(t => t.area === a.slug && cursosDe(t, c).length)).map(a => `<a href="${urlArea(c, a.slug)}">${esc(a.corto)}</a>`).join(' · ')}</p>`).join('\n')}</section>`;
  emit(url, layout({ title: 'Situaciones de aprendizaje de Primaria por comunidad, curso y área | AulaLista', description: 'Propuestas de situaciones de aprendizaje LOMLOE para Educación Primaria en Canarias, Andalucía y Madrid, por curso y área, con reto, producto final y estructura completa.', url, h1: 'Situaciones de aprendizaje de Educación Primaria', breadcrumb: [{ name: 'Recursos', url }], body }), true, 'indice');
}

// ---------- Generación ----------
const stats = { tema: 0, indexables: 0, ejemplos: 0 };
for (const c of COMUNIDADES) {
  for (const t of TEMAS) for (const n of cursosDe(t, c)) {
    const r = paginaTema(c, n, t, TEMAS);
    stats.tema++; if (r.indexable) stats.indexables++; if (r.ejemplo) stats.ejemplos++;
  }
  for (let n = 1; n <= 6; n++) { paginaCurso(c, n); for (const a of AREAS) paginaCursoArea(c, n, a); }
  for (const a of AREAS) paginaArea(c, a);
  paginaCCAA(c);
}
paginaHub();

// Unicidad de title/description
const vistos = { title: new Map(), description: new Map() };
for (const p of paginas) for (const k of ['title', 'description']) {
  const v = (k === 'title' ? p.html.match(/<title>(.*?)<\/title>/) : p.html.match(/<meta name="description" content="(.*?)">/))[1];
  if (vistos[k].has(v)) { console.error(`${k} duplicado: ${v}\n  ${vistos[k].get(v)}\n  ${p.url}`); process.exit(1); }
  vistos[k].set(v, p.url);
}

const indices = paginas.filter(p => p.tipo === 'indice').length;
console.log(`Fichas de tema: ${stats.tema} (indexables: ${stats.indexables}, con ejemplo: ${stats.ejemplos}) · Índices: ${indices} · Total: ${paginas.length}`);
if (DRY) process.exit(0);

// lastmod estable: solo cambia si cambia el contenido (seo/manifest.json)
const MANIFEST = path.join(SEO, 'manifest.json');
const prev = fs.existsSync(MANIFEST) ? JSON.parse(fs.readFileSync(MANIFEST, 'utf8')) : {};
const manifest = {};
for (const p of paginas) {
  const h = crypto.createHash('sha1').update(p.html).digest('hex').slice(0, 16);
  manifest[p.url] = { hash: h, lastmod: prev[p.url] && prev[p.url].hash === h ? prev[p.url].lastmod : HOY, indexable: p.indexable };
}

fs.rmSync(OUT, { recursive: true, force: true });
for (const p of paginas) {
  const dir = path.join(PUB, p.url);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'index.html'), p.html);
}
fs.copyFileSync(path.join(SEO, 'recursos.css'), path.join(OUT, 'recursos.css'));

const sm = [`${BASE}/`, ...paginas.filter(p => p.indexable).map(p => BASE + p.url)];
const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>${BASE}/</loc><lastmod>${HOY}</lastmod></url>
${paginas.filter(p => p.indexable).map(p => `  <url><loc>${esc(BASE + p.url)}</loc><lastmod>${manifest[p.url].lastmod}</lastmod></url>`).join('\n')}
</urlset>
`;
fs.writeFileSync(path.join(PUB, 'sitemap.xml'), xml);
fs.writeFileSync(path.join(PUB, 'robots.txt'), `User-agent: *\nAllow: /\nDisallow: /api/\n\nSitemap: ${BASE}/sitemap.xml\n`);
fs.writeFileSync(MANIFEST, JSON.stringify(manifest, null, 0).replace(/\},"/g, '},\n"') + '\n');
console.log(`Escrito: ${path.relative(ROOT, OUT)}/ (${paginas.length} páginas), sitemap.xml (${sm.length} URL), robots.txt`);
