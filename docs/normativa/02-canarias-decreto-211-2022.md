# Decreto 211/2022: currículo de Educación Primaria en Canarias

> Ficha de trabajo interna. La única versión oficial es el PDF del BOC. Revisado el 17/11/2026.

## Identificación

- **Título:** Decreto 211/2022, de 10 de noviembre, por el que se establece la ordenación y el currículo de la Educación Primaria en la Comunidad Autónoma de Canarias.
- **Publicación:** BOC n.º 231, de 23/11/2022 (código BOC-A-2022-231-3533). 346 páginas.
- **PDF oficial:** https://sede.gobiernodecanarias.org/boc/boc-a-2022-231-3533.pdf
- **Entrada en vigor:** el día siguiente a su publicación.
- **Deroga:** el Decreto 89/2014 (currículo LOMCE), salvo la transitoria de 2022-2023.
- **Marco:** LOE modificada por la LOMLOE, RD 157/2022 y Ley 6/2014 Canaria de Educación no Universitaria (art. 30).

## Estructura

| Parte | Contenido |
| --- | --- |
| Arts. 1–2 | Objeto, ámbito y definiciones |
| Arts. 3–7 | Principios generales, objetivos y fines, principios pedagógicos, currículo, competencias clave y perfil de salida |
| Arts. 8–9 | Organización de la etapa y horario |
| Arts. 10–13 | Evaluación, promoción, evaluación de diagnóstico, participación de las familias |
| Arts. 14–15 | Atención a las diferencias individuales y al alumnado con NEAE |
| Arts. 16–18 | Tutoría y orientación, lenguas extranjeras, autonomía de los centros |
| Arts. 19–24 | Documentos de evaluación: actas, expediente, historial, informe por traslado, autenticidad |
| Disposiciones | Adicionales (religión, centros incompletos), transitoria única, derogatoria única, finales (habilitación, **calendario de implantación**, entrada en vigor) |
| Anexo 1 | Perfil de salida del alumnado |
| Anexo 2 | Currículos de las áreas (introducción, competencias específicas, bloques competenciales con criterios, descriptores y saberes) |
| Anexo 3 | Situaciones de aprendizaje (orientaciones, carácter **orientativo**) |
| Anexo 4 | Distribución horaria |

## Áreas (art. 8)

- Tres ciclos de dos cursos.
- **En todos los cursos:** Conocimiento del Medio Natural, Social y Cultural; Educación Artística; Educación Física; Lengua Castellana y Literatura; Lengua Extranjera; Matemáticas.
- **Educación Emocional y para la Creatividad (EMOCREA):** en todos los cursos. Es un área propia de Canarias.
- **Educación en Valores Cívicos y Éticos:** en el tercer ciclo.
- **Segunda Lengua Extranjera:** obligatoria al menos en los dos cursos del tercer ciclo.
- Los centros pueden agrupar áreas en **ámbitos**.
- Religión o atención educativa: 60 minutos semanales en cada nivel.

## Horario (art. 9)

- Al menos 175 días lectivos.
- Al menos 25 h semanales de lunes a viernes, con 30 minutos diarios de recreo.
- Sesiones de 55 o 45 minutos según el anexo 4, con **prioridad a las de 55**. Los centros pueden usar duraciones de entre 30 y 60 minutos.
- Hasta dos sesiones semanales para integrar competencias y contenidos transversales, a decisión del centro.

> **Producto:** en Canarias, la duración por defecto de la sesión debe ser 55 minutos, no 45.

## Arquitectura del currículo de cada área (anexo 2)

Cada área incluye introducción, competencias específicas con su explicación, **bloques competenciales** y saberes básicos por ciclo. Los bloques competenciales vinculan cada competencia específica con sus criterios de evaluación, los descriptores operativos del perfil de salida y los saberes. Es el formato canario de "mapa curricular".

Datos de numeración extraídos del texto del BOC (para no inventar):

| Área | Competencias específicas | Criterios de evaluación |
| --- | --- | --- |
| Conocimiento del Medio N., S. y C. | 9 (C1–C9) | 24. Por competencia: C1: 2 · C2: 5 · C3: 3 (4 en tercer ciclo) · C4: 2 · C5: 3 · C6: 2 · C7: 2 · C8: 2 · C9: 3 (2 en tercer ciclo) |
| Educación Artística | 4 (C1–C4) | 10 |
| Educación Emocional y para la Creatividad | 4 | 8 en primer y segundo ciclo, 7 en tercero |
| Educación Física | 5 | 9 (C2 tiene 2) |
| Matemáticas | 8 | 42 (14 por ciclo) |
| Lengua Castellana y Literatura | 10 | 45 (15 por ciclo) |
| Lengua Extranjera | 6 | 45 (15 por ciclo) |
| Educación en Valores Cívicos y Éticos | 4 | 9 (3.er ciclo) |
| Segunda Lengua Extranjera | 6 | 15 (3.er ciclo) |

