# SEO programático de AulaLista

Genera páginas estáticas de **situaciones de aprendizaje por comunidad × curso × área × tema** en `produccion/public/recursos/`, más `sitemap.xml` y `robots.txt`. Se publican con el resto de estáticos del Worker (`npm run deploy`). No tiene dependencias: solo Node ≥ 18.

```
node seo/generate.mjs        # genera recursos/, sitemap.xml y robots.txt (borra y rehace recursos/)
node seo/generate.mjs --dry  # solo cuenta páginas
node seo/validate.mjs        # comprueba HTML, enlaces internos, JSON-LD, canonical, sitemap y robots
node seo/verificar-ejemplos.mjs  # coteja los ejemplos de Canarias con data/canarias/primaria (criterios, saberes, rúbricas)
python3 build.py             # como siempre, si has tocado shared/
```

## Ficheros

| Fichero | Qué es |
| --- | --- |
| `temas.json` | Catálogo de temas (lo que más se edita) |
| `areas.json` | Áreas: nombre exacto de la app, bloques de saberes del RD 157/2022, enfoque por ciclo y evidencias típicas. Las áreas desdobladas de algunas comunidades (`ciencias-naturaleza`, `ciencias-sociales`, `plastica`, `musica`) llevan `rdArea` (área estatal de la que proceden y cuyos bloques usan) y, si el nombre cambia en una comunidad, `nombresCCAA` (p. ej. «Plástica y Visual» en la Comunitat Valenciana) |
| `config.json` | Dominio, comunidades que se generan y **reglas de indexación por lotes** |
| `ejemplos/<ccaa>/<area>/<tema>.md` | Ejemplos de SA completos (opcionales) que se insertan en la página |
| `recursos.css` | Estilos (mismas fuentes y colores que la landing); se copia a `recursos/recursos.css` |
| `manifest.json` | Hash y `lastmod` de cada URL. Lo mantiene el generador: el `lastmod` del sitemap solo cambia si cambia la página. Versiónalo |
| `generate.mjs` / `validate.mjs` | Generador y validador |
| `verificar-ejemplos.mjs` | Cotejo literal de los ejemplos de Canarias: criterios, competencias, descriptores operativos, saberes (bloque romano + número) y descriptores de la rúbrica oficial (Resolución de 15/05/2025), más los apartados de la plantilla oficial |

Los datos normativos (comunidades, decretos, áreas disponibles por curso, duración de sesión) se leen de `shared/prompts.js`. **Solo se citan decretos con `verificado: true`**; si una comunidad no lo tiene, la página usa una referencia genérica. Para añadir una comunidad basta con poner su `id` en `config.json → ccaa`.

## URL

```
/recursos/                                        índice general
/recursos/<ccaa>/                                 comunidad
/recursos/<ccaa>/<area>/                          área (matriz tema × curso)
/recursos/<ccaa>/<n>-primaria/                    curso
/recursos/<ccaa>/<n>-primaria/<area>/             curso + área
/recursos/<ccaa>/<n>-primaria/<area>/<tema>/      ficha de tema
```

Cada ficha lleva title y description únicos (el generador aborta si se repiten), H1 «Situación de aprendizaje: … · n.º Primaria · área · comunidad», reto, producto, temporalización (55 min en Canarias, 45 por defecto), saberes, estructura de la SA en 9 apartados (10 en Canarias, con la Red Canaria-InnovAS), secuencia orientativa por fases, marco normativo, ejemplo o esquema, CTA a `/app.html?ccaa=&curso=&area=&tema=` (la app prellena el formulario sin tocar la preferencia guardada), enlaces internos, JSON-LD `LearningResource` + `BreadcrumbList` y canonical.

## Cómo ampliar temas

Añade una línea a `temas.json`:

```json
{ "slug": "mi-tema", "titulo": "Título visible", "area": "conocimiento-del-medio", "cursos": [3, 4, 5, 6],
  "reto": "Frase del reto, con destinatario real.", "producto": "Producto final con difusión",
  "keywords": ["situación de aprendizaje …", "…"],
  "saberes": ["cientifica", "sociedades"], "ods": [14], "conexiones": ["lengua-castellana"],
  "ccaa": ["canarias"], "prioridad": 2,
  "contextos": { "andalucia": "Anclaje local verificable…" },
  "porCiclo": { "2": "Qué hace el alumnado en 2.º ciclo…", "3": "…en 3.er ciclo" },
  "curriculoCanarias": { "2": { "saberes": ["I.2.2", "IV.2.2"], "criterios": ["2.2"] }, "3": { "saberes": ["…"], "criterios": ["…"] } } }
```

