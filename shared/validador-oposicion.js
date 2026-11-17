// AulaLista — validador de formato de la programación para oposición (Maestros, Canarias).
// JavaScript puro, sin IA ni red: se ejecuta en el navegador y en Node (tests/validador-oposicion.test.mjs).
// Trabaja sobre TEXTO (pegado o .md/.txt). Lo que no se puede comprobar en texto plano (tipo y tamaño de
// letra, interlineado, portada física, número de ejemplares) se informa como "no verificable".
// Bases: Orden de 18 de marzo de 2026 (BOC n.º 58, de 25/03/2026), base 15.1.2 y anexo IV (cotejado con el texto
// oficial el 17/11/2026). Los apartados recomendados siguen la plantilla de PD LOMLOE de la Consejería (Brújula20).
// Ver docs/oposiciones/.

const BASES_OPOSICION = {
  'canarias-2026': {
    nombre: 'Orden de 18 de marzo de 2026 (BOC n.º 58, de 25/03/2026), anexo IV — Educación Primaria',
    paginas: { min: 25, max: 50, palabrasPorPagina: 500 },
    sa: { min: 6, max: 12 },
    telematicoMin: 30,
    // Anexo IV, 1.ñ: tope acumulado de 2 puntos. Letra no conforme: 0,5 + descuento por página según el tamaño (ñ.6).
    penalizaciones: { unEjemplar: 0.5, menos25: 1, porPaginaExtra: 0.25, sinPortada: 0.2, sinIndice: 0.2, letra: 0.5, tope: 2 },
    tablaLetra: { 8: { maxPaginas: 34, porPagina: 0.37 }, 9: { maxPaginas: 39, porPagina: 0.32 }, 10: { maxPaginas: 45, porPagina: 0.28 }, 11: { maxPaginas: 50, porPagina: 0.25 } },
    // Anexo IV, 1.m: −0,2 por falta y −0,2 por cada tres tildes omitidas, máximo 1 punto en la programación.
    ortografia: { porFalta: 0.2, porTresTildes: 0.2, max: 1 }
  }
};

