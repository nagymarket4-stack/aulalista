# Criterios de evaluación de Primaria en Canarias: estado de la base RAG

> Revisado el 17/11/2026. Ficheros en `data/canarias/primaria/*.json`. Fuente normativa: Decreto 211/2022, de 10 de noviembre (BOC n.º 231, de 23/11/2022), anexo 2.

## Cobertura

| Área | Fichero | Competencias (enunciado) | 1.er ciclo | 2.º ciclo | 3.er ciclo | Total | Páginas BOC de los bloques |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Matemáticas | `matematicas.json` | 8/8 | 14 | 14 | 14 | 42 | 45802-45806 · 45812-45816 · 45824-45828 |
| Lengua Castellana y Literatura | `lengua-castellana-y-literatura.json` | 10/10 | 15 | 15 | 15 | 45 | 45716-45725 · 45729-45738 · 45742-45751 |
| Conocimiento del Medio N., S. y C. | `conocimiento-del-medio-natural-social-y-cultural.json` | 9/9 | 24 | 24 | 24 | 72 | ~45560-45568 · 45573-45581 · 45587-45595 |
| Educación Artística | `educacion-artistica.json` | 4/4 | 10 | 10 | 10 | 30 | 45610-45613 · 45616-45619 · 45623-45626 |
| Educación Emocional y para la Creatividad | `educacion-emocional-y-para-la-creatividad.json` | 4/4 | 8 | 8 | 7 | 23 | 45637-45640 · 45644-45647 · 45652-45655 |
| Educación Física | `educacion-fisica.json` | 5/5 | 9 | 9 | 9 | 27 | 45669-45673 · 45676-45680 · 45683-45687 |
| Lengua Extranjera | `lengua-extranjera.json` | 6/6 | 15 | 15 | 15 | 45 | 45766-45771 · 45774-45779 · 45783-45788 |
| Educación en Valores Cívicos y Éticos | `educacion-en-valores-civicos-y-eticos.json` | 4/4 | — | — | 9 | 9 | 45700-45703 |
| Segunda Lengua Extranjera | `segunda-lengua-extranjera.json` | 6/6 | — | — | 15 | 15 | 45848-45853 |
| **Total** | | **56/56** | | | | **308** | |

- Todos los criterios tienen texto (ninguno en `null`) y descriptores operativos por criterio.
- Los recuentos coinciden con los de `02-canarias-decreto-211-2022.md` (Conocimiento del Medio 24 por ciclo; Artística 10; EMOCREA 8/8/7; Educación Física 9).
- **`verificado: false` en las 9 áreas.** El texto se obtuvo de forma literal, pero no del servidor oficial y a través de un intermediario automático (ver «Método»). Pasar a `true` solo tras cotejar con el PDF de la sede.
- `saberes: []` en todos los criterios. El decreto no vincula saberes a criterios concretos: los organiza por bloques y ciclo, aparte.

## Método

1. **El HTML oficial del BOC no contiene los criterios.** En `https://www.gobiernodecanarias.org/boc/2022/231/001.html` y en la versión de solo texto `https://www.gobiernodecanarias.org/boc/archivo/2022/231/pda/001.html` (601.392 caracteres), bajo cada «Bloques competenciales» de ciclo no hay texto: salta directamente a «Saberes básicos». Las tablas solo están en el PDF. Ese HTML sí sirve para los saberes básicos, que están en texto.
2. **El PDF oficial no se pudo leer.** `https://sede.gobiernodecanarias.org/boc/boc-a-2022-231-3533.pdf` está bloqueado por robots.txt para WebFetch. También están bloqueados los PDF/ODT por área de la Consejería (`https://www.gobiernodecanarias.org/cmsgob1/export/sites/educacion/web/_galerias/descargas/curriculo-primaria/...`, listados en `https://www.gobiernodecanarias.org/educacion/web/primaria/informacion/contenidos/curriculos/index.html`). La shell no tiene salida a internet (el proxy rechaza `gobiernodecanarias.org`).
3. **Fuente usada: copia íntegra del PDF del BOC alojada por un tercero.** Es `https://www.campuseducacion.com/blog/wp-content/uploads/2023/01/Curriculo-LOMLOE-Pirmaria-Canarias.pdf` (1.072.517 caracteres). Conserva las cabeceras «Boletín Oficial de Canarias núm. 231 … Miércoles 23 de noviembre de 2022» y la paginación del BOC (45514-45859). Se leyó con WebFetch por desplazamientos:

