# Equipo de agentes de AulaLista

Cada agente es dueño de sus ficheros: nadie edita los de otro. El coordinador integra los resultados, ejecuta `build.py` y los tests y hace los commits.

| Agente | Misión | Ficheros que le pertenecen | Se repite |
| --- | --- | --- | --- |
| Coordinador | Planificar, integrar, construir, probar, publicar y hacer commit | `shared/prompts.js`, `README.md`, `CLAUDE.md`, git | Siempre |
| Curriculista | Base curricular literal (RAG) por comunidad, área y ciclo | `data/<ccaa>/primaria/*.json`, `docs/normativa/criterios-*-estado.md` | Una vez por comunidad, y cada vez que cambie un decreto |
| Analista normativo | Fichas de evaluación, atención a la diversidad, convivencia, oposiciones e instrucciones de curso | `docs/normativa/04–07*.md`, `docs/oposiciones/**` | Cada septiembre y con cada norma nueva |
| Cartógrafo autonómico | Decretos y particularidades de las 17 comunidades + Ceuta y Melilla | `data/ccaa.json`, `docs/normativa/08-mapa-autonomico.md` | Trimestral |
| Growth / SEO | SEO programático, sitemap, enlazado interno | `seo/**`, `produccion/public/recursos/**`, `sitemap.xml`, `robots.txt` | Cada lote de temas nuevos |
| QA y seguridad | Revisión independiente, tests y endurecimiento | `tests/**`, `docs/qa/**`, y correcciones en worker, engines y template | En cada versión antes de desplegar |

## Ronda 2 (17/11/2026, en curso)

| Agente | Misión | Ficheros |
| --- | --- | --- |
| Curriculista fase 2 | Saberes básicos, explicaciones de los bloques competenciales y cotejo de descriptores desde el PDF oficial | `data/canarias/primaria/*.json`, `tools/extraer_saberes_canarias.py` |
| Contenido y captación | 10 SA de ejemplo para SEO, lead magnet, 7 emails, carruseles, afiliados | `seo/ejemplos/**`, `marketing/**` |
| Módulo opositor | Programación conforme a las bases de Canarias, guion de exposición y validador de formato | `shared/prompts.js` (solo su parte), template, engines, `shared/validador-oposicion.js`, worker, tests |
| Legal y cumplimiento | Aviso legal, privacidad, condiciones, cookies, compatibilidad docente, fiscalidad canaria, RGPD | `produccion/public/legal/**`, `docs/legal/**`, pie de la landing |

## Agentes previstos para fases siguientes

| Agente | Cuándo | Misión |
| --- | --- | --- |
| Evaluador de calidad | Cuando exista el RAG | Generar lotes de SA y puntuarlas con la rúbrica de `docs/didactica/situacion-de-aprendizaje.md` |
| Contenido y email | Antes de la preventa | Lead magnet, secuencia de 7 emails, carruseles para redes |
| Opositor | Verano de 2027 | Módulo de programación y supuestos prácticos, con validador de formato frente a las bases |
| Soporte | Con los primeros clientes | Base de conocimiento y respuestas automatizadas |
