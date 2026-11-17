// AulaLista — datos curriculares y construcción de prompts (compartido entre prototipo y producción)
// IMPORTANTE: los decretos marcados como verificados se han comprobado; el resto usa una referencia genérica
// para que el modelo no invente números de norma. Completa DECRETO de cada comunidad antes de lanzar.

const AREAS_BASE = [
  'Conocimiento del Medio Natural, Social y Cultural',
  'Educación Artística',
  'Educación Física',
  'Lengua Castellana y Literatura',
  'Lengua Extranjera (Inglés)',
  'Matemáticas',
  'Educación en Valores Cívicos y Éticos'
];

// Datos verificados por el agente cartógrafo (data/ccaa.json). build.py rellena este bloque: no editar a mano.
const CCAA_DATA = /*CCAA_DATA*/[{"id": "canarias", "decreto": "Decreto 211/2022, de 10 de noviembre, por el que se establece la ordenación y el currículo de la Educación Primaria en la Comunidad Autónoma de Canarias", "verificado": true, "escala": "Insuficiente, Suficiente, Bien, Notable, Sobresaliente", "evaluacion": "Orden de 31 de mayo de 2023, por la que se regulan la evaluación y la promoción del alumnado (incluye Primaria). Número de BOC y fecha de publicación pendientes de comprobar", "sesionMin": 55, "areasPropias": [{"name": "Educación Emocional y para la Creatividad"}, {"name": "Segunda Lengua Extranjera", "desde": 5}]}, {"id": "andalucia", "decreto": "Decreto 101/2023, de 9 de mayo, por el que se establece la ordenación y el currículo de la etapa de Educación Primaria en la Comunidad Autónoma de Andalucía", "verificado": true, "escala": "IN, SU, BI, NT, SB en las actas; en el boletín, numérica (IN 1-4, SU 5, BI 6, NT 7-8, SB 9-10)", "evaluacion": "Orden de 30 de mayo de 2023, por la que se desarrolla el currículo correspondiente a la etapa de Educación Primaria en la Comunidad Autónoma de Andalucía, se regulan determinados aspectos de la atención a la diversidad y a las diferencias individuales, se establece la ordenación de la evaluación del proceso de aprendizaje del alumnado y se determina el proceso de tránsito entre etapas (BOJA n.º 104, de 2 de junio de 2023). La evaluación y la promoción están en su capítulo III (arts. 9-25)", "sesionMin": 60, "areasPropias": [{"name": "Segunda Lengua Extranjera", "desde": 5}]}, {"id": "aragon", "decreto": "Orden ECD/1112/2022, de 18 de julio, por la que se aprueban el currículo y las características de la evaluación de la Educación Primaria y se autoriza su aplicación en los centros docentes de la Comunidad Autónoma de Aragón; modificada por la Orden ECD/866/2024, de 25 de julio (BOA de 7 de agosto de 2024)", "verificado": true, "escala": "IN, SU, BI, NT, SB. Competencias clave en el informe de ciclo: Iniciado, En desarrollo, Adquirido, Adquirido plenamente", "evaluacion": "La misma Orden ECD/1112/2022 (currículo y evaluación), modificada por la Orden ECD/866/2024, de 25 de julio", "sesionMin": 45, "areasPropias": [{"name": "Ciencias de la Naturaleza"}, {"name": "Ciencias Sociales"}, {"name": "Educación Plástica y Visual"}, {"name": "Música y Danza"}, {"name": "Segunda Lengua Extranjera", "desde": 5}, {"name": "Lenguas Propias de Aragón (Aragonés o Catalán)"}, {"name": "Atención educativa"}]}, {"id": "asturias", "decreto": "Decreto 57/2022, de 5 de agosto, por el que se regula la ordenación y se establece el currículo de la Educación Primaria en el Principado de Asturias", "verificado": true, "escala": "Insuficiente (IN); Suficiente (Su), Bien (BI), Notable (NT), Sobresaliente (SB)", "evaluacion": "Evaluación regulada en el propio Decreto 57/2022 (art. 16). Resolución autonómica de desarrollo de la evaluación pendiente de localizar", "sesionMin": 45, "areasPropias": [{"name": "Lengua Asturiana y Literatura"}, {"name": "Cultura Asturiana"}]}, {"id": "baleares", "decreto": "Decreto 41/2025, de 1 de agosto, por el que se establecen la ordenación y el currículo de la Educación Primaria de las Illes Balears", "verificado": true, "escala": "Insuficiente (IN), Suficiente (SU), Bien (BIEN), Notable (NT), Excelente (EX). Los criterios no se califican de forma numérica ni porcentual", "evaluacion": "Orden 28/2025, de 21 de octubre, del consejero de Educación y Universidades, sobre la evaluación del aprendizaje de los alumnos de la Educación Primaria en las Illes Balears (BOIB de 23 de octubre de 2025)", "areasPropias": [{"name": "Llengua Catalana i Literatura"}]}, {"id": "cantabria", "decreto": "Decreto 66/2022, de 7 de julio, por el que se establece el currículo de la Educación Infantil y de la Educación Primaria en la Comunidad Autónoma de Cantabria", "verificado": true, "escala": "No figura en el decreto. Pendiente de comprobar en la orden de evaluación", "evaluacion": "Evaluación en el propio Decreto 66/2022. Orden EDU/7/2023, de 23 de marzo, por la que se regula el derecho del alumnado a una evaluación objetiva (reclamaciones). Orden específica LOMLOE de evaluación de Primaria pendiente de localizar", "areasPropias": []}, {"id": "castillaleon", "decreto": "Decreto 38/2022, de 29 de septiembre, por el que se establece la ordenación y el currículo de la educación primaria en la Comunidad de Castilla y León", "verificado": true, "escala": "Numérica de 0 a 10 con equivalencia: 0-4 IN, 5 SU, 6 BI, 7-8 NT, 9-10 SB", "evaluacion": "Orden EDU/423/2024, de 9 de mayo, por la que se desarrolla la evaluación y la promoción en la Educación Primaria en la Comunidad de Castilla y León (BOCYL de 17 de mayo de 2024)", "areasPropias": [{"name": "Ciencias de la Naturaleza"}, {"name": "Ciencias Sociales"}, {"name": "Educación Plástica y Visual"}, {"name": "Música y Danza"}, {"name": "Segunda Lengua Extranjera", "desde": 5}]}, {"id": "clm", "decreto": "Decreto 81/2022, de 12 de julio, por el que se establece la ordenación y el currículo de Educación Primaria en la comunidad autónoma de Castilla-La Mancha", "verificado": true, "escala": "Insuficiente (IN); Suficiente (SU), Bien (BI), Notable (NT), Sobresaliente (SB)", "evaluacion": "Orden 185/2022, de 27 de septiembre, de la Consejería de Educación, Cultura y Deportes, por la que se regula la evaluación en la etapa de Educación Primaria en la comunidad autónoma de Castilla-La Mancha (DOCM de 30 de septiembre de 2022)", "areasPropias": []}, {"id": "cataluna", "decreto": "Decret 175/2022, de 27 de setembre, d'ordenació dels ensenyaments de l'educació bàsica (Decreto 175/2022, de 27 de septiembre, de ordenación de las enseñanzas de la educación básica); modificado por el Decret 480/2024, de 17 de desembre (DOGC de 19/12/2024)", "verificado": true, "escala": "Nivel de adquisición: Adquisición sobresaliente (AE), notable (AN), satisfactoria (AS), No adquisición (NA). En las actas: sobresaliente, notable, bien, insuficiente", "evaluacion": "Evaluación regulada en el propio Decret 175/2022 (arts. 24-32)", "areasPropias": [{"name": "Llengua Catalana i Literatura"}, {"name": "Aranès i Literatura (Aran)"}]}, {"id": "valencia", "decreto": "Decreto 106/2022, de 5 de agosto, del Consell, de ordenación y currículo de la etapa de Educación Primaria; modificado por el Decreto 96/2026, de 19 de junio, del Consell (DOGV de 25 de junio de 2026), aplicable desde el curso 2026-2027", "verificado": true, "escala": "Insuficiente (IN), Suficiente (SU), Bien (BI), Notable (NT), Sobresaliente (SB)", "evaluacion": "Evaluación regulada en el propio Decreto 106/2022 (art. 29), modificado por el Decreto 96/2026. Orden autonómica de desarrollo pendiente de localizar", "sesionMin": 45, "areasPropias": [{"name": "Valenciano: Lengua y Literatura"}, {"name": "Plástica y Visual"}, {"name": "Música y Danza"}]}, {"id": "extremadura", "decreto": "Decreto 107/2022, de 28 de julio, por el que se establecen la ordenación y el currículo de la Educación Primaria para la Comunidad Autónoma de Extremadura; arts. 13 y 15 modificados por el Decreto 241/2023, de 12 de septiembre (DOE de 19/09/2023)", "verificado": true, "escala": "Insuficiente (IN), Suficiente (SU), Bien (BI), Notable (NT), Sobresaliente (SB)", "evaluacion": "Orden de 9 de diciembre de 2022 por la que se regula la evaluación del alumnado en la Educación Infantil, Educación Primaria, ESO y Bachillerato en la Comunidad Autónoma de Extremadura (DOE de 15 de diciembre de 2022)", "areasPropias": [{"name": "Segunda Lengua Extranjera (opcional de centro; atención especial al portugués)"}]}, {"id": "galicia", "decreto": "Decreto 155/2022, de 15 de septiembre, por el que se establecen la ordenación y el currículo de la educación primaria en la Comunidad Autónoma de Galicia", "verificado": true, "escala": "Insuficiente (IN, 1-4), Suficiente (SU, 5), Ben (BE, 6), Notable (NT, 7-8), Sobresaliente (SB, 9-10)", "evaluacion": "Orden de 26 de mayo de 2023 por la que se desarrolla el Decreto 155/2022 y se regula el régimen de evaluación en la educación primaria (DOG de 13 de junio de 2023), aplicable desde 2023-24", "areasPropias": [{"name": "Lingua Galega e Literatura"}]}, {"id": "madrid", "decreto": "Decreto 61/2022, de 13 de julio, del Consejo de Gobierno, por el que se establece para la Comunidad de Madrid la ordenación y el currículo de la etapa de Educación Primaria", "verificado": true, "escala": "IN (<5), SU (5 a <6), BI (6 a <7), NT (7 a <9), SB (≥9)", "evaluacion": "Orden 130/2023, de 23 de enero, de la Vicepresidencia, Consejería de Educación y Universidades, por la que se regulan aspectos de organización y funcionamiento, evaluación y autonomía pedagógica de la Educación Primaria (BOCM n.º 25, de 30 de enero de 2023)", "sesionMin": 45, "areasPropias": [{"name": "Ciencias de la Naturaleza"}, {"name": "Ciencias Sociales"}, {"name": "Tecnología y Robótica"}, {"name": "Segunda Lengua Extranjera"}]}, {"id": "murcia", "decreto": "Decreto n.º 209/2022, de 17 de noviembre, por el que se establece la ordenación y el currículo de la Educación Primaria en la Comunidad Autónoma de la Región de Murcia", "verificado": true, "escala": "IN (1-4), SU (5), BI (6), NT (7-8), SB (9-10); Mención Honorífica (ME)", "evaluacion": "Escala y evaluación recogidas en el propio Decreto 209/2022. Orden autonómica de desarrollo pendiente de localizar", "sesionMin": 45, "areasPropias": [{"name": "Ciencias de la Naturaleza"}, {"name": "Ciencias Sociales"}, {"name": "Educación Plástica y Visual"}, {"name": "Música y Danza"}, {"name": "Profundización Educativa"}, {"name": "Segunda Lengua Extranjera (Francés)", "desde": 5}]}, {"id": "navarra", "decreto": "Decreto Foral 67/2022, de 22 de junio, por el que se establece el currículo de las enseñanzas de la etapa de Educación Primaria en la Comunidad Foral de Navarra", "verificado": true, "escala": "Insuficiente (IN); Suficiente (SF), Bien (BI), Notable (NT), Sobresaliente (SB). PS (pendiente de superar) cuenta como negativa en algunos casos", "evaluacion": "Orden Foral 52/2023, de 12 de junio, del consejero de Educación, por la que se regula la evaluación y promoción del alumnado que cursa las enseñanzas de Educación Primaria en la Comunidad Foral de Navarra (BON de 29 de junio de 2023)", "areasPropias": [{"name": "Lengua Vasca y Literatura"}]}, {"id": "paisvasco", "decreto": "Decreto 77/2023, de 30 de mayo, de establecimiento del currículo de Educación Básica e implantación en la Comunidad Autónoma de Euskadi", "verificado": true, "escala": "Insuficiente (IN); Suficiente (SU), Bien (BI), Notable (NT), Sobresaliente (SB)", "evaluacion": "Orden de 22 de enero de 2024, del consejero de Educación, por la que se regula la evaluación en Educación Infantil y la evaluación, promoción y certificación en Educación Básica y Bachillerato (BOPV n.º 23, de 31 de enero de 2024)", "areasPropias": [{"name": "Lengua Vasca y Literatura"}]}, {"id": "rioja", "decreto": "Decreto 41/2022, de 13 de julio, por el que se establece el currículo de Educación Primaria y se regulan determinados aspectos sobre su organización, evaluación y promoción en la Comunidad Autónoma de La Rioja (título redactado a partir de la cita de una resolución del BOR; cotejar)", "verificado": false, "escala": "Pendiente de comprobar", "evaluacion": "Organización, evaluación y promoción reguladas en el propio Decreto 41/2022. Orden específica no localizada", "areasPropias": []}, {"id": "mefp", "decreto": "Orden EFP/678/2022, de 15 de julio, por la que se establece el currículo y se regula la ordenación de la Educación Primaria en el ámbito de gestión del Ministerio de Educación y Formación Profesional", "verificado": true, "escala": "Insuficiente (IN); Suficiente (SU), Bien (BI), Notable (NT), Sobresaliente (SB)", "evaluacion": "Evaluación y promoción reguladas en la propia Orden EFP/678/2022 (arts. 20-23 y 27-30)", "areasPropias": [{"name": "Segunda Lengua Extranjera (opcional de centro)"}]}]/*END_CCAA_DATA*/;

