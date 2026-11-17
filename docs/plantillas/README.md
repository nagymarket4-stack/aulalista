# Plantilla oficial de programación didáctica LOMLOE (Consejería de Educación de Canarias)

Ficheros que aportó el usuario, convertidos a Markdown con pandoc. Las tablas salen deformadas: para ver el original, abre el `.odt`.
- `pd-lomloe-canarias-vacia.md`: plantilla vacía.
- `pd-lomloe-canarias-con-orientaciones.md`: la misma, con las orientaciones de cumplimentación.

## Estructura oficial

**1. Cabecera:** centro educativo; estudio (nivel educativo); docentes responsables.

**2. Punto de partida (diagnóstico inicial de las necesidades de aprendizaje)**
- Propuestas de mejora de la memoria final del curso anterior.
- Análisis de la realidad del aula: evaluación inicial y reuniones interetapas.

**3. Justificación de la programación didáctica** (completada con lo recogido en la PGA)
- **A. Orientaciones metodológicas**
  - A.1 Modelos metodológicos
  - A.2 Agrupamientos
  - A.3 Espacios
  - A.4 Recursos
  - A.5 Actividades complementarias y extraescolares, con un sistema alternativo de evaluación para quien no asista.
- **B. Atención a la diversidad**
  - Concreción de las AC/ACUS: qué alumnado y en qué nivel del referente curricular.
  - Adaptación de Acceso al Currículo (AAC) y ACUS por exención parcial, indicando las competencias o criterios de los que se exime.
  - Integración de apoyos (profesorado de NEAE, docencia compartida), recursos y espacios.
- **C. Evaluación**
  - Cómo se evalúa al alumnado con los criterios de evaluación.
  - Acuerdos de evaluación y calificación.
  - Sistemas alternativos cuando no es posible la evaluación continua, y evaluación extraordinaria.
  - Instrumentos generales.
  - Evaluación de la enseñanza y de la práctica docente, con indicadores de logro.
- **D. Estrategias para el refuerzo y planes de recuperación.**

**4. Concreción de los objetivos de etapa al curso:** se citan por la letra con la que figuran en el decreto y se argumenta cómo contribuye la programación.

**5. Ficha de cada situación de aprendizaje:** "SA N.º __" con su título.
- **Descripción:** modelo "En esta SA el alumnado aprenderá… (aprendizajes de los criterios y saberes) a través de… (producto o cómo) para… (finalidad)", con el contexto (efemérides, hitos, retos, problemas, centros de interés).
- **Fundamentación curricular:** tabla con las columnas siguientes.
  - Competencias específicas (número).
  - Criterios de evaluación (número o código).
  - Descriptores operativos.
  - Saberes básicos (bloque en número romano y saber en número arábigo).
  - Técnicas de evaluación: observación sistemática, encuestación, análisis de documentos, análisis de producciones, análisis de artefactos.
  - Herramientas: registro anecdótico, registro descriptivo, escalas de valoración, listas de control, diario de clase del profesorado.
  - Instrumentos: entrevistas, cuestionarios, formularios, rúbricas, listas de cotejo, y los productos que evidencian el aprendizaje.
- **Productos y tipos de evaluación según el agente:** heteroevaluación, coevaluación y autoevaluación, procurando aplicar los tres en la mayoría de las SA.
- **Fundamentación metodológica:** metodologías, agrupamientos, espacios, recursos.
- **Tratamiento de los elementos transversales y estrategias para desarrollar la educación en valores.**
- **Programas, planes y ejes temáticos de la Red Canaria-InnovAS.**
- **Periodo de implementación**, vinculación con otras áreas y **valoración del ajuste** (desarrollo y propuestas de mejora).

## Implicaciones para el generador (Canarias)

- `promptPD` y `promptSA` deben seguir esta estructura y vocabulario cuando la comunidad es Canarias: "técnicas, herramientas e instrumentos de evaluación", "tipos de evaluación según el agente", "Red Canaria-InnovAS", "valoración del ajuste".
- Los saberes se citan con el formato bloque romano + número arábigo, que es el de los JSON de `data/canarias/primaria`.
- La escala de calificación y las rúbricas se vinculan con `docs/normativa/09-rubricas-oficiales-canarias.md`, que está preparando el agente rubricista.
