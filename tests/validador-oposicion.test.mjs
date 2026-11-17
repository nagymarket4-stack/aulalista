// Tests del validador de formato de la programación para oposición (shared/validador-oposicion.js).
// Función pura, sin IA ni red: se prueba con programaciones sintéticas que cumplen o incumplen las bases.
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const V = require('../shared/validador-oposicion.js');
const P = require('../shared/prompts.js');

const AREA = 'Matemáticas', CURSO = '3º';
const cur = P.criteriosCiclo('canarias', AREA, CURSO);
const opts = { ccaa: 'canarias', area: AREA, curso: CURSO, curriculo: cur };

const relleno = n => Array.from({ length: n }, (_, i) => `palabra${i % 50}`).join(' ');

// Construye una SA con los elementos a–k; `tel` = actividades telemáticas de `total`.
function sa(n, { tel = 3, total = 8, declarar = true, criterios = ['1.1', '2.1'], palabras = 900, titulo = 'Medimos nuestra costa' } = {}) {
  const acts = Array.from({ length: total }, (_, i) => `${i + 1}. Actividad de medida en el aula${i < tel ? ' [TELEMÁTICA]' : ''}`).join('\n');
  return `### SA ${n}. ${titulo} ${n}
**a) Identificación y justificación**: reto ligado al entorno de Tenerife.
**b) Datos técnicos**: curso 3.º, áreas de Matemáticas y Conocimiento del Medio, 6 sesiones.
**c) Enfoque globalizador**: integra varias áreas.
**d) Fundamentación curricular**: criterios ${criterios.join(', ')} y competencias C1 y C2.
**e) Metodología y secuencia de actividades**:
${acts}
**f) Escenario telemático**: adaptación con instrumentos en línea.
**g) Evaluación y calificación**: rúbrica y escala.
**h) Atención a la diversidad (DUA)**: medidas DUA.
**i) Elementos transversales y valores**: igualdad.
**j) Referencias a Canarias**: patrimonio canario de la isla.
**k) Referencias bibliográficas y digitales**: recursos digitales de la Consejería.
${relleno(palabras)}
${declarar ? `**Actividades telemáticas:** ${tel} de ${total} (${Math.round(1000 * tel / total) / 10} %)` : ''}
`;
}

function programacion({ nSA = 8, palabrasExtra = 6000, normas = true, contexto = true, indice = true, saOpts = {}, extra = '' } = {}) {
  const todos = cur.criterios;
  const tabla = '| Competencia específica | Criterios de evaluación | Descriptores operativos | Saberes básicos |\n| --- | --- | --- | --- |\n' +
    todos.map(c => `| C${c.split('.')[0]} | ${c} | STEM1 | Sentido numérico |`).join('\n');
  return `## Portada
Programación didáctica. Especialidad: Educación Primaria. ${CURSO} curso. ${AREA}. [Nombre y apellidos]
${indice ? '## Índice\n1. Introducción\n' : ''}
## 1. Introducción y justificación
Enfoque globalizador y competencial.
## 2. Contextualización
${contexto ? 'CEIP Los Dragos (centro público ficticio) de la Consejería de Educación del Gobierno de Canarias, en una zona costera de Tenerife. Vinculada al proyecto educativo y a la PGA.' : 'Un colegio cualquiera.'}
## 3. Marco normativo
${normas ? '- LOMLOE (Ley Orgánica 3/2020).\n- Real Decreto 157/2022, de 1 de marzo.\n- Decreto 211/2022, de 10 de noviembre (Canarias).\n- Orden de 31 de mayo de 2023 (evaluación).\n- Decreto 25/2018, de 26 de febrero (atención a la diversidad).\n- Decreto 81/2010, de 8 de julio (ROC), art. 44.3.\n- Orden de 9 de octubre de 2013.\n- Resolución de 15 de mayo de 2025 (rúbricas).' : '- LOMLOE.'}
## 4. Contribución a los objetivos de etapa
## 5. Tratamiento de las competencias clave
Descriptores operativos del perfil de salida.
## 6. Elementos curriculares
${tabla}
## 7. Metodología
## 8. Atención a la diversidad
Principios DUA y alumnado NEAE.
## 9. Evaluación
Criterios de evaluación, instrumentos de evaluación y procedimientos de calificación.
## 10. Adaptación a un escenario no presencial
Metodología, agrupamientos y mecanismos de evaluación telemática.
## 2 bis. Punto de partida
Evaluación inicial y memoria. Estrategias de refuerzo y planes de recuperación. Evaluación de la práctica docente con indicadores de logro. Heteroevaluación, coevaluación y autoevaluación.
## 11. Elementos transversales y contenidos canarios
Canarias, Canarias, Canarias, canarios, canaria, Canarias, Canarias.
## 12. Aspectos del artículo 44.3 del ROC
## 13. Secuenciación y temporalización
| Trimestre | N.º | Título de la SA | Criterios |
| --- | --- | --- | --- |
| 1 | 1 | SA 1 | 1.1 |
## 14. Situaciones de aprendizaje
${Array.from({ length: nSA }, (_, i) => sa(i + 1, saOpts)).join('\n')}
## 15. Evaluación de la programación y de la práctica docente
## 16. Referencias bibliográficas y webgrafía
${extra}
${relleno(palabrasExtra)}
`;
}