const CCAA = [
  { id: 'canarias', name: 'Canarias', decreto: 'Decreto 211/2022, de 10 de noviembre, por el que se establece la ordenación y el currículo de la Educación Primaria en la Comunidad Autónoma de Canarias', verificado: true,
    evaluacion: 'Orden de 31 de mayo de 2023, por la que se regulan la evaluación y la promoción del alumnado (Canarias)',
    diversidad: 'Decreto 25/2018, de 26 de febrero, por el que se regula la atención a la diversidad en las enseñanzas no universitarias de Canarias (con la Orden de 13 de diciembre de 2010 y la Resolución de 9 de febrero de 2011, vigentes de forma transitoria)',
    convivencia: 'Decreto 169/2026, de 30 de octubre, por el que se regula la convivencia escolar y se promueve el bienestar en el ámbito educativo de Canarias',
    sesionMin: 55,
    extra: ['Educación Emocional y para la Creatividad', { name: 'Segunda Lengua Extranjera (Francés)', desde: 5 }],
    nota: `Sigue la estructura de los modelos de la Consejería de Educación del Gobierno de Canarias (Programa Brújula20). En el Decreto 211/2022 cada área organiza su currículo en BLOQUES COMPETENCIALES que vinculan cada competencia específica (numeradas C1, C2, C3…) con sus criterios de evaluación, descriptores operativos y saberes básicos por ciclo. Datos de numeración verificados: Conocimiento del Medio Natural, Social y Cultural tiene 9 competencias específicas (C1–C9) y 24 criterios; Educación Artística, 4 competencias y 10 criterios; Educación Emocional y para la Creatividad, 4 competencias (8 criterios en 1.º y 2.º ciclo, 7 en 3.º); Educación Física, 5 competencias y 9 criterios. La evaluación es global, continua y formativa, con las áreas evaluadas de forma conjunta. Las áreas se califican con Insuficiente, Suficiente, Bien, Notable o Sobresaliente, SIN nota numérica (Orden de 31/05/2023, art. 11.3); las competencias clave se califican aparte con PA, AD, MA o EX (art. 11.4). Las rúbricas oficiales de referencia son las de la Consejería (Resolución de 15/05/2025). Las normas de aula se pactan con el alumnado (Decreto 169/2026). La promoción se decide al final de cada ciclo. Las sesiones de referencia duran 55 minutos. Contextualiza en la realidad canaria (patrimonio natural y cultural, insularidad, biodiversidad y especies endémicas, ODS, silbo gomero cuando encaje) e implica a las familias.` },
  { id: 'andalucia', name: 'Andalucía', decreto: 'Decreto 101/2023, de 9 de mayo, por el que se establece la ordenación y el currículo de la etapa de Educación Primaria en la Comunidad Autónoma de Andalucía, desarrollado por la Orden de 30 de mayo de 2023', verificado: true, extra: [] },
  { id: 'aragon', name: 'Aragón', decreto: 'Orden ECD/1112/2022, de 18 de julio, por la que se aprueban el currículo y las características de la evaluación de la Educación Primaria en Aragón (modificada por la Orden ECD/866/2024)', verificado: true, extra: [] },
  { id: 'asturias', name: 'Asturias', extra: [] },
  { id: 'baleares', name: 'Illes Balears', extra: ['Llengua Catalana i Literatura'] },
  { id: 'cantabria', name: 'Cantabria', extra: [] },
  { id: 'castillaleon', name: 'Castilla y León', extra: [] },
  { id: 'clm', name: 'Castilla-La Mancha', decreto: 'Decreto 81/2022, de 12 de julio, por el que se establece la ordenación y el currículo de Educación Primaria en la comunidad autónoma de Castilla-La Mancha', verificado: true, extra: [] },
  { id: 'cataluna', name: 'Cataluña', extra: ['Llengua Catalana i Literatura', 'Llengua Occitana (Aran)'] },
  { id: 'valencia', name: 'Comunitat Valenciana', decreto: 'Decreto 106/2022, de 5 de agosto, del Consell, de ordenación y currículo de la etapa de Educación Primaria', verificado: true, extra: ['Valenciano: Lengua y Literatura'] },
  { id: 'extremadura', name: 'Extremadura', extra: [] },
  { id: 'galicia', name: 'Galicia', extra: ['Lingua Galega e Literatura'] },
  { id: 'madrid', name: 'Comunidad de Madrid', decreto: 'Decreto 61/2022, de 13 de julio, del Consejo de Gobierno, por el que se establece para la Comunidad de Madrid la ordenación y el currículo de la etapa de Educación Primaria', verificado: true, extra: ['Tecnología y Robótica', 'Segunda Lengua Extranjera'] },
  { id: 'murcia', name: 'Región de Murcia', extra: [] },
  { id: 'navarra', name: 'Navarra', extra: ['Lengua Vasca y Literatura'] },
  { id: 'paisvasco', name: 'País Vasco', extra: ['Lengua Vasca y Literatura'] },
  { id: 'rioja', name: 'La Rioja', extra: [] },
  { id: 'mefp', name: 'Ceuta y Melilla (MEFP)', extra: [] }
];