> Texto literal completo en `data/canarias/primaria/*.json`, cotejado con el PDF oficial el 17/11/2026 (ver `criterios-canarias-estado.md`).

Contenido de las competencias de Conocimiento del Medio (paráfrasis de su arranque): C1, educación digital; C2, curiosidad e indagación científica; C3, proyectos cooperativos; C4, cuerpo y salud; C5, elementos del medio y su interrelación; C6, aproximación crítica al entorno y la sostenibilidad; C7, rasgos de las sociedades a lo largo del tiempo; C8, diversidad social y cultural; C9, organización y funcionamiento de la sociedad.

> **Tarea RAG prioritaria:** transcribir del PDF oficial (anexo 2) los bloques competenciales de las 9 áreas, con criterio, descriptores y saberes por ciclo, a `data/canarias/primaria/*.json`. El texto normativo no tiene derechos de autor (art. 13 de la LPI).

## Situaciones de aprendizaje (arts. 2.2.f, 5.8 y 6.6; anexo 3)

- Son actividades que movilizan competencias clave y específicas. Las planifica el equipo docente según lo que disponga la Administración.
- El anexo 3 es **orientativo**: propone un marco global, significativo y motivador, con el docente como guía o facilitador.
- Rasgos que el decreto destaca en las áreas (p. ej., Conocimiento del Medio): diseños flexibles con opciones personalizables, agrupamientos diversos, proyectos cooperativos e interdisciplinares ante retos del entorno, vínculo con los **ODS** y el **patrimonio canario**, evaluación integrada desde la planificación con instrumentos variados, **DUA**, espacios abiertos y actividades complementarias, e implicación de las familias.

## Evaluación (arts. 10, 12 y 20) y promoción (art. 11)

- Global, continua y formativa. Las áreas se evalúan **de forma conjunta**.
- Referente: **criterios de evaluación**. Las **rúbricas** las establece la Consejería.
- Sesión final de evaluación coordinada por la persona tutora, más sesiones trimestrales informativas.
- En 4.º, evaluación de diagnóstico censal (Comunicación Lingüística y Matemática), sin uso para clasificar centros.
- Calificaciones: **Insuficiente, Suficiente, Bien, Notable, Sobresaliente**.
- Promoción: decisión colegiada del equipo docente **al final de cada ciclo**. La permanencia de un año más es excepcional y solo una vez en la etapa, dentro del mismo ciclo.
- Los procedimientos los desarrolla la **Orden de 31 de mayo de 2023** (BOC n.º 110, de 08/06/2023): evaluación, promoción y titulación de Infantil, Primaria, ESO y Bachillerato en Canarias.

## Atención a las diferencias (arts. 5, 14 y 15)

- Detección temprana, apoyos y refuerzos, inclusión, y **prioridad a la atención dentro del grupo clase**.
- **Ninguna medida puede impedir la promoción.**
- Alumnado con NEAE: adaptaciones curriculares; sus referentes de evaluación son los de la propia adaptación.
- Altas capacidades: posible reducción de un curso en la etapa.
- El catálogo de medidas está en el **Decreto 25/2018**, de 26 de febrero, de atención a la diversidad en las enseñanzas no universitarias de Canarias, con enfoque inclusivo.

## Programación didáctica (art. 6.5)

Es el instrumento de planificación, coordinado por ciclo, centrado en competencias y con los criterios como referencia. Detalle en `docs/didactica/programacion-didactica.md`.

## Autonomía de centros (art. 18)

Autonomía pedagógica, organizativa y de gestión. Los centros pueden innovar y flexibilizar áreas, espacios y tiempos. Concretan el currículo y la atención a la diversidad en el proyecto educativo, eligen materiales por ciclo y área, y pueden firmar compromisos educativos con las familias.

## Calendario de implantación

| Curso escolar | Cursos con currículo LOMLOE | Resto |
| --- | --- | --- |
| 2022-2023 | 1.º, 3.º y 5.º | 2.º, 4.º y 6.º con el Decreto 89/2014 (estándares solo orientativos) |
| 2023-2024 en adelante | Todos | — |

## Normativa canaria relacionada

- Ley 6/2014, de 25 de julio, Canaria de Educación no Universitaria.
- Decreto 196/2022 (currículo de Infantil, BOC de 26/10/2022) y Decreto 30/2023 (ESO y Bachillerato).
- Orden de 31/05/2023 (evaluación y promoción).
- Decreto 25/2018 (atención a la diversidad).
- Decreto 81/2010 (ROC) y Orden de 09/10/2013 que lo desarrolla, modificada el 16/07/2019.
- Decreto 174/2018 (absentismo y abandono escolar temprano).
- **Decreto 169/2026, de 30 de octubre** (convivencia escolar y bienestar). Es nuevo: pendiente de resumir.
- **Decreto 24/2026, de 9 de marzo** (enseñanza del silbo gomero en Primaria y ESO). Es nuevo: útil para situaciones de aprendizaje de patrimonio.