| Desplazamiento | Contenido |
| --- | --- |
| 100000 | Conocimiento del Medio: enunciados y 1.er ciclo |
| 200000 | Conocimiento del Medio: 2.º y 3.er ciclo |
| 300000 | Educación Artística |
| 400000 | EMOCREA |
| 500000 | Educación Física |
| 600000 | Valores Cívicos (3.er ciclo) y Lengua Castellana (enunciados, 1.er ciclo, 2.º ciclo C1-C2) |
| 700000 | Lengua Castellana (2.º ciclo C3-C10 y 3.er ciclo) |
| 800000 | Lengua Extranjera |
| 900000 | Matemáticas |
| 1000000 | Segunda Lengua Extranjera |

4. **Extracción.** WebFetch limita cada cita literal a unos 125 caracteres. Por eso se pidió cada criterio «en citas consecutivas sin saltar palabras», por bloques de 2-4 competencias, y se concatenaron los fragmentos. Cuando la herramienta resumió en vez de citar (Conocimiento del Medio, 3.er ciclo, C1-C2), se repitió la petición con un alcance menor hasta obtener la cita.
5. **Comprobaciones hechas:**
   - Matemáticas, 1.er ciclo, 1.1 y 2.1 coinciden palabra por palabra con la secuenciación del CEIP La Escalona (`https://www3.gobiernodecanarias.org/medusa/edublog/ceiplaescalona/wp-content/uploads/sites/100/2022/10/matematicas-primer-ciclo-lomloe.pdf`), una fuente independiente.
   - Se reconsultaron las rarezas del texto. LCL 9.2 del 2.º ciclo, CMNSC 9.2 del 1.er ciclo y los descriptores de CMNSC 6.1 del 2.º ciclo dieron el mismo resultado.
   - Los recuentos por área cuadran con los ya registrados en la ficha del decreto.

## Riesgos y pendientes

- **Cotejo humano con el PDF oficial** de la sede, área por área: es el único paso que falta para marcar `verificado: true`. Hay riesgo residual de palabras sueltas perdidas o cambiadas en la unión de fragmentos o por el modelo intermedio de WebFetch. Hay que mirar sobre todo la puntuación y las enumeraciones largas.
- **Posibles erratas del BOC o fallos de extracción**, conservadas tal cual y anotadas en el campo `pendiente` de cada JSON:
  - LCL, 1.er ciclo, 7.2: descriptor «CCE3» (en los otros ciclos es CC3).
  - LCL, 2.º ciclo, 9.2: «progresando en la reflexión metalingüística, la terminología adecuada».
  - CMNSC, 1.er ciclo, 9.2: «señalando y reconocer de las funciones».
  - CMNSC, 2.º ciclo, 6.1: descriptores solo CC3, CC4 y CE1.
  - EF, 2.º ciclo, 3.1: «hacía el esfuerzo».
  - LE, 1.1: «propósitos de comunicación cotidianas»; LE, 5.3: «análogicas».
  - EMOCREA, enunciado de C4: «la utilización múltiples lenguajes».
  - Artística, 2.º ciclo: los descriptores se extrajeron en una consulta aparte.