for (const c of CCAA) {
  const x = CCAA_DATA.find(y => y.id === c.id);
  if (!x || !x.verificado) continue;
  c.decreto = x.decreto; c.verificado = true;
  if (x.escala) c.escala = x.escala;
  if (x.evaluacion && !c.evaluacion) c.evaluacion = x.evaluacion;
  if (x.sesionMin && !c.sesionMin) c.sesionMin = x.sesionMin;
  if (c.id !== 'canarias' && Array.isArray(x.areasPropias) && x.areasPropias.length) {
    c.extra = x.areasPropias.filter(a => !/Atención educativa/i.test(a.name)).map(a => a.desde ? { name: a.name, desde: a.desde } : a.name);
  }
}

const CURSOS = ['1º', '2º', '3º', '4º', '5º', '6º'];

function cicloDe(curso) {
  const n = parseInt(curso, 10);
  return n <= 2 ? 'primer ciclo' : n <= 4 ? 'segundo ciclo' : 'tercer ciclo';
}

function ccaaPorId(id) { return CCAA.find(c => c.id === id) || CCAA[0]; }

function areasDe(ccaaId, curso) {
  const c = ccaaPorId(ccaaId);
  const n = parseInt(curso, 10);
  const extra = (c.extra || []).filter(a => typeof a === 'string' || n >= (a.desde || 1)).map(a => typeof a === 'string' ? a : a.name);
  let areas = AREAS_BASE.concat(extra);
  if (extra.some(a => /^Ciencias de la Naturaleza/.test(a))) areas = areas.filter(a => a !== 'Conocimiento del Medio Natural, Social y Cultural');
  if (extra.some(a => /Plástica/.test(a))) areas = areas.filter(a => a !== 'Educación Artística');
  if (n < 5) areas = areas.filter(a => a !== 'Educación en Valores Cívicos y Éticos');
  return areas;
}

