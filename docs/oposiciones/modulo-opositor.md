# Módulo opositor (Maestros, Educación Primaria, Canarias)

> Qué hace, cómo está construido y qué límites tiene. Bases de referencia: **Orden de 18 de marzo de 2026** (BOC n.º 58, de 25/03/2026), base 15.1.2 y anexo IV, cotejadas con el texto oficial completo. Estructura de la programación: plantilla oficial de PD LOMLOE de la Consejería (Brújula20). Ficha completa de las bases en `canarias-maestros.md`. Revisado el 17/11/2026.

## Aviso principal: originalidad

Las bases califican con **0** una programación **no original, copiada o publicada o difundida antes de la prueba** (anexo IV, 1.n y 1.o; base 15.1.2.A) o **no contextualizada en un centro público dependiente de la Consejería** (anexo IV, 1.q). Por eso:

- Todo lo que genera el módulo es un **borrador de trabajo**. La persona opositora debe **reescribirlo, adaptarlo a su experiencia y hacerlo suyo** antes de entregarlo o exponerlo.
- La interfaz muestra este aviso en la pestaña *Opositor* y el prompt obliga al modelo a presentarse como borrador.
- Dos aspirantes que entreguen el mismo texto generado se exponen a la calificación de 0. El producto **no** debe anunciarse como "programaciones listas para entregar" (ver `canarias-maestros.md`, implicación 3).
- El validador **no comprueba la originalidad** (ni puede hacerlo).

## Qué hace

Nueva pestaña **Opositor** en la app (`shared/app.template.html`). Fija la comunidad en Canarias y ofrece tres herramientas:

### 1. Programación para la oposición (`mode: 'oposicion'`, con IA)

- Prompt `promptOposicion(d)` en `shared/prompts.js`. Reutiliza `marcoNormativo`, `curriculoDe` (criterios literales del Decreto 211/2022 del ciclo) y `REGLAS_COMUNES`. Añade `NORMATIVA_OPOSICION`, que es la normativa de referencia del anexo IV, 2.1.1, actualizada: el Decreto 169/2026 en lugar del 114/2011, ya derogado, y las instrucciones del curso vigente.
- Entradas: curso, área, isla, tipo de centro público (CEIP, CEO o escuela unitaria de un CER), de 6 a 12 SA, hilo conductor (opcional) y rasgos del contexto (opcional).
- Exige un **centro público canario ficticio pero verosímil**, con un nombre claramente inventado y sin centros, personas, calles, barrios ni códigos reales. El entorno se describe por sus rasgos, no por un municipio identificable.
- **Estructura.** Las bases no imponen una estructura, así que se sigue la **plantilla Brújula20**: datos de identificación, punto de partida, justificación (A. orientaciones metodológicas A.1–A.5, B. atención a la diversidad, C. evaluación, D. refuerzo y recuperación), concreción de los objetivos de etapa y ficha de cada SA (descripción, fundamentación curricular con técnicas, herramientas e instrumentos, productos y agentes, fundamentación metodológica, transversales y valores, programas de la Red Canaria-InnovAS, complementarias, periodo de implementación, vinculación con otras áreas y valoración del ajuste).
- **Añadidos del anexo IV:** portada (con "[Nombre y apellidos]"), índice, apartado E de adaptación a un modelo no presencial con evaluación telemática (2.1.2.e), tabla de correspondencia con el art. 44.3 del ROC (2.1.2.f), secuencia de actividades con escenario telemático, calificación y referencias a Canarias por SA (elementos a–k de 3.1.1), sin enlaces ni QR (1.k), con corrección ortográfica (1.m).
- En cada SA, cada actividad telemática lleva la marca **`[TELEMÁTICA]`** y la SA termina con **`**Actividades telemáticas:** X de Y (Z %)`**, con un mínimo del 30 %. El validador lee ese formato.
- Pide unas 13.000–15.000 palabras (≈ 25–30 páginas en Times 11). En producción, `max_tokens = 32000`.

### 2. SA para exponer (`mode: 'exposicion'`, con IA)

