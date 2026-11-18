// Motor de PRODUCCIÓN: habla con el backend (Cloudflare Worker, /api/*).
// Historial en el navegador del docente (localStorage); licencia Pro guardada tras el pago.
/*AFILIADO*/
// Atribución de afiliados sin cookies de terceros (build.py copia este bloque también a la landing).
// ?ref=<código> → localStorage propio «al-ref» durante 60 días (gana el último enlace usado). Se envía en
// /api/lead y se añade como client_reference_id a los Payment Links de Stripe (buy.stripe.com).
const AulaRef = (() => {
  const KEY = 'al-ref', DAYS = 60, RE = /^[a-z0-9]{1,32}$/;
  const clean = v => { const s = String(v == null ? '' : v).trim().toLowerCase(); return RE.test(s) ? s : null; };
  function read(now) {
    let v = null;
    try { v = JSON.parse(localStorage.getItem(KEY)); } catch (e) {}
    if (!v || !clean(v.c) || typeof v.t !== 'number') return null;
    if ((now || Date.now()) - v.t > DAYS * 864e5 || v.t > (now || Date.now()) + 864e5) { try { localStorage.removeItem(KEY); } catch (e) {} return null; }
    return { c: clean(v.c), t: v.t };
  }
  // Lee ?ref= de la URL, lo guarda y lo retira de la barra de direcciones (conserva los demás parámetros).
  function capture() {
    let params;
    try { params = new URLSearchParams(location.search); } catch (e) { return get(); }
    if (!params.has('ref')) return get();
    const c = clean(params.get('ref'));
    if (c) { try { localStorage.setItem(KEY, JSON.stringify({ c, t: Date.now() })); } catch (e) {} }
    params.delete('ref');
    const qs = params.toString();
    try { history.replaceState(null, '', location.pathname + (qs ? '?' + qs : '') + location.hash); } catch (e) {}
    return get();
  }
  function get() { const v = read(); return v ? v.c : null; }
  function clickTime() { const v = read(); return v ? v.t : null; }
  function isPaymentLink(href) { try { const u = new URL(href); return u.protocol === 'https:' && u.hostname === 'buy.stripe.com'; } catch (e) { return false; } }
  function checkoutUrl(href) {
    const c = get();
    if (!c || !isPaymentLink(href)) return href;
    const u = new URL(href); u.searchParams.set('client_reference_id', c); return u.href;
  }
  // Decora al hacer clic cualquier enlace a un Payment Link (también los que se añadan después).
  function decorate(doc) {
    doc.addEventListener('click', e => {
      const a = e.target && e.target.closest ? e.target.closest('a[href]') : null;
      if (a && isPaymentLink(a.href)) a.href = checkoutUrl(a.href);
    }, true);
  }
  return { capture, get, clickTime, checkoutUrl, decorate, isPaymentLink, clean };
})();
/*END_AFILIADO*/

