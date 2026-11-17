# AulaLista — guía para Claude Code

Generador de situaciones de aprendizaje, rúbricas y adaptaciones DUA (LOMLOE) por comunidad autónoma. Público: docentes de Primaria en España. Todo en español de España.

## Estructura
- `shared/` es la FUENTE. Edita aquí, nunca en `dist/` ni en `produccion/public/` ni en `produccion/src/prompts.mjs` (son generados).
  - `prompts.js`: datos curriculares (CCAA, áreas, decretos) y prompts. Es el núcleo de la calidad del producto.
  - `app.template.html`: interfaz común; recibe `prompts.js` y un motor (`engine.*.js`).
  - `engine.claude.js`: motor del prototipo (capacidades de artefacto de claude.ai: sample, db, downloads).
  - `engine.web.js`: motor de producción (llama a `/api/*`).
  - `landing.html`: landing de preventa.
- `python3 build.py` regenera `dist/prototipo.html`, `produccion/public/*` y `produccion/src/prompts.mjs`. Ejecútalo tras cualquier cambio en `shared/`.
- `produccion/src/worker.js`: backend Cloudflare Worker sin dependencias (KV, Anthropic API en streaming, Stripe, leads).

## Reglas
- Nunca inventar números de decreto ni de criterio. Un decreto solo se cita si `verificado: true` y se ha comprobado en la fuente oficial.
- Nunca pedir ni almacenar datos personales de alumnado.
- Secretos solo con `wrangler secret put`; nunca en el repositorio.
- Comprobar sintaxis tras cambios: `node --check produccion/src/worker.js` y los `<script>` de los HTML generados.

## Prioridades (ver README)
1. RAG curricular: criterios literales del Decreto 211/2022 de Canarias por área y ciclo, inyectados en el prompt.
2. SEO programático.
3. Cuentas con enlace mágico.
4. Módulo opositor (sep 2027).