- Prompt `promptExposicion(d)`. Genera una SA completa (elementos a–k, ≥ 30 % telemático marcado), más:
  - un **guion de exposición cronometrado de 30 minutos** (tabla por tramos, de 0:00 a 30:00, con indicación de dónde recortar);
  - un **guion de mesa de un folio como máximo, solo con epígrafes y sin contenido curricular**, que se entrega al tribunal al terminar (base 15.1.2.B);
  - un plan para los **45 minutos de preparación**;
  - **10 preguntas probables del tribunal**, cada una con una respuesta breve, repartidas según los criterios de valoración del anexo IV, 3.1.2.
- La SA concreta los objetivos, los contenidos, las actividades y los procedimientos de evaluación (base 15.1.2.B) y sigue los elementos a–k (anexo IV, 3.1.1).
- En producción, `max_tokens = 12000`.

### 3. Validador de formato (sin IA, en el navegador)

- `shared/validador-oposicion.js` (`ValidadorOposicion.validar(texto, opts)` e `informeMarkdown(resultado)`). Es una **función pura**: no hace llamadas de red y el texto no sale del navegador. `build.py` la inserta en `<script id="al-val">` de los HTML generados.
- Entrada: texto pegado o un archivo **.md o .txt**. No lee .docx, porque JSZip no está disponible sin red; en Word se usa *Guardar como → Texto sin formato*.
- Comprobaciones, con semáforo (verde, ámbar, rojo y gris para lo no verificable):

| Bloque | Qué comprueba |
| --- | --- |
| Extensión (1.a, 1.ñ.2–3) | Palabras ÷ 500 ≈ páginas en Times 11, frente a 25–50. Penalización estimada: −1 por debajo de 25 y −0,25 por página por encima de 50. Aviso si hay enlaces o QR, que suman páginas (1.k) |
| Formato (1.b–g, 1.ñ.6, 1.m, 9.1) | Tipo y tamaño de letra, interlineado, tablas ≥ 8 pt, DIN-A4, ortografía y número de ejemplares: no verificables en texto plano (gris). El informe incluye la tabla de penalización por tamaño de letra y la penalización ortográfica |
| Apartados | Portada, índice (−0,2 si falta), contextualización, PE y PGA, objetivos de etapa, competencias clave, competencias específicas, saberes, criterios, instrumentos, calificación, metodología, enfoque globalizador, diversidad, DUA, NEAE, escenario no presencial, ROC (art. 44.3), transversales, secuenciación, bibliografía, **mecanismos de evaluación telemática** (rojo si faltan; 2.1.2.e y h), tipos de evaluación según el agente (2.1.2.h) y, en ámbar, los apartados de la plantilla Brújula20 (punto de partida, refuerzo y recuperación, evaluación de la práctica docente) |
| Contextualización | Centro público y referencia a Canarias. Si faltan: **riesgo de cero**. Número de menciones a Canarias. Aviso si detecta un DNI o NIE, un correo o un teléfono |
| Normativa | Decreto 211/2022 (fecha: 10 de noviembre), Orden de 31 de mayo de 2023 y Decreto 25/2018 (fecha: 26 de febrero) obligatorios. Recomendados: Decreto 81/2010, Orden de 9/10/2013, Resolución de 15/05/2025 (anexo IV, 2.1.1), LOMLOE y RD 157/2022. Normas derogadas: D. 89/2014, RD 126/2014, Orden de 21/04/2015, y en ámbar el D. 114/2011, que las bases citan pero derogó el D. 169/2026; terminología no LOMLOE; decretos no reconocidos marcados "para verificar" |
| Criterios | Los criterios citados (en prosa y en las columnas "Criterio" de las tablas) deben existir en el ciclo y el área, según `CURRICULO` (vía `criteriosCiclo`). Lista de criterios del ciclo no citados. Competencias `C<n>` inexistentes |
| SA | Entre 6 y 12, numeradas sin saltos y tituladas. Detecta "SA 1.", "Situación de aprendizaje n.º 4", "UD 6", "Unidad didáctica 3" y "**SA 5.**", e ignora las líneas del índice con puntos guía |
| Cada SA | % telemático declarado ("X de Y (Z %)" o "N % … telemático"), calculado con las marcas `[TELEMÁTICA]` sobre las actividades numeradas, coherencia entre ambos, elementos a–k presentes y criterios inexistentes |