- **Enunciados de competencias:** se tomaron del bloque del 1.er ciclo o del apartado general. Falta confirmar que son idénticos en todos los ciclos.
- **Saberes básicos:** no transcritos en ninguna área. Se pueden sacar del HTML de solo texto (está en texto plano), por bloques y ciclo, en una pasada posterior.
- **Fuente de terceros:** si se prefiere no depender de campuseducacion.com, la alternativa es descargar el PDF de la sede desde un navegador o una máquina con acceso, y comparar automáticamente (`pdftotext`) con los JSON.

## Recomendaciones

1. Descargar a mano el PDF oficial (`boc-a-2022-231-3533.pdf`) y pasar un script de comparación: normalizar los espacios y buscar cada `texto` como subcadena del `pdftotext`. Los que coincidan se pueden marcar como verificados de forma masiva. Al final, poner `verificado: true` por área.
2. Adaptar `shared/prompts.js` para que la inyección RAG use `data/canarias/primaria/*.json`. Hasta el cotejo, en la interfaz de producto conviene presentar los criterios como «según el Decreto 211/2022», sin afirmar verificación oficial.
3. Segunda pasada para los saberes básicos desde `https://www.gobiernodecanarias.org/boc/archivo/2022/231/pda/001.html`: desplazamientos 100000-200000 para CMNSC, 200000-300000 para Artística/EMOCREA, 300000-400000 para EF/Valores/LCL, 400000-500000 para LCL/LE/Matemáticas y 500000-600000 para Matemáticas/SLE.

## Cotejo con el PDF oficial (17/11/2026)

El texto se ha cotejado con el PDF oficial del BOC (`boc-a-2022-231-3533.pdf`, aportado por el usuario) usando `tools/verificar_criterios_canarias.py`. El script compara palabra a palabra, después de quitar las cabeceras de página y las celdas de descriptores que `pdftotext` intercala.

| Elemento | Total | Coinciden literalmente | Diferencias |
| --- | --- | --- | --- |
| Criterios de evaluación | 308 | 307 | 1: EF 1.er ciclo 4.2, «artístico-expresivas», donde el guion queda partido por la maquetación del PDF. El texto es correcto |
| Enunciados de competencias específicas | 56 | 54 | 2: EF C2 y C4, mismo caso de guion partido. El texto es correcto |

**Resultado: todo el texto es fiel al BOC.** Los JSON pasan a `verificado: true`.

Las posibles erratas que anotó el curriculista (p. ej. «CCE3» o «señalando y reconocer de las funciones») **están en el propio BOC**: se mantienen tal cual, porque es el texto oficial.

Pendiente:
- extraer los saberes básicos;
- cotejar automáticamente los descriptores operativos.

## Fase 2: saberes básicos, bloques competenciales y descriptores (17/11/2026)

Fuente: el PDF oficial (`boc-a-2022-231-3533.pdf`) pasado por `pdftotext -layout`. Script reproducible: `tools/extraer_saberes_canarias.py <layout.txt> [--escribir] [--volcado salida.json]`. Sin `--escribir` solo saca el informe. Se usa `-layout` porque mantiene la columna de descriptores alineada con su criterio y conserva los guiones de las palabras compuestas al final de línea. Sin `-layout`, `pdftotext` convierte «pausada-agitada» en «pausadaagitada».

### Campos nuevos en cada `data/canarias/primaria/<area>.json`

- `saberes.{primer|segundo|tercer}`: lista de bloques del BOC (`"bloque": "I. …"`). Cada bloque tiene una de estas dos formas:
  - `items`, si el BOC numera los saberes directamente («1.», «2.»…);
  - `apartados: [{"apartado": "1. …", "items": ["1.1. …", "2.2.1. …"]}]`, si hay subapartados.
  
  Los ítems son literales y conservan la numeración del BOC.
- `bloques.{ciclo}`: lista con estos campos:
  - `competencias`: p. ej. `["C1"]`, o `["C1","C2"]` en Matemáticas;
  - `criterios`: p. ej. `["1.1","1.2"]`;
  - `descriptores`: la fila de la competencia específica;
  - `explicacion`: la «Explicación del bloque competencial», literal.
