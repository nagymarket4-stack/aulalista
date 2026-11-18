import re, pathlib
R = pathlib.Path(__file__).parent
sh = R/'shared'
import json
src = (sh/'prompts.js').read_text()
data = json.loads((R/'data/ccaa.json').read_text())
keep = ['id','decreto','verificado','escala','evaluacion','sesionMin','areasPropias']
compact = json.dumps([{k: c.get(k) for k in keep if c.get(k) is not None} for c in data], ensure_ascii=False)
src = re.sub(r"/\*CCAA_DATA\*/.*?/\*END_CCAA_DATA\*/", lambda m: "/*CCAA_DATA*/" + compact + "/*END_CCAA_DATA*/", src, flags=re.S)
cur = {}
for d in sorted((R/'data').glob('*/primaria')):
    areas = {}
    for f in sorted(d.glob('*.json')):
        j = json.loads(f.read_text())
        key = re.sub(r'\s*\(.*?\)\s*', '', j['area']).strip().lower()
        c = {}
        for ciclo, v in (j.get('ciclos') or {}).items():
            crit = [[x['id'], x.get('competencia'), x['texto'], x.get('descriptores') or []] + ([int(re.sub(r'\D', '', x['curso']))] if x.get('curso') and re.sub(r'\D', '', x['curso']) else []) for x in ((v or {}).get('criterios') or []) if x.get('texto')]
            if crit: c[ciclo] = crit
        sab = {}
        for ciclo, bloques in (j.get('saberes') or {}).items():
            out = []
            for b in bloques or []:
                parts = []
                for ap in b.get('apartados') or []:
                    parts.append(ap.get('apartado', '') + ': ' + ' '.join(ap.get('items') or []))
                if b.get('items'): parts.append(' '.join(b['items']))
                out.append(b.get('bloque', '') + ' ' + ' | '.join(parts))
            if out: sab[ciclo] = out
        blq = {}
        for ciclo, bl in (j.get('bloques') or {}).items():
            out = [[x.get('competencias') or [], x.get('criterios') or [], x.get('explicacion') or ''] for x in (bl or []) if x.get('explicacion')]
            if out: blq[ciclo] = out
        areas[key] = {'k': [[k['id'], k.get('enunciado') or k.get('resumen') or ''] for k in j.get('competencias', [])], 'c': c, 's': sab, 'b': blq, 'v': bool(j.get('verificado'))}
    rub_dir = d/'rubricas'
    if rub_dir.exists():
        for f in sorted(rub_dir.glob('*.json')):
            if f.name.startswith('_'): continue
            j = json.loads(f.read_text())
            key = re.sub(r'\s*\(.*?\)\s*', '', j['area']).strip().lower()
            if key not in areas: continue
            niv = j.get('niveles') or []
            areas[key]['r'] = {'n': niv, 'c': {ciclo: {x['criterio']: [x['descriptores'].get(n, '') for n in niv] for x in (lst or [])} for ciclo, lst in (j.get('ciclos') or {}).items()}}
    cur[d.parent.name] = areas
src = re.sub(r"/\*CURRICULO\*/.*?/\*END_CURRICULO\*/", lambda m: "/*CURRICULO*/" + json.dumps(cur, ensure_ascii=False) + "/*END_CURRICULO*/", src, flags=re.S)
(sh/'prompts.js').write_text(src)
prompts = src
tpl = (sh/'app.template.html').read_text()
def app(engine):
    return (tpl.replace('/*__PROMPTS__*/', prompts).replace('/*__ENGINE__*/', (sh/engine).read_text())
               .replace('/*__VALIDADOR__*/', (sh/'validador-oposicion.js').read_text()))
(R/'dist').mkdir(exist_ok=True)
(R/'dist/prototipo.html').write_text(app('engine.claude.js'))
pub = R/'produccion/public'; pub.mkdir(parents=True, exist_ok=True)
(pub/'app.html').write_text(app('engine.web.js'))
# Bloque de atribución de afiliados: una sola fuente (engine.web.js) para la app y la landing.
afiliado = re.search(r"/\*AFILIADO\*/.*?/\*END_AFILIADO\*/", (sh/'engine.web.js').read_text(), re.S)
assert afiliado, 'falta el bloque /*AFILIADO*/ en shared/engine.web.js'
landing = (sh/'landing.html').read_text()
assert '/*__AFILIADO__*/' in landing, 'falta el marcador /*__AFILIADO__*/ en shared/landing.html'
(pub/'index.html').write_text(landing.replace('/*__AFILIADO__*/', afiliado.group(0)))

# Páginas legales: la fuente es shared/legal/; produccion/public/legal/ es una copia exacta (se borra lo que sobre).
import shutil
legal_src, legal_dst = sh/'legal', pub/'legal'
legal_dst.mkdir(parents=True, exist_ok=True)
legal_files = {f.name for f in legal_src.iterdir() if f.is_file()}
for f in legal_dst.iterdir():
    if f.is_file() and f.name not in legal_files: f.unlink()
