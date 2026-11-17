# Normativa estatal y decretos de otras comunidades

> Revisado el 17/11/2026. Solo se marca **verificado** lo comprobado en una fuente. Lo demás se completa antes de activar esa comunidad en el producto.

## Estatal

| Norma | Qué regula | Uso en el producto |
| --- | --- | --- |
| LOE 2/2006, modificada por la LOMLOE 3/2020 | Marco general. Recupera los tres ciclos en Primaria y establece la evaluación de diagnóstico censal en 4.º (art. 21) | Marco de todos los documentos |
| RD 157/2022, de 1 de marzo | Ordenación y enseñanzas mínimas de Primaria: competencias clave, perfil de salida, competencias específicas, criterios y saberes mínimos. Implantación: 1.º, 3.º y 5.º en 2022-23; 2.º, 4.º y 6.º en 2023-24 | Base común. Las comunidades la concretan (art. 11.3) |
| RD 984/2021 | Evaluación y promoción transitorias, ya derogado por el RD 157/2022 | No citar |
| RD 276/2007 | Ingreso en los cuerpos docentes (oposiciones). Define "programación didáctica" y "unidad didáctica" a efectos del examen | Módulo opositor |

**Término clave:** la "unidad didáctica" procede del RD 276/2007, no del currículo. La "situación de aprendizaje" es la forma de plantear las actividades dentro de la unidad. Las convocatorias LOMLOE las combinan así.

## Decretos de currículo de Primaria por comunidad

| Comunidad | Norma | Estado |
| --- | --- | --- |
| Canarias | Decreto 211/2022, de 10 de noviembre | Verificado (BOC n.º 231, de 23/11/2022) |
| Andalucía | Decreto 101/2023, de 9 de mayo; desarrollo en la Orden de 30 de mayo de 2023 | Verificado |
| Aragón | Orden ECD/1112/2022, de 18 de julio (currículo y evaluación), modificada por la Orden ECD/866/2024 | Verificado |
| Castilla-La Mancha | Decreto 81/2022, de 12 de julio | Verificado |
| Comunidad de Madrid | Decreto 61/2022, de 13 de julio (BOCM de 18/07/2022). Añade el área **Tecnología y Robótica**; Segunda Lengua Extranjera en cualquier curso. Desarrollo en la Orden 130/2023 | Verificado |
| Comunitat Valenciana | Decreto 106/2022, de 5 de agosto, del Consell | Verificado |
| Asturias, Illes Balears, Cantabria, Castilla y León, Cataluña, Extremadura, Galicia, Región de Murcia, Navarra, País Vasco, La Rioja | — | **Pendiente**: buscar en el boletín oficial de cada una |
| Ceuta y Melilla | Currículo del MEFP (gestión directa) | Pendiente de citar la orden ministerial |

## Atención a la diversidad: normas propias de otras comunidades (referencia)

- Castilla-La Mancha: Decreto 85/2018 (inclusión educativa).
- Cantabria: Decreto 78/2019, que distingue medidas ordinarias, específicas y extraordinarias.

## Cómo se incorpora una comunidad nueva al producto (checklist)

1. Localizar el decreto en su boletín oficial y anotar número, fecha y boletín.
2. Comprobar las áreas propias (lengua cooficial, áreas añadidas como Tecnología y Robótica en Madrid o EMOCREA en Canarias).
3. Comprobar la duración de sesión de referencia y el horario.
4. Localizar la orden de evaluación y su escala de calificación.
5. Extraer los criterios de evaluación por área y ciclo a `data/<ccaa>/primaria/*.json`.
6. Marcar `verificado: true` en `shared/prompts.js` y ejecutar `python3 build.py`.