function sesionPorDefecto(ccaaId) { return ccaaPorId(ccaaId).sesionMin || 45;
}

function marcoNormativo(c) {
  const dec = c.decreto
    ? c.decreto
    : `el decreto de currículo de Educación Primaria vigente en ${c.name} (no cites su número ni fecha: escribe "decreto autonómico de currículo de ${c.name}")`;
  let m = `LOMLOE (Ley Orgánica 3/2020), Real Decreto 157/2022, de 1 de marzo, de enseñanzas mínimas de Educación Primaria, y ${dec}.`;
  if (c.evaluacion) m += ` Evaluación: ${c.evaluacion}.`;
  if (c.diversidad) m += ` Atención a la diversidad: ${c.diversidad}.`;
  if (c.convivencia) m += ` Convivencia: ${c.convivencia}.`;
  if (c.escala) m += ` Escala de calificación oficial: ${c.escala}.`;
  return m;
}

const REGLAS_COMUNES = `
REGLAS DE RIGOR (obligatorias):
- Español de España, registro profesional docente, sin relleno ni frases vacías.
- Usa la numeración de competencias específicas y criterios de evaluación del Real Decreto 157/2022 para el ciclo indicado (por ejemplo "CE 2" y "criterio 2.1"). Si la concreción autonómica puede diferir o no estás seguro de su redacción literal, añade al final del elemento la marca [VERIFICAR CON DECRETO]. Nunca inventes números de criterio que no existan.
- Terminología LOMLOE exclusivamente: nunca uses "estándares de aprendizaje evaluables" ni "competencias básicas" (son de leyes anteriores).
- Los descriptores operativos se citan con sus siglas oficiales del Perfil de salida (CCL, CP, STEM, CD, CPSAA, CC, CE, CCEC, con su número, p. ej. STEM2).
- Nunca incluyas nombres ni datos personales de alumnado.
- Devuelve SOLO el documento en Markdown (encabezados ##/###, tablas con |, listas con -). Sin preámbulo ni despedida.`;

