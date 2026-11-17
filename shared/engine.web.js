// Motor de PRODUCCIÓN: habla con el backend (Cloudflare Worker, /api/*).
// Historial en el navegador del docente (localStorage); licencia Pro guardada tras el pago.
const Engine = (() => {
  const API = '';               // mismo dominio que el Worker
  const KEY = 'al-license';
  const store = {
    get(k, def) { try { return JSON.parse(localStorage.getItem(k)) ?? def; } catch (e) { return def; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  };
  const license = () => store.get(KEY, null);
  let lastUsage = null;

  async function init() {
    // Vuelta desde Stripe Checkout: ?session_id=cs_...
    const sid = new URLSearchParams(location.search).get('session_id');
    if (sid) {
      try {
        const r = await fetch(API + '/api/license?session_id=' + encodeURIComponent(sid));
        if (r.ok) { const j = await r.json(); store.set(KEY, j.license); }
      } catch (e) {}
      history.replaceState(null, '', location.pathname);
    }
    return { ai: true, storage: true, downloads: true };
  }

  async function generate(prompt, onText, signal, meta) {
    const headers = { 'content-type': 'application/json' };
    const lic = license(); if (lic) headers['authorization'] = 'Bearer ' + lic;
    const r = await fetch(API + '/api/generate', { method: 'POST', headers, body: JSON.stringify(meta), signal });
    if (r.status === 402 || r.status === 429) { const j = await r.json().catch(() => ({})); throw new Error(j.message || 'Límite del plan gratuito alcanzado'); }
    if (!r.ok || !r.body) throw new Error('El servicio no responde (' + r.status + ')');
    lastUsage = { used: +r.headers.get('x-usage-used') || 0, limit: +r.headers.get('x-usage-limit') || 0, pro: r.headers.get('x-plan') === 'pro' };
    const reader = r.body.getReader(), dec = new TextDecoder();
    let text = '', buf = '';
    for (;;) {
      const { value, done } = await reader.read();
      if (done) break;
      buf += dec.decode(value, { stream: true });
      let i;
      while ((i = buf.indexOf('\n\n')) >= 0) {
        const evt = buf.slice(0, i); buf = buf.slice(i + 2);
        const line = evt.split('\n').find(l => l.startsWith('data: '));
        if (!line) continue;
        let j; try { j = JSON.parse(line.slice(6)); } catch (e) { continue; }
        if (j.type === 'content_block_delta' && j.delta && j.delta.type === 'text_delta') { text += j.delta.text; onText(text); }
        if (j.type === 'error') throw new Error((j.error && j.error.message) || 'Error del modelo');
      }
    }
    return text;
  }

  async function canGenerate() { return { ok: true }; } // el servidor decide (402 si no hay cupo)
  async function countUsage() {}
  async function usage() {
    if (license()) return { plan: 'Pro', label: '' };
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
