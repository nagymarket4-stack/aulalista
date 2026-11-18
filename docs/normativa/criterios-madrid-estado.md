# Criterios de evaluación de Primaria en la Comunidad de Madrid: estado de la base RAG

> Revisado el 18/11/2026. Ficheros en `data/madrid/primaria/*.json`. Fuente normativa: Decreto 61/2022, de 13 de julio (BOCM n.º 169, de 18/07/2022, págs. 15-126), anexo II.

## Fuente

- **PDF oficial:** `https://www.bocm.es/boletin/CM_Orden_BOCM/2022/07/18/BOCM-20220718-1.PDF` (431.910 caracteres de texto para WebFetch). Se leyó directamente del servidor del BOCM, sin intermediarios de terceros.
- **Modificaciones:** el Decreto 59/2024, de 12 de junio (BOCM n.º 140, de 13/06/2024), solo cambia el art. 9.1 (áreas que pueden impartirse en lengua extranjera). No toca el anexo II. Fuente: `https://noticias.juridicas.com/base_datos/CCAA/925308-d-59-2024-de-12-jun-ca-madrid-modificacion-de-los-decretos-61-2022-65-2022.html`. Pendiente: comprobar si hubo corrección de errores del propio Decreto 61/2022.
- **Texto consolidado oficial** (no se pudo abrir: fuera de la lista de URL permitidas de WebFetch): `https://gestiona.comunidad.madrid/wleg_pub/servlet/Servidor?opcion=VerHtml&nmnorma=12774`, enlazado desde `https://www.comunidad.madrid/educacion/regulacion-educacion-primaria`.

## Estructura del anexo II en Madrid

- Criterios **por ciclo**, numerados `X.Y` (competencia.criterio). La numeración se reinicia en cada ciclo.
- Las tablas «Competencias específicas / Criterios de evaluación» **no vinculan descriptores operativos** ni a criterios ni a competencias. Por eso `descriptores: []`.
- Los enunciados de las competencias se repiten en cada ciclo, a veces con pequeñas variantes. El enunciado del 1.er ciclo está en `competencias[]`; las variantes, en `ciclos.<ciclo>.enunciados_ciclo`.
- Madrid llama «Contenidos» a lo que el RD llama saberes básicos: van por ciclo y por bloques.
- Segunda Lengua Extranjera y Tecnología y Robótica tienen una **tabla única para toda la etapa**, sin cursos asignados (art. 7.4: oferta de centro). Se replica en los tres ciclos para que `curriculoDe` funcione en cualquier curso.

## Cobertura

| Área (`area`) | Fichero | Competencias | 1.er ciclo | 2.º ciclo | 3.er ciclo | Total | Páginas BOCM de las tablas |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Matemáticas | `matematicas.json` | 8 | 17 | 17 | 17 | 51 | 97-98 · 100-101 · 105-106 |
| Lengua Castellana y Literatura | `lengua-castellana-y-literatura.json` | 10 | 19 | 20 | 21 | 60 | 71-73 · 75-76 · 79-81 |
| Ciencias de la Naturaleza | `ciencias-de-la-naturaleza.json` | 6 | 17 | 18 | 17 | 52 | 33-34 · 36 · 39-40 |
| Ciencias Sociales | `ciencias-sociales.json` | 5 | 11 | 11 | 11 | 33 | 42-43 · 44-45 · 47-48 |
| Educación Artística | `educacion-artistica.json` | 4 | 11 | 11 | 12 | 34 | 50-51 · 53-54 · 56-57 |
| Educación Física | `educacion-fisica.json` | 5 | 13 | 16 | 16 | 45 | 60-62 · 64-65 · 67-68 |
| Lengua Extranjera (Inglés) | `lengua-extranjera.json` | 6 | 13 | 15 | 15 | 43 | 85-86 · 87-89 · 91-93 |
| Educación en Valores Cívicos y Éticos (5.º) | `educacion-en-valores-civicos-y-eticos.json` | 4 | — | — | 11 | 11 | 110-111 |
| Segunda Lengua Extranjera (tabla de etapa) | `segunda-lengua-extranjera.json` | 6 | 16* | 16* | 16* | 16 | 115-116 |
| Tecnología y Robótica (tabla de etapa) | `tecnologia-y-robotica.json` | 6 | 15* | 15* | 15* | 15 | 123-124 |
| **Total de criterios distintos** | | **60** | | | | **360** | |