const item = (r, re) => r.secciones.flatMap(s => s.items).find(i => re.test(i.txt));

describe('validador de formato: programación conforme', () => {
  const r = V.validar(programacion(), opts);
  test('detecta 8 SA numeradas y tituladas', () => {
    assert.equal(r.sa.length, 8);
    assert.deepEqual(r.sa.map(s => s.n), [1, 2, 3, 4, 5, 6, 7, 8]);
    assert.equal(item(r, /Número de SA/).estado, 'ok');
    assert.match(r.sa[0].titulo, /^Medimos nuestra costa 1/);
  });
  test('extensión dentro de 25–50 páginas y sin penalización', () => {
    assert.ok(r.paginas >= 25 && r.paginas <= 50, String(r.paginas));
    assert.equal(r.penalizacion.estimada, 0);
    assert.equal(r.riesgoCero, false);
  });
  test('telemático: 3 de 8 = 37,5 % declarado y coherente en cada SA', () => {
    for (const s of r.sa) {
      assert.equal(s.telematico.declarado, 37.5);
      assert.equal(s.telematico.estado, 'ok');
      assert.equal(s.telematico.marcadas, 3);
    }
  });
  test('normativa requerida presente y fechas correctas', () => {
    for (const re of [/Decreto 211\/2022/, /Orden de 31 de mayo de 2023/, /Decreto 25\/2018/]) assert.equal(item(r, re).estado, 'ok', String(re));
  });
  test('criterios: todos existen y todos los del ciclo están cubiertos', () => {
    assert.deepEqual(r.criterios.inexistentes, []);
    assert.deepEqual(r.criterios.sinCubrir, []);
    assert.equal(item(r, /criterios citados existen/).estado, 'ok');
  });
  test('elementos a–k presentes en cada SA y semáforo global sin fallos', () => {
    for (const s of r.sa) assert.deepEqual(s.faltan, [], 'SA ' + s.n);
    assert.equal(r.resumen.error, 0, JSON.stringify(r.secciones.flatMap(s => s.items).filter(i => i.estado === 'error')));
    assert.notEqual(r.global, 'error');
  });
  test('informe Markdown con etiquetas de semáforo y tabla por SA', () => {
    const md = V.informeMarkdown(r);
    assert.match(md, /^# Informe de formato/);
    assert.match(md, /\| SA \| Título \| Telemático/);
    assert.match(md, /\[OK\]/);
    assert.match(md, /37,5 %/);
  });
});

describe('validador de formato: incumplimientos', () => {
  test('menos de 6 SA y más de 12 → fallo', () => {
    assert.equal(item(V.validar(programacion({ nSA: 5 }), opts), /Número de SA/).estado, 'error');
    assert.equal(item(V.validar(programacion({ nSA: 13, palabrasExtra: 0 }), opts), /Número de SA/).estado, 'error');
    assert.equal(item(V.validar(programacion({ nSA: 12, palabrasExtra: 2000 }), opts), /Número de SA/).estado, 'ok');
  });
  test('menos de 25 páginas → fallo y −1; más de 50 → −0,25 por página', () => {
    const corta = V.validar(programacion({ nSA: 6, palabrasExtra: 0, saOpts: { palabras: 100 } }), opts);
    assert.ok(corta.paginas < 25);
    assert.equal(item(corta, /Extensión estimada/).estado, 'error');
    assert.equal(corta.penalizacion.estimada, 1);
    const larga = V.validar(programacion({ palabrasExtra: 25000 }), opts);
    assert.ok(larga.paginas > 50);
    const extra = Math.ceil(larga.paginas - 50);
    assert.equal(larga.penalizacion.estimada, Math.min(2, extra * 0.25));
  });
  test('penalización acumulada con tope de 2 puntos', () => {
    const r = V.validar(programacion({ palabrasExtra: 60000 }), opts);
    assert.equal(r.penalizacion.estimada, 2);
  });
  test('sin índice → −0,2', () => {
    const r = V.validar(programacion({ indice: false }), opts);
    assert.equal(item(r, /^Índice/).estado, 'error');
    assert.equal(r.penalizacion.estimada, 0.2);
  });
  test('SA con menos del 30 % telemático → fallo en esa SA', () => {
    const r = V.validar(programacion({ saOpts: { tel: 2, total: 8 } }), opts);
    for (const s of r.sa) { assert.equal(s.telematico.porcentaje, 25); assert.equal(s.telematico.estado, 'error'); assert.equal(s.estado, 'error'); }
  });
  test('telemático no declarado: se calcula con las marcas [TELEMÁTICA] y queda en aviso', () => {
    const r = V.validar(programacion({ saOpts: { declarar: false, tel: 4, total: 10 } }), opts);
    for (const s of r.sa) { assert.equal(s.telematico.declarado, null); assert.equal(s.telematico.calculado, 40); assert.equal(s.telematico.estado, 'aviso'); }
  });
  test('porcentaje declarado sin "X de Y" también se reconoce', () => {
    const t = V.telematico('### SA 1. X\n1. a\n2. b\nEl 35 % de las actividades es telemático.');
    assert.equal(t.declarado, 35);
  });
  test('criterios inexistentes en el ciclo → fallo con la lista', () => {
    const r = V.validar(programacion({ saOpts: { criterios: ['1.1', '9.9', '3.7'] } }), opts);
    assert.deepEqual(r.criterios.inexistentes.sort(), ['3.7', '9.9']);
    assert.equal(item(r, /NO existen/).estado, 'error');
    assert.deepEqual(r.sa[0].criteriosInexistentes.sort(), ['3.7', '9.9']);
  });
  test('competencias específicas inexistentes en el área → fallo', () => {
    const r = V.validar(programacion({ extra: 'Se trabaja la C12 de forma transversal.' }), opts);
    assert.match(item(r, /Competencias específicas inexistentes/).txt, /C12/);
  });
  test('normativa ausente, fechas erróneas y normas derogadas', () => {
    const r = V.validar(programacion({ normas: false }), opts);
    assert.equal(item(r, /Decreto 211\/2022/).estado, 'error');
    assert.equal(item(r, /Orden de 31 de mayo de 2023/).estado, 'error');
    assert.equal(item(r, /Decreto 25\/2018/).estado, 'error');
    const f = V.validar(programacion({ extra: 'Según el Decreto 211/2022, de 3 de mayo, y el Decreto 89/2014. Estándares de aprendizaje evaluables.' }), opts);
    assert.match(item(f, /fecha incorrecta/).txt, /10 de noviembre/);
    assert.equal(item(f, /Decreto 89\/2014/).estado, 'error');
    assert.equal(item(f, /estándares de aprendizaje/).estado, 'error');
    const u = V.validar(programacion({ extra: 'Decreto 999/2031.' }), opts);
    assert.match(item(u, /no reconocidos/).txt, /999\/2031/);
  });
  test('Decreto 114/2011 → aviso de derogación; enlaces o QR → aviso de cómputo de páginas', () => {
    const r = V.validar(programacion({ extra: 'Plan de convivencia (Decreto 114/2011). Vídeo en https://example.org y código QR.' }), opts);
    assert.equal(item(r, /Decreto 114\/2011/).estado, 'aviso');
    assert.match(item(r, /Decreto 114\/2011/).txt, /169\/2026/);
    assert.equal(item(r, /enlaces web o códigos QR/).estado, 'aviso');
    assert.equal(item(V.validar(programacion(), opts), /enlaces web/), undefined);
  });
  test('normativa de referencia del anexo IV (ROC, Orden de 9/10/2013, rúbricas) ausente → aviso', () => {
    const r = V.validar(programacion({ normas: false }), opts);
    for (const re of [/Orden de 9 de octubre de 2013/, /Resolución de 15 de mayo de 2025/]) assert.equal(item(r, re).estado, 'aviso', String(re));
  });
  test('sin mecanismos de evaluación telemática → fallo', () => {
    const txt = programacion().replace(/mecanismos de evaluación telemática/, 'x').replace(/instrumentos en línea/g, 'x');
    assert.equal(item(V.validar(txt, opts), /evaluación telemática/).estado, 'error');
  });
  test('informe con la tabla de letra del anexo IV (1.ñ.6) y la penalización ortográfica (1.m)', () => {
    const r = V.validar(programacion(), opts);
    assert.match(item(r, /Tipo de letra/).detalle, /8 pt → 34 págs., −0.37/);
    assert.match(item(r, /Ortografía/).detalle, /hasta 1 punto/);
  });
  test('sin contextualización en centro público canario → riesgo de cero', () => {
    const txt = programacion({ contexto: false }).replace(/Canarias|canari[oa]s?|Tenerife|Consejería|CEIP/gi, 'X');
    const r = V.validar(txt, opts);
    assert.equal(r.riesgoCero, true);
    assert.equal(r.global, 'error');
    assert.match(V.informeMarkdown(r), /Riesgo de calificación 0/);
  });
  test('datos personales (DNI, correo) → aviso', () => {
    const r = V.validar(programacion({ extra: 'Contacto: profe@example.com, DNI 12345678Z' }), opts);
    assert.match(item(r, /datos personales/).txt, /DNI.*correo/);
  });
  test('texto vacío → fallo sin excepciones', () => {
    const r = V.validar('', opts);
    assert.equal(r.global, 'error');
    assert.equal(r.sa.length, 0);
    assert.doesNotThrow(() => V.informeMarkdown(r));
  });
});

describe('detección de SA y criterios', () => {
  test('texto plano (sin Markdown), con índice que repite las SA', () => {
    const txt = 'ÍNDICE\nSA 1. El agua ........ 12\nSA 2. El viento ........ 14\n\nSA 1. El agua\nTexto largo de la primera.\nSA 2: El viento\nTexto de la segunda.\nUnidad didáctica 3 - Las nubes\nMás texto.';
    const s = V.detectarSA(txt);
    assert.deepEqual(s.map(x => x.n), [1, 2, 3]);
    assert.deepEqual(s.map(x => x.titulo), ['El agua', 'El viento', 'Las nubes']);
  });
  test('con Markdown, la última SA termina en el siguiente encabezado de igual o mayor nivel', () => {
    const s = V.detectarSA('## 14. SA\n### SA 1. Uno\nx\n### SA 2. Dos\ny\n## 15. Evaluación de la programación\nz z z');
    assert.equal(s.length, 2);
    assert.doesNotMatch(s[1].texto, /Evaluación de la programación/);
  });
  test('variantes: "Situación de aprendizaje n.º 4", "**SA 5.**", "UD 6"', () => {
    const s = V.detectarSA('Situación de aprendizaje n.º 4. Mareas\n**SA 5.** Volcanes\nUD 6: Dragos');
    assert.deepEqual(s.map(x => [x.n, x.titulo]), [[4, 'Mareas'], [5, 'Volcanes'], [6, 'Dragos']]);
  });
  test('criterios en prosa, listas y columnas de tabla', () => {
    const c = V.criteriosCitados('Trabajamos los criterios 1.1, 2.3 y 4.2 y el crit. 5.1.\n| Competencia | Criterio |\n| --- | --- |\n| C3 | 3.2 |\nDecreto 25/2018 y fecha 31.05');
    assert.deepEqual(c, ['1.1', '2.3', '3.2', '4.2', '5.1']);
  });
  test('palabras y páginas: ≈ 500 palabras por página', () => {
    assert.equal(V.contarPalabras('Uno dos, tres. Decreto 211/2022 art. 44.3'), 7);
    const r = V.validar(relleno(15000), opts);
    assert.equal(r.paginas, 30);
  });
});

describe('integración con el currículo y la app', () => {
  test('criteriosCiclo devuelve los criterios del Decreto 211/2022 por ciclo', () => {
    assert.equal(cur.criterios.length, 14);
    assert.ok(cur.criterios.includes('2.3'));
    assert.deepEqual(cur.competencias, ['C1', 'C2', 'C3', 'C4', 'C5', 'C6', 'C7', 'C8']);
    assert.equal(P.criteriosCiclo('canarias', 'Área inventada', '3º'), null);
  });
  test('sin `curriculo` en opts usa criteriosCiclo global (como en el navegador)', async () => {
    const vm = await import('node:vm');
    const ctx = vm.createContext({});
    vm.runInContext(readFileSync(new URL('../shared/prompts.js', import.meta.url), 'utf8') + '\n' + readFileSync(new URL('../shared/validador-oposicion.js', import.meta.url), 'utf8') + '\n;globalThis.V = ValidadorOposicion;', ctx);
    const r = ctx.V.validar(programacion({ saOpts: { criterios: ['1.1', '9.9'] } }), { area: AREA, curso: CURSO });
    assert.deepEqual([...r.criterios.inexistentes], ['9.9']);
  });
  test('el validador va incluido tal cual en los HTML generados', () => {
    const src = readFileSync(new URL('../shared/validador-oposicion.js', import.meta.url), 'utf8');
    for (const f of ['dist/prototipo.html', 'produccion/public/app.html']) {
      const html = readFileSync(new URL('../' + f, import.meta.url), 'utf8');
      assert.ok(html.includes(src.trim()), f);
      assert.doesNotMatch(html, /\/\*__VALIDADOR__\*\//, f);
    }
  });
});
