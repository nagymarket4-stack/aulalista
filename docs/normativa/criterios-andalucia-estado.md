# Criterios de evaluación de Primaria en Andalucía: estado de la base RAG

> Revisado el 18/11/2026. Ficheros en `data/andalucia/primaria/*.json`. Fuente normativa: Orden de 30 de mayo de 2023 (BOJA n.º 104, de 2/06/2023), anexo II, que desarrolla el Decreto 101/2023, de 9 de mayo (BOJA n.º 90, de 15/05/2023).

## Fuente

- **PDF oficial:** `https://www.juntadeandalucia.es/eboja/2023/104/BOJA23-104-00208-9731-01_00284747.pdf` (735.082 caracteres para WebFetch). Se leyó directamente del servidor de la Junta.
- La versión HTML (`https://www.juntadeandalucia.es/boja/2023/104/39`) **no sirve**: se corta en el art. 43 y no incluye los anexos.

## Estructura del anexo II en Andalucía

Cada área tiene una introducción, el apartado «Competencias Específicas» (con su descripción), el apartado «Saberes básicos» (tres columnas por ciclo) y una tabla por ciclo. Las columnas de esa tabla son:

- `Competencias específicas`: el enunciado y debajo los descriptores del Perfil de salida;
- `Criterios de evaluación` del primer curso del ciclo;
- `Criterios de evaluación` del segundo curso del ciclo;
- `Saberes básicos`: códigos como `MAT.1.A.3.1.`.

Los **criterios son por curso**:

- `X.Y.a` es el primer curso del ciclo (1.º, 3.º, 5.º);
- `X.Y.b` es el segundo curso (2.º, 4.º, 6.º).

Cada criterio del JSON lleva un campo `curso`. Los descriptores van ligados a la **competencia**, no al criterio. Por eso están en `competencias[].descriptores` y `criterios[].descriptores` queda vacío.

Mapa del PDF (página «9731/N»):

| Área | Comp. y saberes | Tablas por ciclo |
| --- | --- | --- |
| Conocimiento del Medio N., S. y C. | 27-38 | 1.er: 38-42 · 2.º: 43-47 · 3.er: 48-~53 |
| Educación Artística | 54-60 | 61 · 63 · 65 |
| Educación Física | 68-~73 | no localizadas (a partir del desplazamiento 300000) |
| Lengua Castellana y Literatura | ~95-102 | 103 · 107 · 113 |
| Primera y Segunda Lengua Extranjera | 118-124 | no localizadas (desplazamiento 500000) |
| Matemáticas | ~140-149 | 151 · 153 · 156 |

## Cobertura

| Área (`area`) | Fichero | Competencias | 1.er ciclo (1.º/2.º) | 2.º ciclo (3.º/4.º) | 3.er ciclo (5.º/6.º) | Total |
| --- | --- | --- | --- | --- | --- | --- |
| Matemáticas | `matematicas.json` | 8 (con descriptores) | 17/17 | 16/17 | 17/17 | 101 |

- **`verificado: false`.**
- En el 2.º ciclo no existe el criterio 2.3.a: la columna de 3.º no lo trae (reconsultado).
- `saberes: {}`: los saberes básicos no se han extraído.

## Pendiente (no extraído)

Por orden de prioridad:

1. **Conocimiento del Medio Natural, Social y Cultural:** tablas en las págs. 38-53, desplazamientos de WebFetch de unos 170000 a 230000.
2. **Lengua Castellana y Literatura:** págs. 103-117, desplazamientos de unos 430000 a 480000.
3. **Educación Artística:** págs. 61-67, desplazamiento de unos 250000.
4. **Educación Física:** a partir de la pág. 74, desplazamiento de unos 300000.
5. **Lengua Extranjera y Segunda Lengua Extranjera:** a partir de la pág. 125, desplazamiento de unos 500000.
6. **Educación en Valores Cívicos y Éticos:** sin localizar; probablemente entre los desplazamientos 300000 y 400000.
7. **Saberes básicos** de todas las áreas.

Para hacerlo, hay que pedir de 8 a 14 criterios por consulta, separando las columnas a/b.

## Método

El mismo que en Madrid (ver `criterios-madrid-estado.md`):

- WebFetch sobre el PDF oficial;
- citas consecutivas de menos de 100 caracteres;
- consultas por bloques de competencias, con la columna de cada curso pedida aparte para no mezclarlas.

Para Matemáticas se usaron los desplazamientos 600000, 605000 y 630000.

## Riesgos

- **Tabla a dos columnas.** La extracción de texto del PDF intercala las columnas. En el 3.er ciclo el extractor avisó de que «reconstruyó el orden» de fragmentos cortados por un salto de página. Es la parte con más riesgo y la primera que hay que cotejar.
- **C7:** el extractor devolvió «mejorar la la perseverancia» en la unión de dos fragmentos. Se dejó un solo «la»; falta confirmar si la duplicación está en el BOJA.
- **Enunciados de competencias del 3.er ciclo:** no se pudo confirmar que coincidan con los del 1.er ciclo.
- **Cotejo:** descargar el PDF, pasarlo por `pdftotext -layout` y comparar. Las columnas a/b hacen recomendable `-layout`. La shell de este entorno no tiene red.
- **Uso en el prompt.** `curriculoDe` inyecta todos los criterios del ciclo, de los dos cursos, y los presenta como «cotejados con el BOC». Para Andalucía convendría:
  - filtrar por `curso` (`.a`/`.b`);
  - cambiar la cabecera mientras `verificado` sea `false`.