- `area` y `saberes` deben existir en `areas.json`; el generador valida el catálogo y se para si algo no cuadra.
- El `slug` es único dentro de cada área. Puede repetirse en otra área para el mismo tema: así `el-agua-que-bebemos` existe en Conocimiento del Medio (Canarias, Andalucía…) y en Ciencias de la Naturaleza (Madrid, Castilla y León, Aragón, Murcia), y la ficha enlaza la versión de la otra comunidad aunque cambie de área.
- **Áreas desdobladas.** `areasDe()` sustituye Conocimiento del Medio por Ciencias de la Naturaleza y Ciencias Sociales, y Educación Artística por Plástica y Música, donde la comunidad las separa. Los temas de Conocimiento del Medio y de Artística que tienen sentido en esas áreas están duplicados en `temas.json` con el área nueva. No tenemos el currículo detallado de esas comunidades: sus fichas solo citan el decreto verificado de `prompts.js` y los bloques del área estatal de procedencia, nunca criterios.
- `ccaa` limita el tema a esas comunidades (temas propios de Canarias: volcanes, laurisilva, silbo gomero…). Sin `ccaa`, vale para todas.
- Las áreas que no existen en un curso o comunidad (p. ej. Valores Cívicos antes de 5.º o Educación Emocional fuera de Canarias) se filtran solas con `areasDe()` de `prompts.js`.
- **`porCiclo` y `contextos` son lo que diferencia de verdad una página de otra.** Rellénalos siempre en los temas que vayas a indexar. Escribe solo datos que puedas comprobar: nada de números de criterio en `porCiclo`.
- **`curriculoCanarias`** (temas disponibles en Canarias): por ciclo, los saberes básicos que moviliza la SA con el código **bloque romano + número** de `data/canarias/primaria` (`I.2.2`, `II.3.4`, `V.1.10`…, el mismo formato que `verificar-ejemplos.mjs`) y 1 o 2 criterios de evaluación de ese ciclo (`"2.2"`). El generador comprueba que cada código existe en el ciclo y que no es ambiguo (hay códigos repetidos en el JSON, p. ej. `II.1`–`II.3` de Matemáticas del primer ciclo, que no se pueden citar) y se para si no. En la ficha se muestran el texto oficial de cada saber con su bloque y el criterio más relacionado con su número, su competencia específica y sus descriptores operativos; la tabla del esquema de ejemplo se rellena con esos datos, y los índices de área de Canarias enlazan cada criterio con las fichas que lo trabajan. Al elegirlos: saberes del ciclo exacto (la numeración cambia de un ciclo a otro) y que el `porCiclo` y el producto los trabajen de verdad.

## Cómo añadir ejemplos generados por IA

1. Genera la SA en la app (o en el prototipo) con los mismos datos del CTA de la página.
2. Descárgala en Markdown y guárdala como `seo/ejemplos/<ccaa>/<area>/<tema>.md` (o `<tema>.<curso>.md` para un curso concreto, p. ej. `charcos-de-marea.3.md`).
3. Añade una cabecera:
   ```
   ---
   curso: 3
   revisado: sí
   fecha: 2026-11-20
   ---
   ```
4. **Revísala como docente** antes de poner `revisado: sí`: criterios y competencias contra el decreto, quitando o resolviendo las marcas `[VERIFICAR CON DECRETO]` (se muestran resaltadas). Sin `revisado: sí` se publica con un aviso de «borrador pendiente de revisión» y no fuerza la indexación.
   En Canarias, el ejemplo sigue la plantilla oficial en 10 apartados (ver `docs/plantillas/README.md`): fundamentación curricular con saberes literales y tabla de técnicas, herramientas e instrumentos; evaluación con tipos según el agente y rúbrica con los cuatro niveles oficiales (Insuficiente, Suficiente/Bien, Notable, Sobresaliente) y sus descriptores literales; Red Canaria-InnovAS; y valoración del ajuste (desarrollo y propuestas de mejora). `node seo/verificar-ejemplos.mjs` debe pasar sin errores.
5. `node seo/generate.mjs && node seo/validate.mjs`.

Un ejemplo `<tema>.md` se muestra completo solo en el curso indicado en `curso:` (por defecto, el primero del tema). En los demás cursos aparece un extracto con enlace al completo y un CTA para generar la versión de ese curso: así no se duplica el mismo texto en seis URL. Los encabezados se desplazan un nivel (el `##` del ejemplo pasa a `<h3>`), y el HTML del Markdown se escapa siempre.

## Indexación por lotes

Publicar cientos de fichas casi iguales de golpe es la forma más rápida de que Google trate el sitio como contenido delgado. Por eso **todas las páginas se generan (sirven al usuario y reparten enlaces), pero solo se indexa un lote**. Las demás llevan `noindex,follow` y no entran en el sitemap. Lo controla `config.json → indexacion`:

| Clave | Efecto |
| --- | --- |
| `ccaa` | Comunidades del lote activo. Sus índices y fichas pueden indexarse; los de las demás comunidades, no |
| `prioridadMax` | Se indexan las fichas con `prioridad` ≤ este valor (los temas sin prioridad cuentan como 3) |
| `unoPorCiclo` | Dentro de un ciclo, 3.º y 4.º solo se distinguen por el número de curso: se indexa solo el primero del ciclo |
| `exigirDiferencial` | Una ficha del lote solo se indexa si tiene contenido diferencial en su ciclo: `porCiclo` y, en Canarias, `curriculoCanarias` (saberes y criterio literales); fuera de Canarias, `contextos` de esa comunidad. Si le falta, sale `noindex,follow` aunque cumpla el resto |
| `siempreConEjemplo` | Una ficha con ejemplo **revisado** propio de ese curso se indexa siempre, esté o no en el lote |

### Estado de los lotes

| Lote | Fecha | Configuración | Fichas indexables | URL en el sitemap |
| --- | --- | --- | --- | --- |
| 1 | 2026-11-17 | Canarias, `prioridadMax: 1`, `unoPorCiclo` | 70 | 131 (70 fichas + 60 índices + portada) |
| 2 (activo) | 2026-11-18 | Canarias, `prioridadMax: 2`, `unoPorCiclo`, `exigirDiferencial` | 161 (70 + 91 nuevas) | 222 (161 fichas + 60 índices + portada) |

Lote 2: los 43 temas de prioridad 2 disponibles en Canarias (91 pares tema × ciclo) tienen ahora `porCiclo` y `curriculoCanarias` en todos sus ciclos, y los 32 de prioridad 1 (70 pares) también llevan `curriculoCanarias`; por eso todas las fichas del lote cumplen `exigirDiferencial`. Siguen fuera del sitemap 809 páginas: los segundos cursos de cada ciclo, los temas de prioridad 3 y Andalucía y Madrid. Los índices de área de Canarias incluyen ahora, por ciclo, el bloque «Criterios de evaluación de <área> en el <n> ciclo» con los criterios literales enlazados a las fichas que los trabajan; las fichas enlazan de vuelta a su bloque (`#criterios-ciclo-<n>`), igual que los índices curso + área.

**Ojo con el calendario:** el plan de abajo pide esperar a que Search Console muestre el lote 1 indexado y con impresiones (3–4 semanas) antes de ampliar. El lote 2 se activó el día siguiente al lote 1; si se prefiere seguir el plan al pie de la letra, basta con volver a `prioridadMax: 1` (el contenido diferencial añadido se queda en todas las fichas) y reactivar el lote 2 cuando haya datos.

Plan sugerido (cada paso, cuando Search Console muestre que el lote anterior está indexado y recibe impresiones, unas 3–4 semanas):

1. **Lote 1**: Canarias, prioridad 1. Da de alta el dominio en Google Search Console y envía `sitemap.xml`.
2. Añade ejemplos revisados a las 10–20 fichas con más impresiones (Search Console → Rendimiento → Páginas). Son las que pueden posicionar.
3. **Lote 2** (hecho): `prioridadMax: 2` en Canarias, rellenando antes `porCiclo` y `curriculoCanarias` de esos temas.
4. **Lote 3**: añade `andalucia` y `madrid` a `indexacion.ccaa` cuando sus temas tengan `contextos` propios o ejemplos de esa comunidad (si no, son casi iguales a las de Canarias, salvo la normativa).
5. Desactiva `unoPorCiclo` solo para los temas que tengan ejemplos por curso.

Señales para frenar: muchas URL en «Rastreada: actualmente sin indexar» o «Duplicada: Google ha elegido una canónica diferente». En ese caso, no amplíes el lote: añade ejemplos y `porCiclo` a lo que ya está.

## Enlazado interno

- Cada ficha enlaza: el mismo tema en otros cursos, hasta 8 temas del área en el mismo curso (rotados según el tema para repartir enlaces y no enlazar siempre los mismos), las áreas conectadas del mismo curso y el mismo tema en otras comunidades.
- Migas de pan: Recursos → comunidad → curso → curso+área → tema (también en JSON-LD).
- Los índices de comunidad, área, curso y curso+área enlazan todas sus fichas, de modo que cualquier página está a 3 clics como máximo de `/recursos/`.
- En Canarias, el índice de cada área lista por ciclo los criterios de evaluación literales del Decreto 211/2022 agrupados por competencia específica, y bajo cada criterio enlaza las fichas (primer curso del tema en ese ciclo) cuyo `curriculoCanarias` lo toma como criterio de referencia. Las fichas y los índices curso + área enlazan a ese bloque.
- **Pendiente fuera de este módulo**: enlazar `/recursos/` desde la landing (`shared/landing.html`: menú o pie) y desde la app. Sin ese enlace, Google solo llega por el sitemap.

## Comprobaciones de `validate.mjs`

Doctype, un `<title>` y un `<h1>` por página, meta description, canonical = URL, title únicos, JSON-LD que se puede parsear, etiquetas bien anidadas, `&` escapados, ids únicos, todos los enlaces internos resuelven a un fichero, los CTA llevan parámetros, sitemap con URL únicas del dominio que existen y no son `noindex`, y `robots.txt` con la línea `Sitemap`.
