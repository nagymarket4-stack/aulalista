# La situación de aprendizaje (SA): anatomía y criterios de calidad

> Guía interna. Es la base del prompt `promptSA` en `shared/prompts.js`.

## Definición operativa

Una situación de aprendizaje es un conjunto de actividades que plantea al alumnado un **reto contextualizado** cuya resolución moviliza competencias clave y específicas. Termina en un **producto** con valor fuera del examen y se evalúa con los **criterios de evaluación** del decreto. En Canarias, el anexo 3 del Decreto 211/2022 es orientativo y propone un marco global, significativo y motivador, con el docente como guía.

## Estructura (alineada con las plantillas de la Consejería y Brújula20)

1. **Identificación:** título, curso, áreas, temporalización.
2. **Justificación y contextualización:** reto real del entorno (en Canarias, el patrimonio natural y cultural, la insularidad, el silbo gomero, la biodiversidad), ODS y transversales.
3. **Fundamentación curricular:** competencias específicas, criterios, descriptores operativos y saberes, tomados del bloque competencial del decreto.
4. **Fundamentación metodológica:** modelos de enseñanza, agrupamientos, espacios, recursos y DUA.
5. **Secuencia de actividades:** sesiones con objetivo, inicio, desarrollo y cierre, agrupamiento, recursos y evidencia.
6. **Atención a las diferencias individuales:** medidas DUA (representación, acción y expresión, implicación), con más apoyo y más reto.
7. **Evaluación:** criterio → instrumento → evidencia → momento → agente, más una rúbrica del producto.
8. **Producto final y difusión.**
9. **Valoración del ajuste:** qué ha funcionado y propuestas de mejora (lo recomiendan las plantillas oficiales).

## Rúbrica de calidad interna (para revisar las salidas del generador)

| Dimensión | Aceptable | Excelente |
| --- | --- | --- |
| Reto | Tiene un tema | Problema real del entorno, con destinatario del producto fuera del aula |
| Alineación | Cita criterios | Cada actividad genera evidencia de un criterio concreto, con trazabilidad completa |
| Rigor normativo | Sin errores | Numeración exacta del decreto autonómico, sin marcas VERIFICAR |
| DUA | Menciona los tres principios | Medidas concretas por principio y para perfiles distintos |
| Evaluación | Hay instrumentos | Instrumentos variados, autoevaluación y coevaluación, y rúbrica con descriptores observables |
| Viabilidad | Encaja en las sesiones | Tiempos realistas por fase y recursos disponibles en un centro público |

## Particularidades de Canarias para el prompt

- La sesión de referencia es de **55 minutos**.
- Escala de calificación: IN, SU, BI, NT, SB. Las rúbricas oficiales las establece la Consejería.
- Áreas exclusivas: **Educación Emocional y para la Creatividad**, en todos los cursos.
- Contextos preferentes: patrimonio canario, ODS, entorno natural (costa, volcanes, laurisilva, especies endémicas), silbo gomero (D. 24/2026) y actividades complementarias en espacios abiertos.
- Implicación de las familias: aparece como rasgo de las situaciones de aprendizaje en el currículo.
