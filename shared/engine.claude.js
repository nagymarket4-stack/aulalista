// Motor del PROTOTIPO: funciona dentro de claude.ai usando las capacidades del artefacto
// (sample = IA, db = documentos privados de cada docente, downloads = exportar).
const Engine = (() => {
  let sample = null, db = null, dl = null, uid = null;
  const FREE_LIMIT = 3;          // límite del plan gratuito (solo informativo en el prototipo)
  const ENFORCE_LIMIT = false;   // ponlo a true para simular el muro de pago
  const mesKey = () => { const d = new Date(); return 'usage-' + d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0'); };
  const col = () => db.collection('data/users/' + uid);

  async function init() {
    if (!window.claude || !window.claude.use) return { ai: false, storage: false, downloads: false, message: 'Abre esta página en claude.ai para usar el generador' };
    const [s, d, u, w] = await Promise.all([claude.use('sample'), claude.use('db'), claude.use('user'), claude.use('downloads')]);
    sample = s; db = d; dl = w;
    if (u && db) { try { uid = await u.id(); } catch (e) { uid = null; } }
    if (!uid) db = null;
    return { ai: !!sample, storage: !!db, downloads: !!dl };
  }

  async function generate(prompt, onText, signal) {
    if (!sample) throw new Error('El motor de IA no está disponible en esta vista');
    const res = await sample(prompt, { onText: ({ text }) => onText(text), signal, modelTier: 'complex', cache: false });
    return res.text;
  }

  async function usageCount() {
    if (!db) return 0;
    const s = await col().doc(mesKey()).get();
    return s.exists ? (s.data().n || 0) : 0;
  }
  async function canGenerate() {
    if (!ENFORCE_LIMIT) return { ok: true };
    const n = await usageCount();
    return n < FREE_LIMIT ? { ok: true } : { ok: false, message: 'Has usado tus ' + FREE_LIMIT + ' documentos gratis de este mes. Pásate a Pro para seguir.' };
  }
  async function countUsage() {
    if (!db) return;
    const n = await usageCount();
    await col().doc(mesKey()).set({ kind: 'usage', n: n + 1 });
  }
  async function usage() {
    const n = await usageCount();
    return { plan: ENFORCE_LIMIT ? 'Plan Gratis' : 'Prototipo', label: n + (ENFORCE_LIMIT ? '/' + FREE_LIMIT : '') + ' documentos este mes' };
  }

  async function saveDoc(d) { if (!db) throw new Error('sin almacenamiento'); await col().doc(d.id).set({ kind: 'doc', ...d }); }
  async function listDocs() {
    if (!db) throw new Error('sin almacenamiento');
    const snap = await col().where('kind', '==', 'doc').limit(200).get();
    return snap.docs.map(x => x.data());
  }
  async function deleteDoc(id) { if (!db) throw new Error('sin almacenamiento'); await col().doc(id).delete(); }
  async function download(filename, data) { if (!dl) throw { code: 'unavailable' }; await dl.save({ filename, data }); }

  return { init, generate, canGenerate, countUsage, usage, saveDoc, listDocs, deleteDoc, download };
})();
