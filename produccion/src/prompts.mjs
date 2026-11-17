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

const CCAA = [
  { id: 'canarias', name: 'Canarias', decreto: 'Decreto 211/2022, de 10 de noviembre, por el que se establece la ordenación y el currículo de la Educación Primaria en la Comunidad Autónoma de Canarias', verificado: true,
    evaluacion: 'Orden de 31 de mayo de 2023, por la que se regulan la evaluación y la promoción del alumnado (Canarias)',
    diversidad: 'Decreto 25/2018, de 26 de febrero, por el que se regula la atención a la diversidad en las enseñanzas no universitarias de Canarias',
    sesionMin: 55,
    extra: ['Educación Emocional y para la Creatividad', { name: 'Segunda Lengua Extranjera (Francés)', desde: 5 }],
    nota: `Sigue la estructura de los modelos de la Consejería de Educación del Gobierno de Canarias (Programa Brújula20). En el Decreto 211/2022 cada área organiza su currículo en BLOQUES COMPETENCIALES que vinculan cada competencia específica (numeradas C1, C2, C3…) con sus criterios de evaluación, descriptores operativos y saberes básicos por ciclo. Datos de numeración verificados: Conocimiento del Medio Natural, Social y Cultural tiene 9 competencias específicas (C1–C9) y 24 criterios; Educación Artística, 4 competencias y 10 criterios; Educación Emocional y para la Creatividad, 4 competencias (8 criterios en 1.º y 2.º ciclo, 7 en 3.º); Educación Física, 5 competencias y 9 criterios. La evaluación es global, continua y formativa, con las áreas evaluadas de forma conjunta y calificación Insuficiente, Suficiente, Bien, Notable o Sobresaliente. La promoción se decide al final de cada ciclo. Las sesiones de referencia duran 55 minutos. Contextualiza en la realidad canaria (patrimonio natural y cultural, insularidad, biodiversidad y especies endémicas, ODS, silbo gomero cuando encaje) e implica a las familias.` },
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
    ? 'Insuficiente (IN), Suficiente (SU), Bien (BI), Notable (NT) y Sobresaliente (SB)'
    : 'En inicio, En proceso, Adquirido y Avanzado';
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
Peso de cada criterio y cómo se traduce a calificación.
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
Referentes, procedimientos e instrumentos, momentos, agentes, calificación y criterios de promoción.
## 10. Elementos transversales y planes del centro
## 11. Actividades complementarias
## 12. Evaluación de la programación y de la práctica docente
Indicadores de logro y mecanismos de revisión.
${REGLAS_COMUNES}`;
}


export { CCAA, CURSOS, AREAS_BASE, areasDe, ccaaPorId, cicloDe, sesionPorDefecto, promptSA, promptRubrica, promptAdaptacion, promptPD };
