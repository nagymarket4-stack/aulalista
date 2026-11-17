import re, json, glob, unicodedata, difflib, sys
# Uso: pdftotext boc-a-2022-231-3533.pdf /tmp/raw.txt && python3 tools/verificar_criterios_canarias.py /tmp/raw.txt
# Coteja cada criterio y competencia de data/canarias/primaria/*.json con el texto del BOC oficial.
raw = open(sys.argv[1] if len(sys.argv) > 1 else 'raw.txt', encoding='utf-8').read()
lines = []
for l in raw.split('\n'):
    t = l.strip()
    if re.match(r'^(Boletín Oficial de Canarias núm\. 231|\d{5}|Miércoles 23 de noviembre de 2022|https?://\S+|boc-a-2022-231-3533.*)$', t): continue
    if 'sede.gobiernodecanarias.org' in t: continue
    if re.match(r'^(Descriptores operativos de las|competencias clave\. Perfil de salida|Competencias específicas|Criterios de evaluación)$', t): continue
    lines.append(l)
text = '\n'.join(lines)
# join hyphenated line breaks
text = re.sub(r'(\w)-\n(\w)', r'\1\2', text)
text = re.sub(r'(\w)-\s*(?:(?:CCL|CP|STEM|CD|CPSAA|CC|CE|CCEC)\d[,.]?\s*)+(\w)', r'\1-\2', text)
toks = text.split()
DESC = re.compile(r'^(CCL|CP|STEM|CD|CPSAA|CC|CE|CCEC|CCE)\d[,.]?$')
orig = [t for t in toks if not DESC.match(t)]
def norm(w):
    w = unicodedata.normalize('NFC', w.lower())
    return re.sub(r'[^\wáéíóúüñ]', '', w)
N = [norm(t) for t in orig]
idx = {}
for i,w in enumerate(N):
    if w: idx.setdefault(w, []).append(i)
NN = [ (i,w) for i,w in enumerate(N) if w]
pos = [i for i,_ in NN]; seq = [w for _,w in NN]
def find(words):
    k = len(words); best=(0,None)
    # anchor on first 4 words
    for L in (5,4,3):
        heads = words[:L]
        for j in range(len(seq)-L):
            if seq[j:j+L]==heads:
                cand = seq[j:j+k+8]
                sm = difflib.SequenceMatcher(None, words, cand, autojunk=False)
                # find span end
                blocks = sm.get_matching_blocks()
                endb = max(b.b+b.size for b in blocks if b.size)
                r = difflib.SequenceMatcher(None, words, cand[:endb], autojunk=False).ratio()
                if r>best[0]: best=(r,(j,j+endb))
        if best[1]: break
    return best
res = {}; report=[]
total=exact=fixed=miss=0
for f in sorted(glob.glob('data/canarias/primaria/*.json')):
    j = json.load(open(f, encoding='utf-8'))
    for ciclo,v in j['ciclos'].items():
        for c in (v or {}).get('criterios', []):
            total+=1
            words=[norm(w) for w in c['texto'].split() if norm(w)]
            r,span=find(words)
            if span is None:
                miss+=1; report.append(f"NO ENCONTRADO | {j['area']} | {ciclo} | {c['id']}"); continue
            a,b=span
            off=' '.join(orig[pos[a]:pos[b-1]+1])
            off=re.sub(r'^\d+\.\d+\.\s*','',off)
            if r==1.0: exact+=1; c['_estado']='exacto'
            else:
                fixed+=1; c['_estado']=f'corregido ({r:.3f})'
                report.append(f"CORREGIDO r={r:.3f} | {j['area']} | {ciclo} | {c['id']}\n   antes: {c['texto']}\n   BOC:   {off}")
                c['_boc']=off
    res[f]=j
print(f"total={total} exactos={exact} diferencias={fixed} no_encontrados={miss}")
open('/tmp/informe-cotejo.txt','w').write('\n'.join(report))

ct=ce=0; bad=[]
for f,j in res.items():
    for k in j['competencias']:
        if not k.get('enunciado'): continue
        ct+=1
        words=[norm(w) for w in k['enunciado'].split() if norm(w)]
        r,span=find(words)
        if r==1.0: ce+=1
        else: bad.append((j['area'],k['id'],r))
print('competencias',ct,'exactas',ce,bad)