- La penalización estimada tiene un tope de −2, como en las bases. El informe se puede copiar, descargar (Markdown o Word) y guardar en *Mis documentos*.
- Las bases están en `BASES_OPOSICION['canarias-2026']`, dentro del propio validador. Cuando salga la próxima convocatoria, se añade una entrada y se pasa en `opts.convocatoria`. Pendiente: moverlas a `data/oposiciones/canarias-maestros-2026.json`, como propone `canarias-maestros.md`.

## Backend (`produccion/src/worker.js`)

- `MODES` incluye `oposicion` y `exposicion`. `MAX_TOKENS` fija los límites por modo (`oposicion: 32000`, `exposicion: 12000`).
- Validación específica de estos modos: solo `ccaa = canarias`; `isla` debe estar en `ISLAS` y `tipoCentro` en `TIPOS_CENTRO` (listas blancas en `prompts.js`); `numSA` entre 6 y 12; en `exposicion`, `tema` obligatorio y `sesiones` (1–20) y `duracion` (15–180) validadas. Los campos de texto libre (`tema`, `contexto`) usan los mismos límites y la misma limpieza que el resto.
- Cuentan para el cupo gratuito y para el límite diario Pro como cualquier documento.
- El validador no pasa por el Worker.

## Tests

- `tests/validador-oposicion.test.mjs`: programaciones sintéticas que cumplen y que incumplen (número de SA, extensión, tope de penalización, índice, porcentaje telemático, criterios y competencias inexistentes, normativa y fechas, derogadas, riesgo de cero, datos personales, texto vacío), detección de SA en texto plano y en Markdown, criterios en tablas, uso de `criteriosCiclo` global como en el navegador, e inclusión en los HTML generados.
- `tests/worker.test.mjs` (suite *módulo opositor*): prompts, `max_tokens`, listas blancas, rangos, campos ajenos y cupo.
- `tests/html.test.mjs` (suite *UI del módulo opositor*): herramientas frente a `MODES`, selector de 6–12 SA, aviso de originalidad y aceptación de archivos .md/.txt.

## Límites conocidos

- **Las páginas son una estimación:** las tablas, los márgenes y los anexos cambian mucho el recuento. Hay que comprobarlo siempre en el documento maquetado.
- **No se verifica** el tipo y tamaño de letra, el interlineado, la portada física, los dos ejemplares ni la originalidad.
- La detección de apartados y de los elementos a–k busca **palabras clave**: un apartado puede "estar" sin contenido suficiente, o no detectarse si usa otra denominación.
- El porcentaje telemático calculado depende de que las actividades estén en listas numeradas o de que el texto incluya "X de Y".
- El cotejo de criterios usa la numeración del Decreto 211/2022 que hay en `data/canarias/primaria`. Una SA de otra área (globalizada) puede citar criterios de otra área que el validador marque como inexistentes: el aviso hay que leerlo así.
- La enumeración literal del **art. 44.3 del ROC** no está transcrita en `docs/`: el BOC de 2010 no era accesible desde el entorno. El prompt pide al modelo una tabla de correspondencia marcada con `[VERIFICAR CON DECRETO]`. El validador solo comprueba que se cite el ROC.
- El 30 % telemático **por SA** lo exige el anexo IV, 3.1.1.f para la unidad que se expone. Como esa unidad se sortea entre las de la programación, el validador lo comprueba en todas las SA.
- Las bases remiten al "Anexo I" del Decreto 211/2022 (2.1.2.c), mientras que nuestra ficha sitúa los currículos en el anexo 2. El cotejo de criterios no depende de esto, pero conviene confirmarlo en el PDF del BOC.
- **No hay convocatoria de Maestros publicada para 2027** (a 17/11/2026). Las bases cargadas son las de 2026. Cuando salga una nueva, hay que revisar el prompt y `BASES_OPOSICION`.
- Fuera del alcance (pendiente, ver `canarias-maestros.md`): simulador cronometrado de la segunda prueba, simulador de la primera prueba y corrector ortográfico con la penalización de la base.