const Engine = (() => {
  const API = '';               // mismo dominio que el Worker
  const KEY = 'al-license';
  const store = {
    get(k, def) { try { return JSON.parse(localStorage.getItem(k)) ?? def; } catch (e) { return def; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  };
  const LICENSE_RE = /^al_[0-9a-f]{36}$/;
  const license = () => { const l = store.get(KEY, null); return typeof l === 'string' && LICENSE_RE.test(l) ? l : null; };
  let lastUsage = null;

  const PORTAL = '/api/portal';   // redirige al portal de cliente de Stripe (STRIPE_PORTAL_URL)

  async function init() {
    AulaRef.capture();
    if (typeof document !== 'undefined') AulaRef.decorate(document);
    // Vuelta desde Stripe Checkout: ?session_id=cs_...
    const params = new URLSearchParams(location.search);
    const sid = params.get('session_id');
    if (sid) {
      try {
        const r = await fetch(API + '/api/license?session_id=' + encodeURIComponent(sid));
        if (r.ok) { const j = await r.json(); if (LICENSE_RE.test(j.license || '')) store.set(KEY, j.license); }
      } catch (e) {}
      // Solo se retira session_id; se conservan los demás parámetros de la URL
      params.delete('session_id');
      const qs = params.toString();
      history.replaceState(null, '', location.pathname + (qs ? '?' + qs : '') + location.hash);
    }
    return { ai: true, storage: true, downloads: true };
  }

  async function generate(prompt, onText, signal, meta) {
    const headers = { 'content-type': 'application/json' };
    const lic = license(); if (lic) headers['authorization'] = 'Bearer ' + lic;
    const r = await fetch(API + '/api/generate', { method: 'POST', headers, body: JSON.stringify(meta), signal });
    // Licencia caducada, dada de baja o no reconocida: se olvida y se pasa al plan gratuito
    if (r.headers.get('x-license') === 'invalid') { try { localStorage.removeItem(KEY); } catch (e) {} }
    if (!r.ok || !r.body) {
      const j = await r.json().catch(() => ({}));
      throw new Error(j.message || (r.status === 402 ? 'Límite del plan gratuito alcanzado' : 'El servicio no responde (' + r.status + ')'));
    }
    lastUsage = { used: +r.headers.get('x-usage-used') || 0, limit: +r.headers.get('x-usage-limit') || 0, pro: r.headers.get('x-plan') === 'pro' };
    const reader = r.body.getReader(), dec = new TextDecoder();
    let text = '', buf = '', stopReason = null, finished = false;
    const handle = evt => {
      const line = evt.split('\n').find(l => l.startsWith('data:'));
      if (!line) return;
      let j; try { j = JSON.parse(line.slice(5).trim()); } catch (e) { return; }
      if (j.type === 'content_block_delta' && j.delta && j.delta.type === 'text_delta' && typeof j.delta.text === 'string') { text += j.delta.text; onText(text); }
      else if (j.type === 'message_delta' && j.delta && j.delta.stop_reason) stopReason = j.delta.stop_reason;
      else if (j.type === 'message_stop') finished = true;
      else if (j.type === 'error') throw new Error((j.error && j.error.type === 'overloaded_error') ? 'El motor de IA está saturado. Inténtalo en unos minutos.' : 'Error del motor de IA. Inténtalo de nuevo.');
    };
    for (;;) {
      const { value, done } = await reader.read();
      if (done) break;
      buf += dec.decode(value, { stream: true }).replace(/\r\n/g, '\n');
      let i;
      while ((i = buf.indexOf('\n\n')) >= 0) { const evt = buf.slice(0, i); buf = buf.slice(i + 2); handle(evt); }
    }
    buf += dec.decode();
    if (buf.trim()) handle(buf);
    if (!finished) throw new Error('La conexión se cortó antes de terminar. El documento puede estar incompleto.');
    if (stopReason === 'max_tokens') throw new Error('El documento alcanzó la longitud máxima y puede estar incompleto. Revísalo antes de usarlo.');
    return text;
  }

  async function canGenerate() { return { ok: true }; } // el servidor decide (402 si no hay cupo)
  async function countUsage() {}
  async function usage() {
    if (license() && !(lastUsage && lastUsage.pro === false)) return { plan: 'Pro', label: '', manage: PORTAL };
    if (!lastUsage) { try { const r = await fetch(API + '/api/usage'); if (r.ok) lastUsage = await r.json(); } catch (e) {} }
    return { plan: 'Plan Gratis', label: lastUsage ? `${lastUsage.used}/${lastUsage.limit} este mes` : '' };
  }

  const docs = () => store.get('al-docs', []);
  async function saveDoc(d) { const all = docs().filter(x => x.id !== d.id); all.push(d); store.set('al-docs', all.slice(-200)); }
  async function listDocs() { return docs(); }
  async function deleteDoc(id) { store.set('al-docs', docs().filter(x => x.id !== id)); }
  async function download(filename, data) {
    const blob = data instanceof Blob ? data : new Blob([data], { type: 'text/markdown;charset=utf-8' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = filename;
    document.body.append(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
  }
  return { init, generate, canGenerate, countUsage, usage, saveDoc, listDocs, deleteDoc, download };
})();
