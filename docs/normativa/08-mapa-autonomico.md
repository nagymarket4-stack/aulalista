# Mapa autonómico de la normativa de Primaria (LOMLOE)

> Revisado el 17/11/2026. Los datos que usa el producto están en `data/ccaa.json` (mismos `id` que `shared/prompts.js`). **Verificado** quiere decir que se ha abierto una fuente oficial (boletín, portal de la Consejería, BOE, REDINED o INAP «La Administración al Día») que confirma el número y la fecha. Lo que no se ha podido comprobar aparece como *pendiente*.

## Tabla resumen

| Comunidad | Norma de currículo | Boletín | Evaluación | Sesión | Escala | Estado |
| --- | --- | --- | --- | --- | --- | --- |
| Andalucía | Decreto 101/2023, de 9 de mayo, y Orden de 30/05/2023 | BOJA 90, 15/05/2023 | Orden de 30/05/2023 (BOJA 104, 02/06/2023) | 60 min (30 o 45 de forma excepcional) | IN-SB, con número en el boletín | Verificado |
| Aragón | Orden ECD/1112/2022, de 18 de julio (modificada por la ECD/866/2024) | BOA 27/07/2022 | La misma orden | 45-60 min | IN-SB; CC: Iniciado → Adquirido plenamente | Verificado |
| Asturias | Decreto 57/2022, de 5 de agosto | BOPA 12/08/2022 | En el decreto (art. 16) | 45-60 min | IN, Su, BI, NT, SB | Verificado (n.º de BOPA pendiente) |
| Illes Balears | **Decreto 41/2025, de 1 de agosto** (sustituye al 31/2022) | BOIB 103, 04/08/2025 | Orden 28/2025, de 21 de octubre (BOIB 23/10/2025) | No consultada | IN, SU, BIEN, NT, **EX** | Verificado |
| Canarias | Decreto 211/2022, de 10 de noviembre | BOC 231, 23/11/2022 | Orden de 31/05/2023 | 55 min | IN-SB | Verificado |
| Cantabria | Decreto 66/2022, de 7 de julio (Infantil y Primaria) | BOC 135, 13/07/2022 | En el decreto; Orden EDU/7/2023 (evaluación objetiva) | No regulada | Pendiente | Verificado (orden de evaluación pendiente) |
| Castilla y León | Decreto 38/2022, de 29 de septiembre | BOCYL 190, 30/09/2022 | Orden EDU/423/2024, de 9 de mayo (BOCYL 17/05/2024) | 30-90 min | 0-10 → IN-SB | Verificado |
| Castilla-La Mancha | Decreto 81/2022, de 12 de julio | DOCM 14/07/2022 | Orden 185/2022, de 27 de septiembre (DOCM 30/09/2022) | Anexo IV | IN-SB | Verificado |
| Cataluña | Decret 175/2022, de 27 de setembre (educació bàsica), modificado por el Decret 480/2024 | DOGC 29/09/2022 | En el decreto | No regulada | **NA / AS / AN / AE** | Verificado |
| Comunitat Valenciana | Decreto 106/2022, de 5 de agosto, **modificado por el Decreto 96/2026, de 19 de junio** | DOGV 2022 (pendiente); DOGV 25/06/2026 | En el decreto (art. 29) | 45 o 60 min | IN-SB | Verificado |
| Extremadura | Decreto 107/2022, de 28 de julio (modificado por el Decreto 241/2023) | DOE 05/08/2022 | Orden de 9/12/2022 (DOE 15/12/2022) | 25 periodos; minutos no fijados | IN-SB | Verificado |
| Galicia | Decreto 155/2022, de 15 de septiembre | DOG 26/09/2022 | Orden de 26/05/2023 (DOG 13/06/2023) | Sesiones o medias sesiones | IN, SU, **BE**, NT, SB | Verificado |
| Comunidad de Madrid | Decreto 61/2022, de 13 de julio | BOCM 18/07/2022 | Orden 130/2023, de 23 de enero (BOCM 25, 30/01/2023) | 45-60 min | IN-SB | Verificado |
| Región de Murcia | Decreto 209/2022, de 17 de noviembre | BORM 267, 18/11/2022 | En el decreto (orden pendiente) | 45-90 min | IN-SB y ME | Verificado |
| Navarra | Decreto Foral 67/2022, de 22 de junio | BON 01/07/2022 | Orden Foral 52/2023, de 12 de junio (BON 29/06/2023) | No regulada | IN, **SF**, BI, NT, SB | Verificado |
| País Vasco | Decreto 77/2023, de 30 de mayo (Educación Básica) | BOPV 109, 09/06/2023 | Orden de 22/01/2024 (BOPV 23, 31/01/2024) | No regulada | IN-SB | Verificado |
| La Rioja | Decreto 41/2022, de 13 de julio | BOR (fecha pendiente) | En el decreto | Pendiente | Pendiente | **Pendiente** |
| Ceuta y Melilla | Orden EFP/678/2022, de 15 de julio (MEFP) | BOE 174, 21/07/2022 | La misma orden | Anexo IV | IN-SB | Verificado |

**Correcciones respecto a `03-estatal-y-otras-ccaa.md` y `shared/prompts.js`:**
- Illes Balears ya no aplica el Decreto 31/2022. Rige el **Decreto 41/2025**, con su escala propia («Excelente» en lugar de «Sobresaliente»).
- La Comunitat Valenciana tiene una modificación nueva (Decreto 96/2026) que quita el tiempo de Proyectos Interdisciplinarios desde 2026-27.
- En La Rioja, `prompts.js` no tiene decreto. Es el 41/2022, de 13 de julio (no el 40/2022), pero falta la fecha del BOR.
- La norma de Ceuta y Melilla es la **Orden EFP/678/2022**.

