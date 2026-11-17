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
    extra: ['Educación Emocional y para la Creatividad'],
    nota: 'Sigue la estructura del modelo de situación de aprendizaje de la Consejería de Educación del Gobierno de Canarias y contextualiza en la realidad canaria (patrimonio natural y cultural, insularidad, biodiversidad, sostenibilidad).' },
  { id: 'andalucia', name: 'Andalucía', extra: [] },
  { id: 'aragon', name: 'Aragón', extra: [] },
  { id: 'asturias', name: 'Asturias', extra: [] },
  { id: 'baleares', name: 'Illes Balears', extra: ['Llengua Catalana i Literatura'] },
  { id: 'cantabria', name: 'Cantabria', extra: [] },
  { id: 'castillaleon', name: 'Castilla y León', extra: [] },
  { id: 'clm', name: 'Castilla-La Mancha', decreto: 'Decreto 81/2022, de 12 de julio, por el que se establece la ordenación y el currículo de Educación Primaria en la comunidad autónoma de Castilla-La Mancha', verificado: true, extra: [] },
  { id: 'cataluna', name: 'Cataluña', extra: ['Llengua Catalana i Literatura', 'Llengua Occitana (Aran)'] },
  { id: 'valencia', name: 'Comunitat Valenciana', decreto: 'Decreto 106/2022, de 5 de agosto, del Consell, de ordenación y currículo de la etapa de Educación Primaria', verificado: true, extra: ['Valenciano: Lengua y Literatura'] },
  { id: 'extremadura', name: 'Extremadura', extra: [] },
  { id: 'galicia', name: 'Galicia', extra: ['Lingua Galega e Literatura'] },
  { id: 'madrid', name: 'Comunidad de Madrid', extra: [] },
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
  let areas = AREAS_BASE.concat(c.extra || []);
  const n = parseInt(curso, 10);
  if (n < 5) areas = areas.filter(a => a !== 'Educación en Valores Cívicos y Éticos');
  return areas;
}

function marcoNormativo(c) {
  const dec = c.decreto
    ? c.decreto
    : `el decreto de currículo de Educación Primaria vigente en ${c.name} (no cites su número ni fecha: escribe "decreto autonómico de currículo de ${c.name}")`;
  return `LOMLOE (Ley Orgánica 3/2020), Real Decreto 157/2022, de 1 de marzo, de enseñanzas mínimas de Educación Primaria, y ${dec}.`;
}

const REGLAS_COMUNES = `
REGLAS DE RIGOR (obligatorias):
- Español de España, registro profesional docente, sin relleno ni frases vacías.
- Usa la numeración de competencias específicas y criterios de evaluación del Real Decreto 157/2022 para el ciclo indicado (por ejemplo "CE 2" y "criterio 2.1"). Si la concreción autonómica puede diferir o no estás seguro de su redacción literal, añade al final del elemento la marca [VERIFICAR CON DECRETO]. Nunca inventes números de criterio que no existan.
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


export { CCAA, CURSOS, AREAS_BASE, areasDe, ccaaPorId, cicloDe, promptSA, promptRubrica, promptAdaptacion };
