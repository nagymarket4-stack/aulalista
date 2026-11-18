# Criterios de evaluación de Primaria en Andalucía: estado de la base RAG

> Revisado el 18/11/2026 (2.ª pasada). Ficheros en `data/andalucia/primaria/*.json`. Fuente normativa: Orden de 30 de mayo de 2023 (BOJA n.º 104, de 2/06/2023), anexo II. La Orden desarrolla el Decreto 101/2023, de 9 de mayo (BOJA n.º 90, de 15/05/2023).

## Fuente

- **PDF oficial:** `https://www.juntadeandalucia.es/eboja/2023/104/BOJA23-104-00208-9731-01_00284747.pdf` (735.082 caracteres para WebFetch), leído directamente del servidor de la Junta.
- **La versión HTML no sirve** (`https://www.juntadeandalucia.es/boja/2023/104/39`): se corta en el art. 43 y no trae los anexos.

## Estructura del anexo II

Cada área tiene una introducción, el apartado «Competencias Específicas» y el apartado «Saberes básicos». Los saberes van en tres columnas, una por ciclo, con códigos del tipo `MAT.1.A.1.1.`. Después viene una tabla por ciclo con estas columnas:

- `Competencias específicas`: el enunciado y, debajo, los descriptores del Perfil de salida;
- `Criterios de evaluación` del primer curso del ciclo;
- `Criterios de evaluación` del segundo curso del ciclo;
- `Saberes básicos`: códigos vinculados.

Cómo se ha volcado al JSON:

- **Criterios por curso.** `X.Y.a` corresponde al primer curso del ciclo (1.º, 3.º, 5.º) y `X.Y.b` al segundo (2.º, 4.º, 6.º). Cada criterio lleva el campo `curso`.
- **Descriptores.** Están ligados a la competencia, así que van en `competencias[].descriptores`. `criterios[].descriptores` queda vacío a propósito.
- **Saberes.** Se guardan en `saberes.<ciclo>` como lista de `{bloque, apartados:[{apartado, items}]}`, con el código literal del BOJA al principio de cada apartado e ítem.

Al extraer el texto del PDF, las tres columnas de saberes se mezclan. Se separaron por el código de ciclo, que va en el segundo campo (`MAT.1.…`, `MAT.2.…`, `MAT.3.…`).

## Cobertura

| Área (`area`) | Fichero | Comp. (con descriptores) | 1.er ciclo (1.º/2.º) | 2.º ciclo (3.º/4.º) | 3.er ciclo (5.º/6.º) | Total | Saberes (bloques/ítems por ciclo) | Págs. tablas |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Matemáticas | `matematicas.json` | 8 | 17/17 | 16/17 | 17/17 | 101 | 6/56 · 6/68 · 6/69 | 151-159 |
| Conocimiento del Medio N., S. y C. | `conocimiento-del-medio-natural-social-y-cultural.json` | 9 | 22/22 | 22/22 | 23/23 | 134 | pendiente | 38-53 |
| Lengua Castellana y Literatura | `lengua-castellana-y-literatura.json` | 10 | 22/22 | 22/22 | 22/22 | 132 | pendiente | 103-117 |
| Lengua Extranjera | `lengua-extranjera.json` | 6 | 13/13 | 15/15 | 15/15 | 86 | pendiente | 126-136 |
| Educación Artística | `educacion-artistica.json` | 4 | 10/10 | 10/10 | 11/11 | 62 | pendiente | 61-67 |
| Educación Física | `educacion-fisica.json` | 5 | 14/14 | 14/14 | 14/14 | 84 | pendiente | 77-85 |
| Educación en Valores Cívicos y Éticos | `educacion-en-valores-civicos-y-eticos.json` | 4 | — | — | —/13 (solo 6.º) | 13 | pendiente | 91-92 |
| Segunda Lengua Extranjera | `segunda-lengua-extranjera.json` | 6 | — | — | 26 (los del 1.er ciclo de LE) | 26 | — | 126-129 |
| **Total** | | **52** | | | | **612 criterios distintos** (más 26 derivados) | 193 ítems | |

Notas a la tabla:

- Están las 8 áreas que devuelve `areasDe('andalucia', …)`. La clave `area` coincide con esos nombres sin paréntesis.
- **`verificado: false` en todas.**
- Ningún criterio está en `null`. Antes de transcribir cada tabla se pidió la lista de códigos, y cuadra con lo transcrito.

### Casos especiales