## Particularidades útiles para contextualizar SA

### Lengua cooficial o propia
- **Cataluña:** Llengua Catalana i Literatura; Aranés y Literatura solo en Arán. Mínimo de 30 min diarios de lectura.
- **Comunitat Valenciana:** «Valenciano: Lengua y Literatura». Desde 2026-27 gana horas, junto con Castellano y Matemáticas.
- **Illes Balears:** Llengua Catalana i Literatura. El nombre debe cotejarse con el Decreto 41/2025, que no se pudo abrir.
- **Galicia:** Lingua Galega e Literatura.
- **País Vasco:** Lengua Vasca y Literatura (art. 11.1). Todas las áreas incluyen la dimensión de la cultura y la lengua vascas.
- **Navarra:** Lengua Vasca y Literatura «en su caso», según modelo lingüístico y zona; se puede pedir la exención.
- **Asturias:** Lengua Asturiana y Literatura o Cultura Asturiana, a elección de la familia.
- **Aragón:** Lenguas Propias de Aragón (aragonés o catalán), solo en centros autorizados.

### Áreas divididas o añadidas
- Áreas separadas en lugar de Conocimiento del Medio y Educación Artística: **Castilla y León**, **Aragón** y **Murcia** (Ciencias de la Naturaleza, Ciencias Sociales, Plástica y Visual, Música y Danza); **Madrid** (solo Ciencias de la Naturaleza y Ciencias Sociales); **Valencia** (Plástica y Visual y Música y Danza). En Cantabria, Navarra, CLM y País Vasco la división es opcional.
- **Madrid:** Tecnología y Robótica y Segunda Lengua Extranjera, si el centro las ofrece.
- **Canarias:** Educación Emocional y para la Creatividad (EMOCREA).
- **Murcia:** Profundización Educativa (1.º-5.º) y Segunda Lengua Extranjera, francés por defecto (5.º-6.º).
- **Andalucía:** Segunda Lengua Extranjera en 5.º-6.º, o el Área Lingüística de carácter transversal como alternativa.
- **Castilla y León:** el centro puede ofrecer Segunda Lengua Extranjera en 5.º-6.º, profundización y refuerzo. Quien no curse Religión hace proyectos sobre la cultura de Castilla y León.
- **Aragón:** Atención educativa, desde 2024-25.
- **Extremadura:** segunda lengua extranjera opcional, con atención especial al portugués.

### Curso de Educación en Valores Cívicos y Éticos
- En **5.º**: Cantabria, CLM y Madrid.
- En **5.º y 6.º**: Aragón.
- En **5.º o 6.º**: Cataluña y Navarra (algún curso del tercer ciclo); Valencia (tercer ciclo).
- En **6.º**: Andalucía, CyL, Extremadura, Murcia, País Vasco y MEFP.

`areasDe()` en `prompts.js` filtra la asignatura de los cursos por debajo de 5.º, pero no distingue 5.º de 6.º. Es una mejora pendiente.

### Duración de sesión por defecto
Canarias 55 min y Andalucía 60. Para Asturias, Aragón, Madrid, Valencia y Murcia, `sesionMin` vale 45, el mínimo de su rango. CyL va de 30 a 90 y queda en `null`. En el resto la sesión no está regulada y el producto usa 45 por defecto.

### Escalas que se apartan de IN-SU-BI-NT-SB
- **Cataluña:** NA/AS/AN/AE.
- **Illes Balears:** IN/SU/BIEN/NT/EX.
- **Galicia:** «Ben» (BE).
- **Navarra:** SF para Suficiente.
- **Aragón:** escala propia para las competencias clave (Iniciado/En desarrollo/Adquirido/Adquirido plenamente).
- **Escala numérica explícita:** CyL, Murcia, Andalucía (en el boletín), Madrid y Galicia.

### Situaciones de aprendizaje
Todas las comunidades usan «situaciones de aprendizaje» (en Galicia, «situacións de aprendizaxe»; en Cataluña, «situacions d'aprenentatge»). Las orientaciones están en un anexo del decreto u orden: Canarias anexo 3, Andalucía anexo IV de la Orden, CLM y Valencia anexo III, Murcia anexo IV, Asturias anexo 5, Cataluña anexo 5 y MEFP anexo III. Dos casos especiales:
- **Illes Balears** (Decreto 41/2025): las SA ya no son la única forma de organizar el currículo, y la programación didáctica es obligatoria.
- **Madrid:** el decreto habla de «proyectos integrados».

## Pendientes
1. La Rioja: abrir el Decreto 41/2022 en el BOR (fecha, áreas, sesión, escala). Hasta entonces, `verificado:false`.
2. Números de boletín que faltan: BOPA (Asturias), DOGC (Cataluña), DOGV 2022 (Valencia), DOG (Galicia), BON (Navarra) y número del DOE (Extremadura).
3. Órdenes de evaluación por localizar: Asturias, Cantabria (LOMLOE), Murcia, Valencia y La Rioja. En Canarias falta el BOC de la Orden de 31/05/2023.
4. Illes Balears: confirmar con el PDF del Decreto 41/2025 el nombre del área de catalán y las sesiones. Comprobar también a qué decreto afecta la anulación del art. 8 por el TSJIB (abril de 2026).
5. Cotejar en el boletín los títulos literales redactados a partir de resúmenes: Orden de Andalucía, Orden EFP/678/2022, Decreto 41/2022 de La Rioja y nombre catalán del área de aranés.