\* La misma tabla replicada en cada ciclo.

- Están las 10 áreas que devuelve `areasDe('madrid', …)`. La clave `area` coincide con esos nombres sin paréntesis: «Lengua Extranjera (Inglés)» pasa a «Lengua Extranjera».
- Ningún criterio está en `null`. En casi todas las áreas y ciclos se pidió aparte la lista de números de criterio antes de transcribir, y cuadra con los textos obtenidos.
- **`verificado: false` en las 10 áreas.**
- `saberes: {}` y `bloques: {}`: no se han extraído los contenidos, y Madrid no tiene «bloques competenciales» como Canarias.

## Método

1. Mapa del PDF por desplazamientos de WebFetch (0, 100000, 200000, 300000 y 400000), con el área, el ciclo y la página de cada tabla:

| Desplazamiento | Contenido |
| --- | --- |
| 0 | Articulado y Ciencias de la Naturaleza (págs. 15-41) |
| 100000 | Ciencias Sociales, Educación Artística y Educación Física (1.er y 2.º ciclo) |
| 150000 | Educación Física, 3.er ciclo |
| 200000 | Lengua Castellana y Literatura e Inglés (1.er y 2.º ciclo) |
| 250000 | Inglés, 3.er ciclo |
| 300000 | Matemáticas |
| 320000-340000 | Valores Cívicos y Éticos, y Segunda Lengua Extranjera |
| 400000 | Contenidos de Francés, Alemán, Italiano y Portugués; Tecnología y Robótica; anexos III-IV |

2. WebFetch limita cada cita literal a unos 125 caracteres y se niega a copiar una sección entera. Por eso se pidieron entre 4 y 14 criterios por consulta, «en citas consecutivas de menos de 100 caracteres, sin saltar palabras», y se unieron los fragmentos.
3. Los enunciados de las competencias se transcribieron del 1.er ciclo. En el 2.º y el 3.º se pidió una comparación palabra a palabra con el 1.er ciclo y la cita completa de los que cambian.
4. Se reconsultaron las rarezas: LCL C10 y 9.2 del 1.er ciclo, LCL 5.1 del 2.º ciclo, CN C3 y 6.2 del 3.er ciclo, CS 4.1 del 2.º ciclo frente al del 3.º. Todas dieron el mismo resultado.
5. Los JSON se generaron con un script fuera del repositorio, a partir de las transcripciones, sin ninguna edición del texto. Hay dos excepciones:
   - se quitaron los números iniciales («1.1.») que repetía la cita;
   - en Segunda Lengua Extranjera 2.2 se quitó un «a partir de» duplicado en la unión de dos fragmentos.

## Riesgos y pendientes

- **Cotejo con el PDF.** Es el paso que falta para poner `verificado: true`. Puede hacerse como en Canarias: descargar el PDF del BOCM, pasarlo por `pdftotext` y buscar cada `texto` como subcadena normalizada (adaptando `tools/verificar_criterios_canarias.py`). La shell de este entorno no tiene red: el proxy devuelve 403 para bocm.es.
- **Variantes de puntuación entre ciclos.** Las del extractor en los enunciados de competencias, de una coma o una palabra, son poco fiables. En dos consultas sobre Matemáticas C6 dio versiones distintas. Están guardadas en `enunciados_ciclo`, pero hay que confirmarlas o descartarlas en el cotejo.
- **Guiones perdidos por el corte de línea:** «perceptivomotrices», «físicodeportivas», «colaboraciónoposición» (Educación Física). Se conservan tal cual.
- **Posibles erratas del BOCM o del extractor**, anotadas en el `pendiente` de cada JSON. Algunas:
  - LCL 1.er ciclo 9.2, «terminología de la lengua básica»;
  - Valores 2.5, «organismos internaciones»;
  - SLE 5.3, «una segunda extranjera»;
  - Artística 3.er ciclo 4.4, «considerado su madurez».
- **Contenidos sin extraer** en todas las áreas: siguiente pasada, por ciclo y bloque (A, B, C…).
- **Inyección en el prompt.** `curriculoDe` (en `shared/prompts.js`) presenta cualquier dato de `data/<ccaa>/primaria` como «texto literal del decreto, cotejado con el BOC» y manda no usar [VERIFICAR CON DECRETO]. Para Madrid eso no es cierto hasta el cotejo. Conviene que esa función mire `verificado` y cambie la cabecera (y el nombre del boletín) según la comunidad.
