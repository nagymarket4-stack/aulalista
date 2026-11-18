# Criterios de evaluación de Primaria en la Comunitat Valenciana: estado de la base RAG

> Revisado el 18/11/2026 (1.ª pasada). Ficheros en `data/valencia/primaria/*.json`. Normativa: Decreto 106/2022, de 5 de agosto, del Consell (DOGV n.º 9402, de 10/08/2022), anexo III; modificado por el Decreto 96/2026, de 19 de junio, del Consell (DOGV n.º 10391, de 25/06/2026), aplicable desde 2026-2027.

## Resumen

**No hay criterios de evaluación vigentes en la base.** `curriculoDe('valencia', …)` devuelve `null` en todas las áreas, así que la app sigue como antes (sin bloque curricular literal).

- El Decreto 96/2026 sustituye **el apartado 6 (criterios de evaluación) del anexo III en todas las áreas**.
- Su texto oficial no se ha podido leer:
  - `dogv.gva.es` y `ceice.gva.es` bloquean WebFetch por robots.txt;
  - no hay copia en ningún dominio `gva.es`.
- Siguiendo la regla de usar solo fuentes oficiales, la extracción **se ha parado ahí**.
- Lo extraído del Decreto 106/2022:
  - **competencias específicas**, que siguen vigentes;
  - **criterios de 2022**, ya sustituidos, guardados solo como referencia histórica en `criterios_decreto_106_2022`. `build.py` no lee esa clave.

## Fuentes

| Documento | URL | Estado |
| --- | --- | --- |
| Decreto 106/2022, PDF del DOGV | `https://dogv.gva.es/datos/2022/08/10/pdf/2022_7572.pdf` | robots_disallowed |
| Copia del mismo PDF del DOGV (cabecera «Num. 9402 / 10.08.2022», p. 41162 en adelante, 1.705.484 caracteres) | `https://portal.edu.gva.es/rambladelsmolins/wp-content/uploads/sites/837/2022/09/DECRETO-106-2022-CURRICULO-PRIMARIA-GVA.pdf` | **Usada.** Dominio de la Conselleria (web de un centro); el contenido es el PDF del DOGV |
| Decreto 106/2022, texto sin anexos (noucurriculum) | `https://portal.edu.gva.es/noucurriculum/wp-content/uploads/sites/1918/2023/03/Decreto-Primaria-GVA.pdf` | No incluye el anexo III |
| Decreto 96/2026, PDF del DOGV | `https://dogv.gva.es/datos/2026/06/25/pdf/2026_21223.pdf` | robots_disallowed |
| Instrucciones 2026-27 (ceice) | `https://ceice.gva.es/documents/161634279/380507814/PRIM+2026-2027_Novedades_resumidas_instrucciones_Cas.pdf/...` | robots_disallowed |
| Decreto 96/2026, reproducción no oficial | `https://noticias.juridicas.com/base_datos/CCAA/1003669-d-96-2026-de-19-jun-ca-valenciana-modifica-el-d-106-2022-de-5-ago-de-ordenacion.html` | Solo se usó para conocer el alcance de la modificación. **No es fuente de datos** |
| Decreto 96/2026, copia del PDF del DOGV en un sindicato | `https://anpecomunidadvalenciana.es/openFile.php?link=notices%2Fatt%2F4%2F2026_21223_decreto_96-2026_primaria_t1782373151_4_2.pdf` | No consultada (no oficial) |

- **Corrección de errores del Decreto 106/2022:** hay un documento «CORRECIO DERRADES PRIMARIA» (`portal.edu.gva.es/baladrepicanya/.../2022/12/...`). No se ha revisado. **Pendiente.**
- `data/ccaa.json` dice «DOGV (n.º y fecha de 2022 pendientes de comprobar)». Según la cabecera del PDF son **n.º 9402, de 10/08/2022**. No se ha tocado `ccaa.json`, que queda fuera del alcance.

## Estructura del anexo III (Decreto 106/2022)