function promptSA(d) {
  const c = ccaaPorId(d.ccaa);
  return `Eres un/a maestro/a de Educación Primaria experto/a en diseño curricular LOMLOE y en la normativa de ${c.name}. Diseña una SITUACIÓN DE APRENDIZAJE completa, lista para entregar a jefatura de estudios o inspección.

MARCO NORMATIVO: ${marcoNormativo(c)}
${c.nota ? 'CONTEXTO AUTONÓMICO: ' + c.nota : ''}

DATOS:
- Curso: ${d.curso} de Educación Primaria (${cicloDe(d.curso)})
- Área principal: ${d.area}
- Otras áreas implicadas: ${d.otras || 'las que encajen de forma natural (máximo 2)'}
- Tema o reto: ${d.tema}
- Sesiones: ${d.sesiones} de ${d.duracion} minutos
- Contexto del grupo: ${d.contexto || 'grupo heterogéneo estándar; propón un contexto verosímil'}
- Producto final: ${d.producto || 'propón uno significativo y con difusión fuera del aula'}

ESTRUCTURA OBLIGATORIA (usa exactamente estos encabezados ##):
## 1. Identificación
Título atractivo, curso, áreas, temporalización, y una frase-resumen del reto.
## 2. Justificación y contextualización
Problema o reto real conectado con el entorno del alumnado en ${c.name}; vinculación con los ODS y con los elementos transversales cuando proceda.
## 3. Fundamentación curricular
Tabla: | Competencia específica | Criterios de evaluación | Saberes básicos | Descriptores operativos |
## 4. Fundamentación metodológica
Modelos y métodos de enseñanza, agrupamientos, espacios, recursos (incluida la competencia digital) y principios del DUA.
## 5. Secuencia de actividades
Para cada sesión: "### Sesión N. Título", con objetivo de la sesión, desarrollo (inicio, desarrollo, cierre con tiempos), agrupamiento, recursos y evidencia de aprendizaje que se recoge.
## 6. Atención a las diferencias individuales
Medidas DUA organizadas en: representación, acción y expresión, implicación. Incluye propuestas concretas para alumnado que necesita más apoyo y para alumnado que necesita más reto.
## 7. Evaluación
Tabla: | Criterio | Instrumento | Evidencia | Momento | Agente (hetero/auto/coevaluación) |. Después, una rúbrica breve del producto final con 4 niveles de logro.
## 8. Producto final y difusión
${REGLAS_COMUNES}`;
}

