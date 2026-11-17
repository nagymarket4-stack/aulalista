# Rúbricas oficiales de Primaria (Canarias): estado de la extracción

> Revisado el 17/11/2026. Ficheros en `data/canarias/primaria/rubricas/<slug>.json` (mismo slug que `data/canarias/primaria/<slug>.json`). Fuente: Resolución de 15/05/2025, BOC n.º 107, de 02/06/2025, anuncio 2005, anexo 1 (págs. 6-361 del PDF = BOC 21898-22253). Contexto normativo: `09-rubricas-oficiales-canarias.md`.

## Cobertura

| Área | 1.er ciclo | 2.º ciclo | 3.er ciclo | Total | Ids = JSON del área |
| --- | --- | --- | --- | --- | --- |
| Conocimiento del Medio Natural, Social y Cultural | 24 (p. 6-36) | 24 (p. 37-60) | 24 (p. 61-87) | 72 | sí |
| Educación Artística | 10 (p. 88-99) | 10 (p. 100-112) | 10 (p. 113-127) | 30 | sí |
| Educación Emocional y para la Creatividad | 8 (p. 128-135) | 8 (p. 136-143) | 7 (p. 144-150) | 23 | sí |
| Educación Física | 9 (p. 151-159) | 9 (p. 160-168) | 9 (p. 169-177) | 27 | sí |
| Educación en Valores Cívicos y Éticos | — | — | 9 (p. 178-188) | 9 | sí |
| Lengua Castellana y Literatura | 15 (p. 189-210) | 15 (p. 212-233) | 15 (p. 235-256) | 45 | sí |
| Lengua Extranjera (Inglés en la fuente) | 15 (p. 258-272) | 15 (p. 273-287) | 15 (p. 288-303) | 45 | sí |
| Matemáticas | 14 (p. 304-317) | 14 (p. 318-331) | 14 (p. 332-345) | 42 | sí |
| Segunda Lengua Extranjera | — | — | 15 (p. 347-361) | 15 | sí |
| **Total** | | | | **308 criterios · 1232 descriptores** | **27/27 bloques área-ciclo** |

- Las páginas son las del PDF (página BOC = 21892 + página PDF). Cada criterio guarda su `pagina_pdf`.
- «—»: la fuente no tiene rúbrica para ese ciclo porque el área no tiene criterios en él. En el JSON aparece `[]`.
- En todos los ciclos, la lista de criterios coincide **en número, ids y orden** con `data/canarias/primaria/<slug>.json`. No faltan, no sobran y no hay duplicados.
- La competencia específica de cada criterio coincide con el campo `competencia` del JSON del área.
- **Niveles** (los mismos en las 27 tablas): `INSUFICIENTE | SUFICIENTE/BIEN | NOTABLE | SOBRESALIENTE` en la cabecera de la tabla. En el JSON van como `Insuficiente`, `Suficiente/Bien`, `Notable` y `Sobresaliente`, la forma que usa la introducción del anexo 1. La cabecera literal se guarda en `niveles_cabecera_tabla`.
- **Estructura:** un descriptor por nivel y criterio. Ningún criterio tiene varias filas ni aspectos (`criterios_con_varias_filas` está vacío en todos), así que se usa siempre `descriptores: {nivel: texto}`.

## Esquema de cada fichero

```json
{"area", "fuente": "Resolución de 15/05/2025 (BOC 107, 02/06/2025)", "titulo_en_fuente",
 "niveles": ["Insuficiente","Suficiente/Bien","Notable","Sobresaliente"], "niveles_cabecera_tabla", "equivalencias", "nota",
 "ciclos": {"primer": [{"criterio": "1.1", "competencia_especifica": "1", "enunciado_criterio": "<como figura en la rúbrica>",
                        "descriptores_operativos": ["CCL3", ...], "pagina_pdf": 6,
                        "descriptores": {"Insuficiente": "...", "Suficiente/Bien": "...", "Notable": "...", "Sobresaliente": "..."}}],
            "segundo": [...], "tercer": [...]}}
```

## Método (`tools/extraer_rubricas_canarias.py`)

```
python3 -I tools/extraer_rubricas_canarias.py /ruta/boc-a-2025-107-2005.pdf [--txt plano.txt]
```

