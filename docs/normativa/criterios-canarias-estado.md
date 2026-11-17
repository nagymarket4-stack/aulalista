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