const ValidadorOposicion = (() => {
  const norm = s => String(s == null ? '' : s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  const contarPalabras = s => (String(s).match(/[A-Za-zÀ-ÿ0-9]+(?:['’.\-/][A-Za-zÀ-ÿ0-9]+)*/g) || []).length;

  // Apartados generales obligatorios o muy recomendables (anexo IV y RD 276/2007, art. 21).
  // Las expresiones se aplican sobre el texto normalizado (sin tildes, en minúsculas).
  const APARTADOS = [
    { id: 'indice', txt: 'Índice', re: /^\s*(#{1,6}\s*|\*\*)?\s*indice\b/m, grave: true },
    { id: 'contexto', txt: 'Contextualización en el centro', re: /contextualizacion|contexto del centro/ , grave: true },
    { id: 'pe-pga', txt: 'Vinculación con el proyecto educativo y la PGA', re: /proyecto educativo|programacion general anual|\bpga\b/ },
    { id: 'objetivos', txt: 'Contribución a los objetivos de etapa', re: /objetivos de (la )?etapa/, grave: true },
    { id: 'ccclave', txt: 'Tratamiento de las competencias clave', re: /competencias clave|descriptores operativos|perfil de salida/, grave: true },
    { id: 'ce', txt: 'Competencias específicas', re: /competencias? especificas?/, grave: true },
    { id: 'saberes', txt: 'Saberes básicos', re: /saberes basicos/, grave: true },
    { id: 'criterios', txt: 'Criterios de evaluación', re: /criterios? de evaluacion/, grave: true },
    { id: 'instrumentos', txt: 'Instrumentos de evaluación', re: /instrumentos? de evaluacion|instrumentos?:/, grave: true },
    { id: 'calificacion', txt: 'Procedimientos de calificación', re: /calificacion/ },
    { id: 'metodologia', txt: 'Metodología', re: /metodologi/, grave: true },
    { id: 'globalizador', txt: 'Enfoque globalizador', re: /globaliza/ },
    { id: 'diversidad', txt: 'Atención a la diversidad', re: /atencion a la diversidad|diferencias individuales/, grave: true },
    { id: 'dua', txt: 'Principios DUA', re: /\bdua\b|diseno universal (para el|de) aprendizaje/, grave: true },
    { id: 'neae', txt: 'Referencia al alumnado NEAE', re: /\bneae\b|necesidades especificas de apoyo educativo/, grave: true },
    { id: 'nopresencial', txt: 'Adaptación a un escenario no presencial', re: /no presencial|escenario telematico|ensenanza telematica|ensenanza a distancia/, grave: true },
    { id: 'roc', txt: 'Aspectos del art. 44.3 del ROC (Decreto 81/2010)', re: /decreto 81\/2010|\broc\b|reglamento organico/, grave: true },
    { id: 'transversales', txt: 'Elementos transversales y educación en valores', re: /transversal|educacion en valores/ },
    { id: 'secuencia', txt: 'Secuenciación y temporalización', re: /secuenciacion|temporalizacion/ },
    { id: 'bibliografia', txt: 'Referencias bibliográficas', re: /bibliograf|webgrafia|referencias bibliograficas/ },
    { id: 'evtelematica', txt: 'Mecanismos de evaluación telemática (anexo IV, 2.1.2.e y h)', re: /evaluacion (telematica|en linea|online|a distancia)|telematic[^\n]{0,80}evaluacion|evaluacion[^\n]{0,80}telematic/, grave: true },
    { id: 'agentes', txt: 'Tipos de evaluación según el agente: hetero, co y autoevaluación (anexo IV, 2.1.2.h)', re: /coevaluacion|autoevaluacion|heteroevaluacion/ },
    { id: 'partida', txt: 'Punto de partida / diagnóstico inicial (plantilla Brújula20)', re: /punto de partida|evaluacion inicial|diagnostico inicial/ },
    { id: 'recuperacion', txt: 'Estrategias de refuerzo y planes de recuperación (plantilla Brújula20)', re: /refuerzo|recuperacion/ },
    { id: 'practica', txt: 'Evaluación de la práctica docente con indicadores de logro (plantilla Brújula20)', re: /practica docente|proceso de ensenanza|indicadores de logro/ }
  ];

  // Elementos de cada SA (anexo IV, 3.1.1, a–k).
  const ELEMENTOS_SA = [
    { l: 'a', txt: 'Identificación y justificación', re: /justificacion|identificacion|descripcion/ },
    { l: 'b', txt: 'Datos técnicos (curso y áreas)', re: /datos tecnicos|\bcurso\b|\bareas?\b|sesiones|periodo de implementacion/ },
    { l: 'c', txt: 'Enfoque globalizador', re: /globaliza/ },
    { l: 'd', txt: 'Fundamentación curricular', re: /criterios?|fundamentacion curricular/ },
    { l: 'e', txt: 'Metodología y secuencia de actividades', re: /metodologi|secuencia|actividad/ },
    { l: 'f', txt: 'Escenario telemático (≥ 30 %)', re: /telematic|no presencial/ },
    { l: 'g', txt: 'Evaluación y calificación', re: /evaluacion|calificacion|rubrica|indicadores de logro|escala/ },
    { l: 'h', txt: 'Atención a la diversidad (DUA)', re: /\bdua\b|diversidad|diseno universal/ },
    { l: 'i', txt: 'Elementos transversales y valores', re: /transversal|valores/ },
    { l: 'j', txt: 'Referencias a Canarias', re: /canari/ },
    { l: 'k', txt: 'Referencias bibliográficas y digitales', re: /bibliograf|referencias|webgrafia|recursos digitales/ }
  ];

  // Normas que deben aparecer y su forma correcta.
  const NORMAS_REQ = [
    { id: 'd211', txt: 'Decreto 211/2022 (currículo de Primaria de Canarias)', re: /decreto\s*211\s*\/\s*2022/, fecha: /decreto\s*211\s*\/\s*2022\s*,?\s*de\s+(\d{1,2}\s+de\s+[a-z]+)/g, fechaOk: '10 de noviembre' },
    { id: 'o2023', txt: 'Orden de 31 de mayo de 2023 (evaluación y promoción)', re: /orden\s+de\s+31\s+de\s+mayo\s+de\s+2023|orden\s+(de\s+)?31\s*\/\s*0?5\s*\/\s*2023/ },
    { id: 'd25', txt: 'Decreto 25/2018 (atención a la diversidad)', re: /decreto\s*25\s*\/\s*2018/, fecha: /decreto\s*25\s*\/\s*2018\s*,?\s*de\s+(\d{1,2}\s+de\s+[a-z]+)/g, fechaOk: '26 de febrero' }
  ];
  // Recomendadas: normativa de referencia del anexo IV, 2.1.1 (y estatal básica).
  const NORMAS_REC = [
    { txt: 'Decreto 81/2010 (ROC)', re: /decreto\s*81\s*\/\s*2010/ },
    { txt: 'Orden de 9 de octubre de 2013 (desarrollo del ROC)', re: /orden\s+de\s+9\s+de\s+octubre\s+de\s+2013|orden\s+(de\s+)?0?9\s*\/\s*10\s*\/\s*2013/ },
    { txt: 'Resolución de 15 de mayo de 2025 (rúbricas de los criterios de Primaria)', re: /resolucion\s+de\s+15\s+de\s+mayo\s+de\s+2025|resolucion\s+(de\s+)?15\s*\/\s*0?5\s*\/\s*2025/ },
    { txt: 'LOMLOE (Ley Orgánica 3/2020)', re: /lomloe|ley organica 3\s*\/\s*2020/ },
    { txt: 'Real Decreto 157/2022 (enseñanzas mínimas)', re: /real decreto\s*157\s*\/\s*2022|rd\s*157\s*\/\s*2022/ }
  ];
  const NORMAS_DEROGADAS = [
    { txt: 'Decreto 89/2014 (currículo LOMCE, derogado por el Decreto 211/2022)', re: /decreto\s*89\s*\/\s*2014/ },
    { txt: 'Real Decreto 126/2014 (currículo LOMCE, derogado)', re: /real decreto\s*126\s*\/\s*2014|rd\s*126\s*\/\s*2014/ },
    { txt: 'Orden de 21 de abril de 2015 (evaluación LOMCE en Canarias, sustituida por la Orden de 31/05/2023)', re: /orden\s+de\s+21\s+de\s+abril\s+de\s+2015/ },
    { txt: 'LOMCE (mención a la ley anterior)', re: /lomce/, leve: true },
    { txt: 'Decreto 114/2011 (convivencia): lo cita la convocatoria de 2026, pero lo derogó el Decreto 169/2026, de 30 de octubre, vigente desde el 29/11/2026', re: /decreto\s*114\s*\/\s*2011/, leve: true }
  ];
  const TERMINOS_OBSOLETOS = [
    { txt: '"estándares de aprendizaje" (terminología LOMCE)', re: /estandares de aprendizaje/ },
    { txt: '"competencias básicas" (terminología LOE 2006)', re: /competencias basicas/ }
  ];
  // Decretos canarios y estatales conocidos (cualquier otro se marca para verificar).
  const CONOCIDOS = ['211/2022', '25/2018', '81/2010', '169/2026', '24/2026', '174/2018', '196/2022', '30/2023', '157/2022', '276/2007', '270/2022', '800/2022', '95/2022', '217/2022', '89/2014', '126/2014', '114/2011'];

  // ---------- Detección de las SA ----------
  const SA_HEAD = /^[ \t]*(#{1,6}[ \t]*)?(\*\*)?[ \t]*(?:sa|s\.a\.|situacion(?:es)? de aprendizaje|ud|u\.d\.|unidad(?:es)? didacticas?|unidad)[ \t]*(?:n\.?[ºo°][ \t]*)?(\d{1,2})\b[ \t]*[.:\-–—)]?[ \t]*(.*)$/;

  function encabezados(lines) {
    // Encabezados genéricos (Markdown) para saber dónde acaba la última SA.
    const out = [];
    lines.forEach((l, i) => { const m = l.match(/^(#{1,6})\s+/); if (m) out.push({ i, nivel: m[1].length }); });
    return out;
  }

  function detectarSA(texto) {
    const lines = String(texto).replace(/\r/g, '').split('\n');
    const nlines = lines.map(norm);
    const cand = [];
    nlines.forEach((l, i) => {
      const m = l.match(SA_HEAD);
      if (!m) return;
      const n = parseInt(m[3], 10);
      if (!(n >= 1 && n <= 30)) return;
      const nivel = m[1] ? m[1].trim().length : 0;
      const tituloRaw = lines[i].replace(/^[ \t]*#{1,6}[ \t]*/, '').replace(/\*\*/g, '');
      const titulo = tituloRaw.replace(/^[^\d]*\d{1,2}\s*[.:\-–—)]?\s*/, '').replace(/\s*\.{3,}\s*\d+\s*$/, '').trim();
      // En un índice suele haber "SA 3 .......... 27": se descarta como cabecera de sección
      const enIndice = /(\.{3,}|\t)\s*\d{1,3}\s*$/.test(lines[i]);
      cand.push({ i, n, nivel, titulo, md: !!m[1], enIndice });
    });
    const usaMd = cand.some(c => c.md);
    const validos = cand.filter(c => !c.enIndice && (!usaMd || c.md));
    const heads = encabezados(lines);
    const segs = validos.map((c, k) => {
      let fin = k + 1 < validos.length ? validos[k + 1].i : lines.length;
      if (c.md) {
        const corte = heads.find(h => h.i > c.i && h.i < fin && h.nivel <= c.nivel && !validos.some(v => v.i === h.i));
        if (corte) fin = corte.i;
      }
      return { ...c, fin, texto: lines.slice(c.i, fin).join('\n') };
    });
    // Una SA por número: si aparece varias veces, se queda con el bloque más largo.
    const porN = new Map();
    for (const s of segs) { const p = porN.get(s.n); if (!p || s.texto.length > p.texto.length) porN.set(s.n, s); }
    return [...porN.values()].sort((a, b) => a.n - b.n);
  }

  // ---------- Porcentaje telemático de una SA ----------
  function telematico(seg) {
    const t = norm(seg);
    const res = { declarado: null, xdey: null, marcadas: 0, actividades: 0, calculado: null };
    let m = t.match(/actividades telematicas\W{0,6}\s*(\d{1,3})\s*de\s*(\d{1,3})(?:\s*\(\s*(\d{1,3}(?:[.,]\d+)?)\s*%\s*\))?/);
    if (m) {
      res.xdey = [parseInt(m[1], 10), parseInt(m[2], 10)];
      if (m[3]) res.declarado = parseFloat(m[3].replace(',', '.'));
    }
    if (res.declarado == null) {
      m = t.match(/(?:telematic|no presencial|en linea|online|a distancia)[^\n%]{0,80}?(\d{1,3}(?:[.,]\d+)?)\s*%/)
        || t.match(/(\d{1,3}(?:[.,]\d+)?)\s*%[^\n%]{0,60}?(?:telematic|no presencial|en linea|online|a distancia)/);
      if (m) res.declarado = parseFloat(m[1].replace(',', '.'));
    }
    // Recuento de actividades: líneas de lista numerada o "Actividad N"; marcadas con [TELEMÁTICA] o "(telemática)".
    const lines = t.split('\n');
    for (const l of lines) {
      const esAct = /^\s*(\d{1,2}[.)]\s+|[-*]\s+\**actividad\b|\**actividad\s+\d{1,2}\b)/.test(l);
      if (!esAct) continue;
      res.actividades++;
      if (/\[telematica\]|\(telematica\)|\btelematica\s*\]/.test(l)) res.marcadas++;
    }
    if (res.xdey && res.xdey[1] > 0) res.calculado = Math.round(1000 * res.xdey[0] / res.xdey[1]) / 10;
    else if (res.actividades >= 3 && res.marcadas > 0) res.calculado = Math.round(1000 * res.marcadas / res.actividades) / 10;
    return res;
  }

  // ---------- Criterios citados ----------
  function criteriosCitados(texto) {
    const t = norm(texto);
    const set = new Set();
    const addAll = s => (s.match(/\b\d{1,2}\.\d{1,2}\b/g) || []).forEach(x => set.add(x));
    // "criterio 2.1", "criterios 1.1, 2.3 y 4.2", "crit. 3.2"
    for (const m of t.matchAll(/\b(?:criterios?|crit\.)\s*(?:de evaluacion\s*)?(?:n\.?[ºo°]\s*)?((?:\d{1,2}\.\d{1,2})(?:\s*(?:,|;|y|e|o|-|–|\/)\s*\d{1,2}\.\d{1,2})*)/g)) addAll(m[1]);
    // Tablas: columnas cuya cabecera contiene "criterio"
    const lines = String(texto).replace(/\r/g, '').split('\n');
    let i = 0;
    while (i < lines.length) {
      if (!/^\s*\|/.test(lines[i])) { i++; continue; }
      const rows = [];
      while (i < lines.length && /^\s*\|/.test(lines[i])) rows.push(lines[i++]);
      const body = rows.filter(r => !/^\s*\|?\s*:?-{2,}/.test(r));
      if (!body.length) continue;
      const cells = r => r.trim().replace(/^\||\|$/g, '').split('|');
      const head = cells(body[0]).map(norm);
      const cols = head.map((h, k) => /criterio/.test(h) ? k : -1).filter(k => k >= 0);
      for (const r of body.slice(1)) { const c = cells(r); cols.forEach(k => addAll(norm(c[k] || '').replace(/\b(?:c|ce)\s?\d{1,2}\b/g, ''))); }
    }
    return [...set].sort((a, b) => { const [x1, y1] = a.split('.').map(Number), [x2, y2] = b.split('.').map(Number); return x1 - x2 || y1 - y2; });
  }
  function competenciasCitadas(texto) {
    const set = new Set();
    for (const m of String(texto).matchAll(/\bC(\d{1,2})\b/g)) set.add('C' + parseInt(m[1], 10));
    for (const m of norm(texto).matchAll(/competencias? especificas? (?:n\.?[ºo°]\s*)?(\d{1,2})\b/g)) set.add('C' + parseInt(m[1], 10));
    return [...set].sort((a, b) => parseInt(a.slice(1), 10) - parseInt(b.slice(1), 10));
  }

  // ---------- Validación completa ----------
  function validar(texto, opts = {}) {
    const bases = BASES_OPOSICION[opts.convocatoria || 'canarias-2026'];
    const src = String(texto == null ? '' : texto).replace(/\r/g, '');
    const t = norm(src);
    const secciones = [];
    const item = (estado, txt, detalle) => ({ estado, txt, detalle: detalle || '' });
    const penal = [];

    // 1. Extensión
    const palabras = contarPalabras(src);
    const pp = bases.paginas.palabrasPorPagina;
    const paginas = Math.round(10 * palabras / pp) / 10;
    const ext = [];
    const rango = `≈ ${Math.round(palabras / (pp * 1.1))}–${Math.round(palabras / (pp * 0.9))} páginas según tablas y márgenes`;
    if (!palabras) ext.push(item('error', 'No hay texto que analizar'));
    else if (paginas < bases.paginas.min) {
      ext.push(item('error', `Extensión estimada: ${paginas} páginas (${palabras} palabras), por debajo de ${bases.paginas.min}`, rango + `. Penalización de la base: −${bases.penalizaciones.menos25}.`));
      penal.push({ txt: 'Menos de 25 páginas (estimado)', p: bases.penalizaciones.menos25 });
    } else if (paginas > bases.paginas.max) {
      const extra = Math.ceil(paginas - bases.paginas.max);
      ext.push(item('error', `Extensión estimada: ${paginas} páginas (${palabras} palabras), por encima de ${bases.paginas.max}`, rango + `. Penalización: −${bases.penalizaciones.porPaginaExtra} por página extra (≈ ${extra}).`));
      penal.push({ txt: `≈ ${extra} páginas por encima de 50 (estimado)`, p: extra * bases.penalizaciones.porPaginaExtra });
    } else if (paginas < bases.paginas.min + 2 || paginas > bases.paginas.max - 2) {
      ext.push(item('aviso', `Extensión estimada: ${paginas} páginas (${palabras} palabras), dentro del rango pero cerca del límite`, rango + '. Compruébalo en el documento maquetado (Times 11, interlineado 1).'));
    } else ext.push(item('ok', `Extensión estimada: ${paginas} páginas (${palabras} palabras), dentro de ${bases.paginas.min}–${bases.paginas.max}`, rango + '. Portada, índice y contraportada no computan.'));
    const tl = bases.tablaLetra;
    ext.push(item('info', 'Tipo de letra (Times o Times New Roman 11), interlineado 1, espaciado normal, tablas ≥ 8 pt y DIN-A4: no verificables en texto plano',
      `Anexo IV, 1.b–g. Letra no conforme: −${bases.penalizaciones.letra} y, además, por cada página por encima del máximo de su tamaño: ${Object.entries(tl).map(([k, v]) => `${k} pt → ${v.maxPaginas} págs., −${v.porPagina}`).join('; ')} (1.ñ.6).`));
    if (/https?:\/\/|www\.|\bqr\b|codigo qr/.test(t)) ext.push(item('aviso', 'Hay enlaces web o códigos QR', 'El contenido enlazado se suma al cómputo de páginas (anexo IV, 1.k).'));
    ext.push(item('info', 'Ortografía: no verificada', `El tribunal resta ${bases.ortografia.porFalta} por falta y ${bases.ortografia.porTresTildes} por cada tres tildes omitidas, hasta ${bases.ortografia.max} punto en la programación (anexo IV, 1.m).`));
    ext.push(item('info', 'Entrega: dos ejemplares en papel, en sobre abierto (base 9.1)', `Con un solo ejemplar: −${bases.penalizaciones.unEjemplar} (anexo IV, 1.ñ.1).`));
    secciones.push({ titulo: 'Extensión y formato', items: ext });

    // 2. Portada, índice y apartados
    const ap = [];
    if (/^\s*(#{1,6}\s*)?(\*\*)?\s*portada\b/m.test(t) || /especialidad\s*:?\s*educacion primaria/.test(t)) ap.push(item('ok', 'Portada identificada'));
    else { ap.push(item('aviso', 'No se identifica la portada', 'Si falta en el documento entregado: −0,2.')); }
    for (const a of APARTADOS) {
      if (a.re.test(t)) ap.push(item('ok', a.txt));
      else {
        ap.push(item(a.grave ? 'error' : 'aviso', a.txt + ': no encontrado'));
        if (a.id === 'indice') penal.push({ txt: 'Sin índice', p: bases.penalizaciones.sinIndice });
      }
    }
    secciones.push({ titulo: 'Apartados obligatorios', items: ap });

    // 3. Contextualización y riesgo de cero
    const ctx = [];
    const publico = /centro (educativo )?publico|\bceip\b|\bceo\b|\bcer\b|colectivo de escuelas rurales|escuela unitaria|consejeria de educacion/.test(t);
    const canario = /canarias|tenerife|gran canaria|lanzarote|fuerteventura|la palma|la gomera|el hierro|la graciosa/.test(t);
    if (publico && canario) ctx.push(item('ok', 'Contextualizada en un centro público de Canarias'));
    else ctx.push(item('error', 'RIESGO DE CERO: no se aprecia la contextualización en un centro público de Canarias', 'Las bases califican con 0 la programación no contextualizada en un centro público dependiente de la Consejería (anexo IV, 1.q).'));
    const nCanarias = (t.match(/canari/g) || []).length;
    ctx.push(item(nCanarias >= 10 ? 'ok' : nCanarias >= 3 ? 'aviso' : 'error', `Referencias a Canarias: ${nCanarias} menciones`, 'Las bases valoran los contenidos canarios integrados en las SA.'));
    const personales = [];
    if (/\b\d{8}[a-hj-np-tv-z]\b/i.test(src) || /\b[xyz]\d{7}[a-z]\b/i.test(src)) personales.push('un DNI/NIE');
    if (/[\w.+-]+@[\w-]+\.[\w.]+/.test(src)) personales.push('un correo electrónico');
    if (/(?:\+34\s?)?\b[6789]\d{2}[\s.]?\d{3}[\s.]?\d{3}\b/.test(src)) personales.push('un teléfono');
    if (personales.length) ctx.push(item('aviso', 'Posibles datos personales: ' + personales.join(', '), 'No incluyas datos del alumnado ni del centro real. La identificación de la persona aspirante va en el sobre, no en el texto.'));
    ctx.push(item('info', 'Originalidad: no verificable automáticamente', 'Las bases califican con 0 una programación no original, copiada o publicada o difundida antes de la prueba (anexo IV, 1.n y 1.o; base 15.1.2.A). Si partes de un borrador generado, reescríbelo y hazlo tuyo.'));
    secciones.push({ titulo: 'Contextualización y originalidad', items: ctx });

    // 4. Normativa
    const nm = [];
    for (const n of NORMAS_REQ) {
      if (!n.re.test(t)) { nm.push(item('error', n.txt + ': no citada')); continue; }
      const mal = n.fecha ? [...new Set([...t.matchAll(n.fecha)].map(f => f[1].trim()).filter(f => f !== n.fechaOk))] : [];
      if (mal.length) nm.push(item('error', n.txt + `: fecha incorrecta ("${mal.join('", "')}"; es "${n.fechaOk}")`));
      else nm.push(item('ok', n.txt));
    }
    for (const n of NORMAS_REC) nm.push(n.re.test(t) ? item('ok', n.txt) : item('aviso', n.txt + ': no citada'));
    for (const n of NORMAS_DEROGADAS) if (n.re.test(t)) nm.push(item(n.leve ? 'aviso' : 'error', 'Norma no vigente citada: ' + n.txt, 'Si la citas como antecedente histórico, déjalo claro.'));
    for (const n of TERMINOS_OBSOLETOS) if (n.re.test(t)) nm.push(item('error', 'Terminología no LOMLOE: ' + n.txt));
    const desconocidos = new Set();
    for (const m of t.matchAll(/\b(?:real decreto|decreto|rd)\s*(\d{1,4}\s*\/\s*\d{4})/g)) { const k = m[1].replace(/\s/g, ''); if (!CONOCIDOS.includes(k)) desconocidos.add(k); }
    if (desconocidos.size) nm.push(item('aviso', 'Decretos no reconocidos por el validador: ' + [...desconocidos].join(', '), 'No significa que sean erróneos: compruébalos en el BOC o el BOE.'));
    secciones.push({ titulo: 'Referencias normativas', items: nm });

    // 5. Criterios y competencias frente al currículo
    const cr = [];
    const citados = criteriosCitados(src);
    const comps = competenciasCitadas(src);
    const cur = opts.curriculo || (typeof criteriosCiclo === 'function' && opts.area && opts.curso ? criteriosCiclo(opts.ccaa || 'canarias', opts.area, opts.curso) : null);
    let criteriosInfo = { citados, inexistentes: [], sinCubrir: [] };
    if (!cur || !cur.criterios || !cur.criterios.length) {
      cr.push(item('info', `Criterios citados: ${citados.join(', ') || 'ninguno detectado'}`, 'No hay currículo cargado para esta área y curso: no se puede cotejar.'));
    } else {
      const inex = citados.filter(c => !cur.criterios.includes(c));
      const sin = cur.criterios.filter(c => !citados.includes(c));
      criteriosInfo = { citados, inexistentes: inex, sinCubrir: sin };
      if (!citados.length) cr.push(item('error', 'No se detecta ningún criterio de evaluación numerado'));
      else if (inex.length) cr.push(item('error', `Criterios que NO existen en este ciclo y área: ${inex.join(', ')}`, `Válidos: ${cur.criterios.join(', ')}.`));
      else cr.push(item('ok', `Los ${citados.length} criterios citados existen en el currículo del ciclo`));
      if (citados.length) cr.push(item(sin.length ? 'aviso' : 'ok', sin.length ? `Criterios del ciclo no citados: ${sin.join(', ')}` : 'Todos los criterios del ciclo aparecen en la programación', sin.length ? 'Una programación anual debería cubrir todos los criterios del ciclo o justificar su reparto entre los dos cursos.' : ''));
      const compInex = comps.filter(c => !cur.competencias.includes(c));
      if (compInex.length) cr.push(item('error', `Competencias específicas inexistentes en el área: ${compInex.join(', ')}`, `El área tiene ${cur.competencias.join(', ')}.`));
    }
    secciones.push({ titulo: 'Criterios de evaluación (Decreto 211/2022)', items: cr });

    // 6. Situaciones de aprendizaje
    const sas = detectarSA(src);
    const saItems = [];
    const nums = sas.map(s => s.n);
    if (sas.length < bases.sa.min || sas.length > bases.sa.max) saItems.push(item('error', `Número de SA o unidades: ${sas.length} (las bases exigen ${bases.sa.min}–${bases.sa.max}; anexo IV, 1.h)`, sas.length ? 'Detectadas: ' + nums.join(', ') : 'Usa cabeceras del tipo "SA 1. Título".'));
    else saItems.push(item('ok', `Número de SA o unidades: ${sas.length} (${bases.sa.min}–${bases.sa.max})`));
    const huecos = nums.length ? Array.from({ length: Math.max(...nums) }, (_, k) => k + 1).filter(k => !nums.includes(k)) : [];
    if (huecos.length) saItems.push(item('aviso', 'Numeración con saltos: falta ' + huecos.join(', ')));
    const sinTitulo = sas.filter(s => s.titulo.length < 3).map(s => s.n);
    if (sinTitulo.length) saItems.push(item('error', 'SA sin título: ' + sinTitulo.join(', '), 'Las bases exigen unidades numeradas y tituladas (anexo IV, 1.h).'));
    secciones.push({ titulo: 'Situaciones de aprendizaje', items: saItems });

    const detalleSA = sas.map(s => {
      const tn = norm(s.texto);
      const tel = telematico(s.texto);
      const pct = tel.declarado != null ? tel.declarado : tel.calculado;
      let estadoTel;
      if (pct == null) estadoTel = 'error';
      else if (pct < bases.telematicoMin) estadoTel = 'error';
      else if (tel.declarado != null && tel.calculado != null && Math.abs(tel.declarado - tel.calculado) > 2) estadoTel = 'aviso';
      else if (tel.declarado == null) estadoTel = 'aviso';
      else estadoTel = 'ok';
      const elementos = ELEMENTOS_SA.map(e => ({ l: e.l, txt: e.txt, ok: e.re.test(tn) }));
      const faltan = elementos.filter(e => !e.ok);
      const crit = criteriosCitados(s.texto);
      const critMal = cur && cur.criterios ? crit.filter(c => !cur.criterios.includes(c)) : [];
      const estado = estadoTel === 'error' || faltan.length > 2 || critMal.length ? 'error' : (estadoTel === 'aviso' || faltan.length || !crit.length) ? 'aviso' : 'ok';
      return {
        n: s.n, titulo: s.titulo, palabras: contarPalabras(s.texto), estado,
        telematico: { ...tel, porcentaje: pct, estado: estadoTel },
        elementos, faltan: faltan.map(e => e.l), criterios: crit, criteriosInexistentes: critMal
      };
    });

    // Penalización estimada
    const total = Math.min(bases.penalizaciones.tope, Math.round(100 * penal.reduce((a, b) => a + b.p, 0)) / 100);
    const riesgoCero = !(publico && canario);
    const todos = secciones.flatMap(s => s.items).concat(detalleSA.map(s => ({ estado: s.estado })));
    const resumen = { ok: 0, aviso: 0, error: 0, info: 0 };
    todos.forEach(x => resumen[x.estado]++);
    const global = riesgoCero || resumen.error ? 'error' : resumen.aviso ? 'aviso' : 'ok';
    return {
      bases: bases.nombre, global, resumen, palabras, paginas, secciones, sa: detalleSA,
      criterios: criteriosInfo, penalizacion: { estimada: total, detalle: penal, tope: bases.penalizaciones.tope }, riesgoCero
    };
  }

  // ---------- Informe en Markdown (para copiar, descargar o guardar) ----------
  const ETQ = { ok: '[OK]', aviso: '[REVISAR]', error: '[FALLA]', info: '[INFO]' };
  function informeMarkdown(r) {
    const L = [];
    L.push('# Informe de formato de la programación (oposición)');
    L.push('');
    L.push(`Bases: ${r.bases}. Resultado global: **${ETQ[r.global]}** · ${r.resumen.ok} correctos, ${r.resumen.aviso} a revisar, ${r.resumen.error} fallos.`);
    L.push('');
    L.push(`Penalización formal estimada: **−${String(r.penalizacion.estimada).replace('.', ',')}** (tope −${r.penalizacion.tope}).${r.riesgoCero ? ' **Riesgo de calificación 0** por falta de contextualización.' : ''}`);
    for (const s of r.secciones) {
      L.push('', '## ' + s.titulo);
      for (const it of s.items) L.push(`- **${ETQ[it.estado]}** ${it.txt}${it.detalle ? '. ' + it.detalle : ''}`);
    }
    if (r.sa.length) {
      L.push('', '## Detalle por situación de aprendizaje', '');
      L.push('| SA | Título | Telemático | Elementos a–k que faltan | Criterios | Estado |');
      L.push('| --- | --- | --- | --- | --- | --- |');
      for (const s of r.sa) {
        const tel = s.telematico.porcentaje == null ? 'no declarado' : `${String(s.telematico.porcentaje).replace('.', ',')} %${s.telematico.declarado == null ? ' (calculado)' : ''}`;
        const crit = (s.criterios.join(', ') || '—') + (s.criteriosInexistentes.length ? ' (no existen: ' + s.criteriosInexistentes.join(', ') + ')' : '');
        L.push(`| ${s.n} | ${s.titulo.replace(/\|/g, '/')} | ${tel} | ${s.faltan.join(', ') || 'ninguno'} | ${crit} | ${ETQ[s.estado]} |`);
      }
    }
    L.push('', '*Validación automática orientativa sobre texto plano. No sustituye la lectura de las bases ni comprueba la originalidad, que las bases exigen.*');
    return L.join('\n');
  }

  return { validar, informeMarkdown, detectarSA, telematico, criteriosCitados, competenciasCitadas, contarPalabras, BASES: BASES_OPOSICION };
})();

if (typeof module !== 'undefined') module.exports = ValidadorOposicion;