function promptRubrica(d) {
  const c = ccaaPorId(d.ccaa);
  const niveles = d.niveles === '5'
    ? (c.escala ? `la escala oficial de calificación de ${c.name}: ${c.escala}` : 'Insuficiente (IN), Suficiente (SU), Bien (BI), Notable (NT) y Sobresaliente (SB)')
    : 'En inicio, En proceso, Adquirido y Avanzado (rúbrica de aula; indica en una nota cómo se corresponde con la escala oficial de calificación' + (c.escala ? ': ' + c.escala : '') + ')';
  return `Eres un/a maestro/a de Educación Primaria experto/a en evaluación competencial LOMLOE en ${c.name}.
Crea una RÚBRICA DE EVALUACIÓN analítica.

MARCO NORMATIVO: ${marcoNormativo(c)}
DATOS:
- Curso: ${d.curso} de Educación Primaria (${cicloDe(d.curso)})
- Área: ${d.area}
- Tarea, producto o aprendizaje a evaluar: ${d.tema}
- Criterios de evaluación que quiere usar el docente: ${d.criterios || 'selecciona tú los 3-5 criterios del ciclo más pertinentes'}
- Niveles de logro: ${niveles}

ESTRUCTURA:
## Rúbrica: [título]
Una línea con curso, área y tarea.
## Criterios evaluados
Lista de los criterios con su número y redacción.
## Rúbrica
Tabla: primera columna "Criterio / indicador", una columna por nivel de logro. Descriptores observables, graduados, redactados en positivo, sin adjetivos vagos ("bien", "adecuado") sin concretar qué se observa.
## Ponderación y calificación
Peso de cada criterio y cómo se traduce a la calificación oficial. Si la normativa de la comunidad no usa nota numérica (p. ej. Canarias), no conviertas a 0-10.
## Versión para el alumnado
La misma rúbrica en lenguaje sencillo, en primera persona ("Yo..."), adaptada a la edad del curso.
${REGLAS_COMUNES}`;
}