- `cotejo.fase2`: método, fecha y lista de descriptores corregidos (vacía).
- `pendiente`: se han quitado las notas de saberes sin extraer, descriptores sin cotejar y enunciados sin comprobar por ciclo, porque ya están resueltas.

### Cobertura

En la columna de saberes, «bloques/ítems» cuenta los bloques del BOC y los ítems numerados que contienen. Los títulos de apartado no se cuentan como ítems.

| Área | Saberes 1.er ciclo (bloques/ítems) | 2.º ciclo | 3.er ciclo | Bloques competenciales por ciclo |
| --- | --- | --- | --- | --- |
| Conocimiento del Medio | 3/46 | 3/47 | 3/52 | 9 |
| Educación Artística | 4/26 | 4/34 | 4/36 | 4 |
| EMOCREA | 5/37 | 5/41 | 5/46 | 4 |
| Educación Física | 6/29 | 6/29 | 6/31 | 5 |
| Valores Cívicos y Éticos | — | — | 3/28 | 4 |
| Lengua Castellana y Literatura | 4/31 | 4/32 | 4/31 | 10 |
| Lengua Extranjera | 4/30 | 4/32 | 4/32 | 6 |
| Matemáticas | 6/60 | 6/91 | 6/99 | 6 (C1-C2 y C7-C8 agrupadas) |
| Segunda Lengua Extranjera | — | — | 4/32 | 6 |
| **Total** | | | **952 ítems** | **142 bloques con explicación** |

### Comprobaciones

- **Saberes y explicaciones.** Las 1.151 unidades de texto (títulos de bloque y de apartado, e ítems) y las 142 explicaciones aparecen literalmente en el `pdftotext` normal, que es una segunda extracción independiente, tras normalizar espacios y puntuación.
- **Numeración.** Es correlativa en todos los bloques; el script avisa si no lo es. Ningún párrafo queda sin numerar.
- **Criterios.** Los 308 se localizan en su bloque y ciclo, y su texto coincide con el del JSON.
- **Enunciados de competencias.** Coinciden en los tres ciclos con el enunciado de la ficha: 148 comprobaciones.
- **Descriptores operativos.** Los 308 criterios coinciden con la columna de descriptores del PDF. **Correcciones: 0.**

### Rarezas literales del BOC (se conservan tal cual)

- **CMNSC, 2.º ciclo:** el criterio «1.2 Reelaborar…» no lleva punto tras el número.
- **Matemáticas, 3.er ciclo:** el apartado «1 Conteo y cantidad» no lleva punto tras el número.
- **Matemáticas, 1.er ciclo, bloque II «Sentido de la medida»:** los ítems reinician la numeración en cada apartado («1. Magnitud» → 1., 2., 3.), mientras que el resto usa «1.1.». Se marca con `nota` en el JSON.
- **Lengua Extranjera, 2.º ciclo, II.2:** el ítem termina sin punto.
- **Descriptores de criterios que no están en la fila de su competencia** (probables erratas del BOC; se mantienen):
  - LCL 1.er ciclo 7.2: «CCE3»;
  - LCL 3.er ciclo 1.1: «CCEC2», cuando la competencia C1 lista CCEC1 y CCEC3.
- **Explicaciones con erratas de origen:** se transcriben sin corregir. Ejemplos: «personas usuarios» (CMNSC 1.er ciclo, C9) y «la utilización recursos» (EMOCREA 1.er ciclo, C1).

### Uso previsto

`bloques[].explicacion` describe qué observar al evaluar cada bloque de criterios, y `saberes` da los contenidos por ciclo. Los dos pueden inyectarse en el prompt de generación de SA junto a los criterios. El decreto no vincula saberes a criterios concretos, así que `criterios[].saberes` sigue vacío a propósito.
