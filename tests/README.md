# Tests de AulaLista

Sin dependencias: solo `node:test`, `node:assert` y módulos nativos (Node 22).

```bash
python3 build.py                       # regenera dist/, produccion/public/ (incluido _headers) y prompts.mjs
cd produccion && npm test              # = node --test "../tests/*.test.mjs"
# o, desde la raíz del repo:
node --test "tests/*.test.mjs"
```

Ejecuta `python3 build.py` antes de los tests: `html.test.mjs` comprueba los ficheros generados.
`npm run check` (en `produccion/`) hace todo: `node --check` del worker, build y tests.

| Fichero | Qué cubre |
| --- | --- |
| `helpers.mjs` | KV en memoria (con paginación por cursor), entorno simulado, `fetch` simulado, firmas de Stripe, stream SSE de ejemplo |
| `worker.test.mjs` | Rutas desconocidas (404), métodos (405), estáticos; cupo gratuito (3/mes → 402, IP seudonimizada, IPv6 por /64, devolución del cupo si falla el modelo); validación de entradas (400/413/415) y CSRF (403); licencias (activa, inactiva, mal formada, límite diario 429, `/api/license`, idempotencia webhook ↔ license); webhook de Stripe (firma válida, inválida, caducada, del futuro, alterada, rotación de secretos, bajas y reembolsos); leads (válido, inválido, consentimiento RGPD, MailerLite); export CSV admin (sin token, token incorrecto, token corto, cabecera y query, paginación, inyección de fórmulas) |
| `markdown.test.mjs` | Renderizador Markdown de `shared/app.template.html` (bloque `<script id="al-md">`): 21 cargas XSS en 9 contextos (párrafo, encabezados, listas, tablas, `<br>` en celdas…), fuzzing, entradas límite y rendimiento con líneas adversariales |
| `engine-web.test.mjs` | Motor de producción: parseo del stream SSE (trozos partidos, CRLF), corte de conexión, `max_tokens`, errores del modelo, mensajes 400/402/429, licencia inválida, retorno de Stripe |
| `validador-oposicion.test.mjs` | Validador de formato de la programación para oposición (`shared/validador-oposicion.js`): nº de SA, extensión y penalizaciones con tope, % telemático por SA, criterios y competencias frente al currículo, normativa (fechas, derogadas, terminología), riesgo de cero, datos personales, detección de SA en texto plano y Markdown, inclusión en los HTML |
| `afiliados.test.mjs` | Afiliados: validación del código (alfanumérico, ≤ 32), `?ref` en `/api/lead` y en el enlace de Fundador (`client_reference_id`), atribución en el webhook (client_reference_id, lead del mismo email ≤ 60 días, idempotencia, sin datos personales en `aff:*`, importe sin impuestos), renovaciones `invoice.paid` solo durante 12 meses (máx. 32,40 € en mensual), devoluciones parciales y totales, CSV `/api/admin/afiliados` (autenticación, 30 %, filtros, resumen); `/api/portal` (302, 503, solo https); bloque `AulaRef` del navegador (captura, caducidad a 60 días, solo `buy.stripe.com`, decorado de enlaces, enlace al portal con licencia) |
| `stats.test.mjs` | Métricas: `track()` (fragmentos diarios en KV, claves validadas, nunca lanza, `STATS_KV=off`, Analytics Engine), `ccaaId`, `planOf`, rangos de fechas; agregación pura (serie con ceros, top, MRR, ingresos estimados con precios de README, ratios sin NaN); `/api/admin/stats` (autenticación como `/api/admin/leads`, 400 por rango, extremo a extremo con generaciones, 402, 502, leads, Fundador, licencias, reintentos del webhook, bajas, cambio mensual→anual, renovaciones idempotentes, afiliados, sin datos personales); panel `/admin/` (copia de build, script compila, `noindex`, sin recursos externos ni `innerHTML`, token en `sessionStorage`, CSP con hash de script y estilo) |
| `html.test.mjs` | Sintaxis de cada `<script>` en línea de los HTML generados; CSP de `public/_headers` con el hash de cada script; coherencia entre la UI y el Worker (perfiles, `maxlength`, consentimiento de la landing, herramientas y rango de SA del módulo opositor); mismo bloque `AulaRef` en landing y app, enlaces al portal y a condiciones; copia exacta de `shared/legal/` a `public/legal/` y CSP de `/legal/*` |

Si cambias un `<script>` en línea y no ejecutas `build.py`, `html.test.mjs` falla: la CSP bloquearía ese script en producción.