function promptAdaptacion(d) {
  const c = ccaaPorId(d.ccaa);
  return `Eres un/a especialista en inclusión educativa y Diseño Universal para el Aprendizaje (DUA) en Educación Primaria en ${c.name}.
Diseña MEDIDAS ORDINARIAS DE ATENCIÓN A LAS DIFERENCIAS INDIVIDUALES para una actividad o situación de aprendizaje.

MARCO NORMATIVO: ${marcoNormativo(c)}
DATOS (perfil anónimo, sin datos personales):
- Curso: ${d.curso} de Educación Primaria
- Área: ${d.area}
- Perfil del alumno o alumna: ${d.perfil}
- Observaciones del docente: ${d.contexto || 'ninguna'}
- Actividad o situación de aprendizaje a adaptar: ${d.tema}

ESTRUCTURA:
## Perfil y barreras previsibles
Barreras para el aprendizaje y la participación que puede encontrar en ESTA actividad (no describas el diagnóstico en abstracto).
## Medidas de acceso y organización
Espacio, tiempos, agrupamientos, apoyos.
## Ajustes metodológicos (DUA)
Organizados en representación, acción y expresión, implicación. Concretos y aplicables mañana.
## Actividad adaptada
Reescribe la actividad paso a paso con los ajustes aplicados, manteniendo los mismos criterios de evaluación.
## Evaluación accesible
Instrumentos y formatos alternativos para recoger evidencias, sin rebajar el criterio.
## Coordinación
Con quién coordinarse (orientación, especialistas, familia) y qué registrar.
LÍMITES: no diagnostiques ni atribuyas una categoría de NEAE; no redactes adaptaciones curriculares (AC/ACUS), que corresponden a los procedimientos de orientación; limítate a medidas ordinarias.${c.id === 'canarias' ? ' En Canarias, etiqueta cada medida con la letra del art. 5.2 del Decreto 25/2018 que le corresponda (a apoyo en el grupo clase, b agrupamientos flexibles, c atención individualizada, d refuerzo para la recuperación curricular, e apoyo idiomático, f participación de la comunidad) y usa la terminología canaria (NEAE, NEE, DEA, TDAH, ECOPHE, INTARSE, ALCAIN; medidas ordinarias, extraordinarias y excepcionales; barreras para el aprendizaje y la participación).' : ''}
Nota final: estas son medidas ordinarias y no sustituyen la evaluación psicopedagógica ni las medidas que esta determine.
${REGLAS_COMUNES}`;
}