for name in sorted(legal_files):
    shutil.copyfile(legal_src/name, legal_dst/name)
# Panel privado de métricas: fuente shared/admin.html → produccion/public/admin/index.html (copia exacta).
admin_dst = pub/'admin'; admin_dst.mkdir(parents=True, exist_ok=True)
for f in admin_dst.iterdir():
    if f.is_file() and f.name != 'index.html': f.unlink()
(admin_dst/'index.html').write_text((sh/'admin.html').read_text())

esm = re.sub(r"\nif \(typeof module.*\n?", "\n", prompts) + "\nexport { curriculoDe, CCAA, CURSOS, AREAS_BASE, areasDe, ccaaPorId, cicloDe, sesionPorDefecto, promptSA, promptRubrica, promptAdaptacion, promptPD, ISLAS, TIPOS_CENTRO, criteriosCiclo, promptOposicion, promptExposicion };\n"
(R/'produccion/src/prompts.mjs').write_text(esm)

# ---------- Cabeceras de seguridad de los estáticos (Cloudflare Workers Static Assets: public/_headers) ----------
# CSP sin 'unsafe-inline' en scripts: se calcula el hash SHA-256 de cada <script> en línea de cada HTML.
# Si cambias una CDN, actualízala aquí. Para probar sin bloquear, usa 'Content-Security-Policy-Report-Only'.
import hashlib, base64
CSP_HEADER = 'Content-Security-Policy'
DOCX_CDN = 'https://cdn.jsdelivr.net/npm/docx@8.5.0/build/index.umd.js'
def inline_hashes(html):
    out = []
    for attrs, body in re.findall(r'<script(\s[^>]*)?>(.*?)</script>', html, re.S):
        if attrs and 'src=' in attrs: continue
        out.append("'sha256-" + base64.b64encode(hashlib.sha256(body.encode('utf-8')).digest()).decode() + "'")
    return ' '.join(out)
def csp(html, extra_script=''):
    return '; '.join([
        "default-src 'none'",
        "script-src 'self' " + inline_hashes(html) + (' ' + extra_script if extra_script else ''),
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
        "font-src https://fonts.gstatic.com",
        "connect-src 'self'",
        "img-src 'self' data: blob:",
        "manifest-src 'self'",
        "base-uri 'none'",
        "form-action 'self'",
        "frame-ancestors 'none'",
        "object-src 'none'",
    ])
app_csp = csp((pub/'app.html').read_text(), DOCX_CDN)
landing_csp = csp((pub/'index.html').read_text())
common = """/*
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  X-Frame-Options: DENY
  Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=(), usb=()
  Strict-Transport-Security: max-age=31536000; includeSubDomains
  Cross-Origin-Opener-Policy: same-origin
"""
rules = [common]
for path, value in [('/app', app_csp), ('/app.html', app_csp), ('/', landing_csp), ('/index.html', landing_csp)]:
    rules.append(f"{path}\n  {CSP_HEADER}: {value}\n  Cache-Control: no-cache\n")
# Páginas legales: sin JavaScript. CSP estricta (si algún día llevan <script> en línea, se añade su hash).
legal_html = ''.join((legal_dst/n).read_text() for n in sorted(legal_files) if n.endswith('.html'))
rules.append(f"/legal/*\n  {CSP_HEADER}: {csp(legal_html)}\n")
# Panel /admin/: CSP más estricta que el resto (sin CDN ni Google Fonts; estilos también por hash; sin formularios
# que salgan de la página). noindex por cabecera y por <meta>; nunca en caché.
def style_hashes(html):
    return ' '.join("'sha256-" + base64.b64encode(hashlib.sha256(b.encode('utf-8')).digest()).decode() + "'"
                    for b in re.findall(r'<style(?:\s[^>]*)?>(.*?)</style>', html, re.S))
admin_html = (admin_dst/'index.html').read_text()
assert 'style=' not in admin_html, 'shared/admin.html: sin atributos style (la CSP de /admin/ no los permite)'
admin_csp = '; '.join([
    "default-src 'none'",
    "script-src " + inline_hashes(admin_html),
    "style-src " + style_hashes(admin_html),
    "connect-src 'self'",
    "img-src 'self' data:",
    "base-uri 'none'",
    "form-action 'none'",
    "frame-ancestors 'none'",
    "object-src 'none'",
])
for path in ('/admin', '/admin/*'):
    rules.append(f"{path}\n  {CSP_HEADER}: {admin_csp}\n  X-Robots-Tag: noindex, nofollow, noarchive\n  Cache-Control: no-store\n")
(pub/'_headers').write_text('# Generado por build.py: no editar a mano.\n' + ''.join(rules))
print('ok')
