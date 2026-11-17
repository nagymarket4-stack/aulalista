#!/usr/bin/env node
// Valida las páginas generadas en produccion/public/recursos, sitemap.xml y robots.txt (sin dependencias).
// Uso: node seo/validate.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PUB = path.join(ROOT, 'produccion/public');
const BASE = JSON.parse(fs.readFileSync(path.join(ROOT, 'seo/config.json'), 'utf8')).baseUrl.replace(/\/$/, '');
const VOID = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'source', 'track', 'wbr']);
const errors = [];
const err = (f, m) => errors.push(`${path.relative(PUB, f)}: ${m}`);

function walk(d, out = []) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, e.name);
    if (e.isDirectory()) walk(p, out); else if (e.name.endsWith('.html')) out.push(p);
  }
  return out;
}
const exists = href => {
  const u = href.split('#')[0].split('?')[0];
  if (!u || u === '/') return fs.existsSync(path.join(PUB, 'index.html'));
  const p = path.join(PUB, decodeURIComponent(u));
  return u.endsWith('/') ? fs.existsSync(path.join(p, 'index.html')) : fs.existsSync(p);
};

const files = walk(path.join(PUB, 'recursos'));
const titles = new Map();
let links = 0;
for (const f of files) {
  const html = fs.readFileSync(f, 'utf8');
  const url = '/' + path.relative(PUB, path.dirname(f)).split(path.sep).join('/') + '/';
  if (!html.startsWith('<!DOCTYPE html>')) err(f, 'sin doctype');
  const count = re => (html.match(re) || []).length;
  if (count(/<title>/g) !== 1) err(f, 'número de <title> distinto de 1');
  if (count(/<h1[ >]/g) !== 1) err(f, 'número de <h1> distinto de 1');
  if (count(/<meta name="description" content="[^"]{50,}">/g) !== 1) err(f, 'meta description ausente o corta');
  const can = (html.match(/<link rel="canonical" href="([^"]+)">/) || [])[1];
  if (can !== BASE + url) err(f, `canonical incorrecto: ${can}`);
  const t = (html.match(/<title>(.*?)<\/title>/) || [])[1];
  if (titles.has(t)) err(f, `title duplicado con ${titles.get(t)}`); titles.set(t, url);
  // JSON-LD
  for (const m of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    try { const o = JSON.parse(m[1]); if (!o['@type']) err(f, 'JSON-LD sin @type'); } catch (e) { err(f, 'JSON-LD no válido: ' + e.message); }
  }
  // Balance de etiquetas (quitando scripts y comentarios)
  const src = html.replace(/<script[\s\S]*?<\/script>/g, '').replace(/<!--[\s\S]*?-->/g, '').replace(/<!DOCTYPE[^>]*>/i, '');
  const stack = [];
  for (const m of src.matchAll(/<(\/?)([a-zA-Z][a-zA-Z0-9]*)\b[^>]*?(\/?)>/g)) {
    const [, close, tagRaw] = m; const tag = tagRaw.toLowerCase();
    if (VOID.has(tag)) continue;
    if (!close) stack.push(tag);
    else { const top = stack.pop(); if (top !== tag) { err(f, `etiqueta mal cerrada: </${tag}> cierra <${top}>`); break; } }
  }
  if (stack.length) err(f, `etiquetas sin cerrar: ${stack.join(',')}`);
  if (/&(?!amp;|lt;|gt;|quot;|#\d+;|#x[0-9a-f]+;)/i.test(src.replace(/<[^>]*>/g, m => m.replace(/&amp;/g, '')))) err(f, '& sin escapar en el texto');
  const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map(m => m[1]);
  if (new Set(ids).size !== ids.length) err(f, 'ids duplicados');
  // Enlaces internos
  for (const m of html.matchAll(/href="(\/[^"]*)"/g)) {
    links++;
    const href = m[1].replace(/&amp;/g, '&');
    if (href.startsWith('/app.html')) { if (!/[?&]ccaa=/.test(href) && href !== '/app.html') err(f, 'CTA sin parámetros'); continue; }
    if (!exists(href)) err(f, `enlace roto: ${href}`);
  }
}

// Sitemap
const sm = fs.readFileSync(path.join(PUB, 'sitemap.xml'), 'utf8');
if (!sm.startsWith('<?xml version="1.0" encoding="UTF-8"?>')) errors.push('sitemap.xml: sin declaración XML');
const locs = [...sm.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]);
if ((sm.match(/<url>/g) || []).length !== locs.length) errors.push('sitemap.xml: <url> sin <loc>');
if (locs.length > 50000) errors.push('sitemap.xml: más de 50.000 URL');
if (new Set(locs).size !== locs.length) errors.push('sitemap.xml: URL duplicadas');
for (const l of locs) {
  if (!l.startsWith(BASE + '/')) { errors.push(`sitemap.xml: URL fuera del dominio ${l}`); continue; }
  const u = l.slice(BASE.length);
  if (!exists(u)) errors.push(`sitemap.xml: URL sin página ${u}`);
  else if (u.startsWith('/recursos/') && /noindex/.test(fs.readFileSync(path.join(PUB, u, 'index.html'), 'utf8').match(/<meta name="robots" content="([^"]+)">/)[1])) errors.push(`sitemap.xml: incluye página noindex ${u}`);
}
const robots = fs.readFileSync(path.join(PUB, 'robots.txt'), 'utf8');
if (!robots.includes(`Sitemap: ${BASE}/sitemap.xml`)) errors.push('robots.txt: falta Sitemap');

const noindex = files.filter(f => /content="noindex/.test(fs.readFileSync(f, 'utf8'))).length;
console.log(`HTML revisados: ${files.length} (noindex: ${noindex}) · enlaces internos: ${links} · URL en sitemap: ${locs.length}`);
if (errors.length) { console.error(`${errors.length} errores:\n` + errors.slice(0, 50).join('\n')); process.exit(1); }
console.log('Sin errores.');