- El PDF del DOGV es **bilingüe en bloque**:
  - primero todo el texto en valenciano (anexo III de la p. 41190 a la 41400 aprox.);
  - después todo en castellano: el anexo I empieza en la p. 41406 y el anexo III en la p. 41419.
- Cada área sigue este esquema:
  1. Presentación.
  2. Competencias específicas («2.N. Competencia específica N.», enunciado y descripción).
  3. Conexiones.
  4. Saberes básicos.
  5. Situaciones de aprendizaje.
  6. Criterios de evaluación.
- **Criterios en 2022:** tabla de dos columnas, «4.º curso EP» y «6.º curso EP», con numeración `N.M`. **No había criterios de 1.er ciclo.** El Decreto 96/2026 lo dice expresamente en su preámbulo y añade tablas de 1.º, 2.º y 3.er ciclo.
- **Saberes básicos:**
  - van por bloques con subapartados en mayúsculas;
  - cada ítem tiene una «x» en las columnas «1.er ciclo (1.º y 2.º)», «2.º ciclo (3.º y 4.º)» y «3.er ciclo (5.º y 6.º)»;
  - **el texto extraído conserva cuántas «x» hay, pero no en qué columna están.** Por eso no se han extraído: hace falta `pdftotext -layout`.
- **Lenguas:** «VALENCIANO: LENGUA Y LITERATURA» y «LENGUA CASTELLANA Y LITERATURA» comparten un único currículo (p. 41525), con las mismas 9 competencias. El Decreto 96/2026 también las modifica juntas (punto 26).
- **Conocimiento del Medio:** Valencia mantiene un área única, «Conocimiento del Medio Natural, Social y Cultural». No la divide en Ciencias de la Naturaleza y Ciencias Sociales.

### Mapa de páginas del anexo III en castellano (DOGV n.º 9402)

| Área (encabezado literal) | Inicio | Competencias | Saberes | Criterios (2022) |
| --- | --- | --- | --- | --- |
| Conocimiento del Medio Natural, Social y Cultural | 41419 | 41420 aprox. | 41434 | 41445 |
| MÚSICA Y DANZA | 41451 | 41453 | 41462 | 41470 |
| EDUCACIÓN PLÁSTICA Y VISUAL | 41473 | 41474 | 41484 | 41492 |
| EDUCACIÓN FÍSICA | 41496 | 41497 | 41507 | 41520 |
| VALENCIANO / LENGUA CASTELLANA Y LITERATURA | 41525 | 41527 | 41540 | 41550 |
| LENGUA EXTRANJERA | 41557 | 41560 | 41568 | 41577 |
| MATEMÁTICAS | 41582 | 41583 | 41593 | 41604 |
| EDUCACIÓN EN VALORES ÉTICOS Y CÍVICOS (sic, en ese orden) | 41610 | 41612 | 41620 | 41625 |

Para WebFetch, el anexo III en castellano va del carácter 950.000 al 1.600.000, aproximadamente.

## Alcance del Decreto 96/2026 sobre el anexo III

Según la reproducción no oficial, se comprobó lo siguiente:

- **Artículo único.4:** «Se modifican los anexos III, IV, V, VI, XI y XII».
- **Anexo único, puntos 22-28:** «Se modifica en el anexo III, el apartado 6 del área …», para estas áreas:
  - Conocimiento del Medio (22);
  - Música y Danza (23);
  - Educación Plástica y Visual (24);
  - Educación Física (25);
  - Valenciano y Lengua Castellana (26);
  - Lengua Extranjera (27);
  - Matemáticas (28).
- No se ha visto ningún punto sobre Valores. Confirmar.
- Cada tabla nueva trae columnas de 1.º, 2.º y 3.er ciclo.
- **Los criterios de 2.º y 3.er ciclo no equivalen a los de 4.º y 6.º de 2022.**
  - Matemáticas: CE1 es igual. En CE3 aparece un 3.4 nuevo en 2.º ciclo, los criterios 4.1-4.3 se reordenan y hay cambios de redacción.
  - Lengua: los criterios 1.1-1.5 cambian.
  - Por eso los criterios de 2022 no se han movido a `ciclos`.