function promptPD(d) {
  const c = ccaaPorId(d.ccaa);
  return `Eres un/a maestro/a de Educación Primaria experto/a en planificación curricular LOMLOE en ${c.name}, con experiencia como miembro de tribunal de oposiciones.
Elabora una PROGRAMACIÓN DIDÁCTICA ANUAL de aula, lista para presentar a jefatura de estudios (y adaptable a la oposición).

MARCO NORMATIVO: ${marcoNormativo(c)}
${c.nota ? 'CONTEXTO AUTONÓMICO: ' + c.nota : ''}

DATOS:
- Curso: ${d.curso} de Educación Primaria (${cicloDe(d.curso)})
- Área: ${d.area}
- Número de situaciones de aprendizaje: ${d.numSA || 8}
- Hilo conductor o enfoque (opcional): ${d.tema || 'propón uno motivador y contextualizado'}
- Contexto del centro y del grupo: ${d.contexto || 'centro público de Educación Primaria, grupo heterogéneo; propón un contexto verosímil sin datos personales'}

ESTRUCTURA OBLIGATORIA (encabezados ##):
## 1. Identificación
## 2. Justificación y contextualización
Enfoque competencial, conexión con el proyecto educativo, los planes del centro y los ODS.
## 3. Marco normativo
Lista de las normas aplicables, con su nombre completo.
## 4. Punto de partida
Evaluación inicial (qué se evalúa y cómo) y propuestas de mejora previstas.
## 5. Elementos curriculares
Tabla: | Competencia específica | Criterios de evaluación | Descriptores operativos | Saberes básicos |, cubriendo TODAS las competencias específicas del área para el ciclo.
## 6. Secuenciación de situaciones de aprendizaje
Tabla: | Trimestre | N.º | Título de la SA | Criterios | Saberes | Sesiones | Producto final |. Después, un párrafo breve por SA con el reto y el producto. Comprueba que todos los criterios del ciclo quedan cubiertos a lo largo del curso.
## 7. Metodología
Modelos de enseñanza, agrupamientos, espacios, recursos (competencia digital incluida) y principios DUA.
## 8. Atención a las diferencias individuales
Medidas ordinarias concretas, coordinación con orientación y referencia a la normativa de atención a la diversidad.
## 9. Evaluación
Referentes, procedimientos e instrumentos, momentos, agentes, calificación, criterios de calificación que se comunicarán a las familias y criterios de promoción.
## 10. Elementos transversales y planes del centro
## 11. Actividades complementarias
## 12. Evaluación de la programación y de la práctica docente
Indicadores de logro y mecanismos de revisión.
${REGLAS_COMUNES}`;
}

if (typeof module !== 'undefined') module.exports = { CCAA, CURSOS, AREAS_BASE, areasDe, ccaaPorId, cicloDe, sesionPorDefecto, promptSA, promptRubrica, promptAdaptacion, promptPD };