Necesita `pdfplumber` y `pdftotext` (poppler). Tarda unos 2 minutos. Escribe los 9 JSON y `data/canarias/primaria/rubricas/_cotejo.json`, que es el informe completo del cotejo.

1. Las tablas están giradas 90° dentro de páginas A4 verticales. El script gira las coordenadas de cada carácter y reconstruye la rejilla a partir de los filetes del PDF y de los rectángulos de cabecera. Después asigna cada carácter a su celda por posición. Así **las cuatro columnas de nivel nunca se mezclan**, aunque en `pdftotext -layout` aparezcan separadas por un solo espacio.
2. Los espacios entre palabras se deducen de la geometría, porque los caracteres de espacio del PDF están mal colocados en algunas líneas justificadas. Entre letras de una misma palabra el hueco es menor de 0,4 pt y entre palabras supera los 2 pt (histograma de todo el anexo). El umbral es 1 pt.
3. Si una celda continúa en la página siguiente (primera fila de la página, sin cabecera), se concatena con la anterior.
4. Las palabras compuestas cortadas a final de línea conservan el guion y se unen sin espacio. Solo hay tres casos: `afectivo-sexual`, `artístico-expresivas` y `socio-económica`. El PDF no parte palabras por sílabas.
5. No se completa ni se corrige nada. Las erratas de la fuente se conservan (ver abajo).

## Cotejo

| Prueba | Resultado |
| --- | --- |
| Conservación de palabras por página (todo lo leído en celdas y márgenes frente a `pdftotext` sin `-layout`, 356 páginas) | 351 páginas idénticas. En 5 (134, 158, 167, 174 y 176) la diferencia es de cómo `pdftotext` corta o pega palabras (`superficia`+`l`, `tota`+`l`, `artístico-`+`igual` → `artísticoigual`, `afectivo-`+`étnico`). La lectura geométrica es la correcta |
| Descriptor completo frente a otro extractor (palabras de `pdftotext -bbox` de poppler dentro de la misma celda, normalizando espacios y guiones) | **1232/1232 idénticos** |
| Cada línea de cada celda en el texto plano (`pdftotext` sin `-layout`) | 19 567 líneas literales. 232 con las palabras en orden pero intercaladas con columnas vecinas. 97 con las palabras en la misma página pero reordenadas por `pdftotext`, que desordena algunas líneas justificadas. **0 no encontradas** |
| Ids de criterio frente a `data/canarias/primaria/<slug>.json` | 27/27 bloques coinciden |
| Avisos del analizador (filas no interpretadas, textos fuera de tabla) | 0 |

**Nota sobre el cotejo pedido («cada descriptor en el texto plano»):** en el texto plano sin `-layout` las cuatro columnas salen intercaladas línea a línea. Por eso ningún descriptor completo aparece como subcadena continua, y el cotejo literal se hace **línea a línea**. El cotejo del descriptor entero se hace contra la reconstrucción de poppler (`-bbox`).

## Discrepancias y erratas de la fuente (conservadas tal cual)

### Enunciado del criterio: rúbrica frente a Decreto 211/2022

En **142 de 308 criterios**, el enunciado que reproduce la rúbrica difiere del texto del decreto que ya está en `data/canarias/primaria/<slug>.json`. Hay 324 cambios de palabra; el detalle de cada uno está en `_cotejo.json → areas.<slug>.<ciclo>.enunciado_distinto_del_json_area`.

| Área | Criterios con diferencias |
| --- | --- |
| Conocimiento del Medio | 55 / 72 |
| Lengua Extranjera | 34 / 45 |
| Matemáticas | 10 / 42 |
| Lengua Castellana y Literatura | 10 / 45 |
| EMOCREA | 10 / 23 |
| Segunda Lengua Extranjera | 9 / 15 |
| Valores Cívicos y Éticos | 7 / 9 |
| Educación Física | 4 / 27 |
| Educación Artística | 3 / 30 |