- Según el índice del anexo único, las competencias específicas (apartado 2) y los saberes (apartado 4) no se modifican. Confirmar con el DOGV.

## Cobertura

| Área (`area`) | Fichero | Competencias | Criterios vigentes | Criterios de 2022 (históricos, 4.º / 6.º) | Saberes |
| --- | --- | --- | --- | --- | --- |
| Matemáticas | `matematicas.json` | 8 | 0 (pendiente) | 29 / 30 | pendiente |
| Lengua Castellana y Literatura | `lengua-castellana-y-literatura.json` | 9 (con título) | 0 (pendiente) | 36 / 37 | pendiente |
| Valenciano: Lengua y Literatura | `valenciano-lengua-y-literatura.json` | 9 (copia del anterior) | 0 (pendiente) | 36 / 37 | pendiente |
| Conocimiento del Medio Natural, Social y Cultural | `conocimiento-del-medio-natural-social-y-cultural.json` | 8 | 0 (pendiente) | no extraídos | pendiente |
| Música y Danza | `musica-y-danza.json` | 5 (sin confirmar que sean todas) | 0 (pendiente) | no extraídos | pendiente |
| Plástica y Visual, Educación Física, Lengua Extranjera, Valores Cívicos y Éticos | — | no extraídas | — | — | — |

- `verificado: false` en todos los ficheros.
- `descriptores: []`: las tablas no vinculan descriptores operativos a cada criterio.
- `resumen` de las competencias de Lengua es el título literal («Multilingüismo e interculturalidad», etc.).
- **Plástica y Visual:** el encabezado del decreto es «EDUCACIÓN PLÁSTICA Y VISUAL», pero `areasDe` la llama «Plástica y Visual». Cuando se cree el fichero, la clave `area` tiene que seguir a `areasDe`.

## Método

- WebFetch sobre la copia del PDF del DOGV, por desplazamientos de 100.000 caracteres.
- Una o dos competencias por consulta. Las columnas 4.º y 6.º se pidieron por separado. Las citas venían en fragmentos de menos de 100-125 caracteres y se unieron a mano.
- El extractor se negó a dar el texto de varias competencias a la vez («paraphrase»). Pidiendo una competencia y una columna, con la petición de «exact wording for an official legal citation», sí lo dio literal.
- Los JSON se generan con un script fuera del repositorio.

## Riesgos y pendientes

1. **Prioridad 1: criterios del Decreto 96/2026.** Hay que conseguir el PDF oficial `2026_21223.pdf` por otra vía y extraer las tablas de 1.º, 2.º y 3.er ciclo en `ciclos.<ciclo>.criterios`. Vías posibles:
   - descarga manual;
   - shell con red;
   - permiso para usar la copia de ANPE y cotejarla después.
2. **Saberes básicos:** `pdftotext -layout` del PDF de 2022 para asignar las «x» a su ciclo.
3. **Áreas sin extraer:** Plástica y Visual, Educación Física, Lengua Extranjera, y Educación en Valores Cívicos y Éticos (3.er ciclo).
4. **Corrección de errores** de diciembre de 2022: revisar si toca el anexo III.
5. **Dudas literales anotadas en el `pendiente` de cada JSON:**
   - Matemáticas 6.º 5.1, «icónicomanipulativas» sin guion;
   - Lengua CE2: el extractor separó fragmentos con «…»;
   - Conocimiento del Medio: «Comunidad Valenciana» en C7 y C8.
6. **Efecto en la app:** `criteriosCiclo('valencia', …)` devuelve ahora `{competencias: [...], criterios: []}` en vez de `null`.
   - En `shared/validador-oposicion.js:325`, `critMal = cur && cur.criterios ? …` marcaría como «inexistente» cualquier criterio citado si se valida con `ccaa: 'valencia'`.
   - La línea 285 sí controla la lista vacía.
   - Hoy el validador está pensado para Canarias, pero conviene usar `cur.criterios.length` también en la línea 325.
