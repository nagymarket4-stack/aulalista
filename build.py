import re, pathlib
R = pathlib.Path(__file__).parent
sh = R/'shared'
prompts = (sh/'prompts.js').read_text()
tpl = (sh/'app.template.html').read_text()
def app(engine):
    return tpl.replace('/*__PROMPTS__*/', prompts).replace('/*__ENGINE__*/', (sh/engine).read_text())
(R/'dist').mkdir(exist_ok=True)
(R/'dist/prototipo.html').write_text(app('engine.claude.js'))
pub = R/'produccion/public'; pub.mkdir(parents=True, exist_ok=True)
(pub/'app.html').write_text(app('engine.web.js'))
(pub/'index.html').write_text((sh/'landing.html').read_text())
esm = re.sub(r"\nif \(typeof module.*\n?", "\n", prompts) + "\nexport { CCAA, CURSOS, AREAS_BASE, areasDe, ccaaPorId, cicloDe, promptSA, promptRubrica, promptAdaptacion };\n"
(R/'produccion/src/prompts.mjs').write_text(esm)
print('ok')