- **Educación en Valores Cívicos y Éticos.** La tabla tiene una sola columna, «Criterios de evaluación 6º». Los criterios van numerados `X.Y`, sin a/b, y llevan `curso: "6.º"`. El anexo I (horario) asigna el área solo a 6.º, con 1,5 h: «Educación en Valores Cívicos y Éticos - - - - - 1.5 1.5».
  - **Aviso para el producto:** `areasDe('andalucia', 5)` ofrece esta área en 5.º, pero en Andalucía no se imparte en ese curso, y `curriculoDe` devuelve `null` para 5.º.
- **Segunda Lengua Extranjera.** No tiene tablas propias. La Orden dice: «En esta etapa de Educación Primaria, el currículo del área de Segunda Lengua Extranjera partirá de los mismos elementos curriculares que se desarrollan en el Primer ciclo del área de Primera Lengua Extranjera». Para los centros plurilingües añade: «… partiendo de los mismos elementos curriculares que se desarrollan en cada uno de los ciclos del área de Primera Lengua Extranjera».
  - Por eso se cargan en `ciclos.tercer` los 26 criterios del 1.er ciclo de Lengua Extranjera, con `curso_origen` en lugar de `curso` (para que el filtro por curso no los descarte en 5.º y 6.º).
  - El anexo I asigna esta área a 5.º y 6.º (1 h en cada curso).
  - Queda por decidir en el producto qué columna, a o b, se usa en cada curso.
- **Lengua Extranjera.** El BOJA titula el área «Primera y Segunda Lengua Extranjera» y una sola serie de tablas, «Lengua Extranjera (… Ciclo)».

## Método

- WebFetch sobre el PDF oficial, con citas consecutivas de menos de 100 caracteres.
- Por consulta se pidieron los criterios de 3 a 5 competencias, con la columna de cada curso aparte («do not mix columns»).
- Desplazamientos usados:

| Desplazamiento | Contenido |
| --- | --- |
| 150000-185000 | Conocimiento del Medio |
| 240000-250000 | Artística |
| 300000-325000 | Educación Física |
| 340000-350000 | Valores |
| 412000-445000 | Lengua Castellana y Literatura |
| 470000-515000 | Lengua Extranjera |
| 565000 | Saberes de Matemáticas |
| 600000-630000 | Tablas de Matemáticas |

- Los JSON se generan con un script fuera del repositorio, a partir de las transcripciones. Solo se tocó el texto para:
  - quitar el código inicial que repetía la cita;
  - unir palabras partidas por salto de línea que el propio extractor señaló («refor-mulación», «al-gunas», «colaborati-vo»).

## Riesgos y pendientes

- **Cotejo con el PDF** (`pdftotext -layout`, por las columnas a/b): es el paso que falta para poner `verificado: true`.
  - Riesgo mayor donde el extractor avisó de que reordenó fragmentos intercalados: 3.er ciclo de Matemáticas y Lengua Extranjera 3.er ciclo 5.3.a/b.
  - La shell de este entorno no tiene red.
- **Enunciados de competencias:** se tomaron de la tabla del 1.er ciclo. Confirmación con los otros ciclos, área por área:

| Área | Confirmado | Sin confirmar |
| --- | --- | --- |
| Artística | Iguales en los tres ciclos | — |
| Conocimiento del Medio | Iguales en el 2.º ciclo | 3.er ciclo |
| Matemáticas | Iguales en el 2.º ciclo | 3.er ciclo |
| Lengua Castellana y Literatura | C8-C10 iguales en el 2.º; C6-C10 iguales entre 2.º y 3.º | El resto |
| Lengua Extranjera | C4-C6 iguales en 2.º y 3.º | C1-C3 |
| Educación Física | C3-C5 iguales entre 2.º y 3.º | El resto |

- **Rarezas literales**, anotadas en el `pendiente` de cada JSON. Algunas:
  - CMNSC C6, «desde los puntos de vista los social»; C9, «valorando de la función»;
  - CMNSC 2.º ciclo 9.3.a, «para las las personas»;
  - Artística 2.º ciclo 3.2.a, «de manera manera»;
  - EF 3.er ciclo 4.1.a, «cultura andaluza andaluza»; 2.2.a, «colaboración oposición»;
  - Valores 3.1, «argumalmente» (reconsultado: así figura);
  - Matemáticas C7, «la la perseverancia» (no se sabe si la duplicación viene del original o del extractor).
- **Saberes básicos pendientes** en Conocimiento del Medio (págs. 31-38), Lengua (~95-102), Lengua Extranjera (123-125), Artística (57-60), Educación Física (72-76) y Valores.
  - Método probado con Matemáticas: pedir un ciclo y 2-3 bloques por consulta, separando por código.
- **Vinculación saber-competencia** (4.ª columna de las tablas): no se ha extraído.