- La mayoría son menores: comas, artículos («las», «los», «y») y «aplicar,» frente a «aplicar».
- Otras son de redacción. Ejemplos: CMNSC 1.er ciclo 1.1, «iniciándose en la adopción de» → «adoptando». CMNSC 2.º ciclo 3.1 y 3.2: se desplazan incisos. EF 3.er ciclo 1.1: desaparece «así como las ventajas de una alimentación natural». LE: «PEL» → «Portfolio Europeo de las Lenguas (PEL)».
- **Errata de la fuente:** en LE 1.er ciclo 5.1, la rúbrica (p. 266) **repite el enunciado del criterio dos veces** («…repertorio lingüístico individual.Identificar y comparar…»).
- **Consecuencia:** el texto oficial del criterio sigue siendo el del decreto (`<slug>.json`). El campo `enunciado_criterio` de la rúbrica solo es contexto.

### Descriptores operativos del criterio: rúbrica frente al JSON del área

Hay 8 diferencias (`descriptores_operativos_distintos_del_json_area`):

| Área / ciclo / criterio | JSON del área (decreto) | Rúbrica |
| --- | --- | --- |
| CMNSC 1.er 2.5 | CCL1, CCL2, CCL3, STEM4, CD2 | sin CCL1 |
| EMOCREA 1.er 4.1 | … CE1, CE2 … | sin CE1 |
| EMOCREA 1.er 4.2 | … CD1, CD2 … | sin CD1 |
| VCE 3.er 1.1 | CCL1, CCL3, CD1, CD4 … | sin CCL1, con CD3 |
| VCE 3.er 1.2 | … | añade CP3 |
| LCL 1.er 7.2 | … **CCE3** … | CC3 |
| LCL 3.er 8.2 | CCL1, CCL2, … | sin CCL1 |
| LE 2.º 4.2 | CP2, STEM1, CPSAA3 | añade CD3 |

**LCL 1.er ciclo 7.2:** «CCE3» no es un descriptor operativo que exista, y la rúbrica dice «CC3». Conviene revisar `lengua-castellana-y-literatura.json` contra el PDF del decreto. Este agente no lo ha modificado porque está fuera de su alcance.

### Erratas tipográficas dentro de los descriptores (se conservan)

- **Número de criterio pegado al inicio del descriptor:**
  - EF 1.er ciclo 4.1: los cuatro niveles empiezan por «4.1.Experimenta…».
  - LCL 2.º ciclo 1.1: Insuficiente empieza por «1.1 Identifica…». Comprobado visualmente en la p. 212.
  - LCL 2.º ciclo 2.1: Suficiente/Bien empieza por «2.1 Comprende…».

  Al mostrarlos en la interfaz se puede quitar el prefijo `^\d+\.\d+\.?\s*`, avisando de que es un retoque de presentación.
- **Descriptores sin punto final** (46 en total): CMNSC 2.º 3.3 SB. Artística 1.er 2.1 SU/BI y 3.er 1.2 NT. EMOCREA 1.er 1.2 IN, 2.1 IN/SB, 3.2 IN y 4.1 IN/SB; 2.º 2.1 IN/SU-BI y 4.2 SB; 3.er 3.2 SB y 4.2 SU/BI. VCE 3.er 1.2 NT. EF 3.er 3.2 SU/BI. LE: 20 descriptores, en los tres ciclos. Matemáticas 1.er 3.2 SB y 3.er 4.2 SU/BI y NT. 2.ª LE 3.er 1.1 IN/NT/SB, 2.1 IN, 3.1 NT, 5.2 NT y 5.3 NT. El texto está completo: lo confirman la conservación de palabras y poppler.
- **Graduación no uniforme:** en algunos criterios el nivel IN, NT o SB no empieza por el mismo verbo que el SU/BI. Por ejemplo, LE «Rara vez…/Frecuentemente…/Siempre…», EMOCREA 4.2 «De forma regular…» y Matemáticas 2.3 IN «Omite…». Es así en la fuente.

## Pendiente

- Decidir cómo se integra en `shared/prompts.js` (RAG de descriptores por criterio y ciclo) y en `build.py`. Este agente no ha tocado `shared/` ni el build.
- Revisar «CCE3» en `lengua-castellana-y-literatura.json` (1.er ciclo, 7.2) contra el decreto.
- Actualizar el apartado de rúbricas de `04-evaluacion-canarias-orden-31-05-2023.md`: los niveles ya están verificados.
- La negrita de los modificadores de grado no se conserva. Si interesa resaltarlos en la interfaz, habría que extraer también la fuente tipográfica de cada palabra (`fontname` contiene `Bold`).
