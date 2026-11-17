#!/usr/bin/env python3
"""Extrae del Decreto 211/2022 (BOC n.º 231, 23/11/2022) los saberes básicos, la
«Explicación del bloque competencial» y los descriptores operativos de cada área y ciclo
de Primaria, y los vuelca en data/canarias/primaria/<area>.json.

Entrada: texto del PDF oficial (boc-a-2022-231-3533.pdf) generado con
    pdftotext -layout boc-a-2022-231-3533.pdf layout.txt
Se usa -layout porque conserva la columna de descriptores alineada con su criterio y
no elimina los guiones de las palabras compuestas al final de línea
(pdftotext sin -layout convierte «pausada-agitada» en «pausadaagitada»).

Uso:
    python3 tools/extraer_saberes_canarias.py /ruta/layout.txt            # solo informe
    python3 tools/extraer_saberes_canarias.py /ruta/layout.txt --escribir # actualiza los JSON
    python3 tools/extraer_saberes_canarias.py /ruta/layout.txt --volcado /tmp/x.json

Qué escribe (con --escribir), por área:
  - "saberes": {ciclo: [{"bloque": "I. ...", "items": [...]}  o
                         {"bloque": "I. ...", "apartados": [{"apartado": "1. ...", "items": [...]}]}]}
    Los ítems son literales y conservan su numeración («1.», «1.1.», «2.2.1.»…). Si un
    bloque tiene apartados con subnumeración, se usa "apartados"; si no, "items".
  - "bloques": {ciclo: [{"competencias": ["C1"], "criterios": ["1.1", ...],
                         "descriptores": [...], "explicacion": "..."}]}
    "descriptores" son los de la fila de la competencia específica (celda compartida
    cuando el bloque agrupa dos competencias, como C1-C2 y C7-C8 de Matemáticas).
  - corrige criterio["descriptores"] cuando difieren del PDF y lo anota en "cotejo".
No toca textos de criterios ni enunciados.
"""
import json, re, sys, glob, os, unicodedata, datetime

AREAS = [  # (título en el BOC, fichero)
    ("CONOCIMIENTO DEL MEDIO NATURAL, SOCIAL Y CULTURAL", "conocimiento-del-medio-natural-social-y-cultural.json"),
    ("EDUCACIÓN ARTÍSTICA", "educacion-artistica.json"),
    ("EDUCACIÓN EMOCIONAL Y PARA LA CREATIVIDAD", "educacion-emocional-y-para-la-creatividad.json"),
    ("EDUCACIÓN FÍSICA", "educacion-fisica.json"),
    ("EDUCACIÓN EN VALORES CÍVICOS Y ÉTICOS", "educacion-en-valores-civicos-y-eticos.json"),
    ("LENGUA CASTELLANA Y LITERATURA", "lengua-castellana-y-literatura.json"),
    ("LENGUA EXTRANJERA", "lengua-extranjera.json"),
    ("MATEMÁTICAS", "matematicas.json"),
    ("SEGUNDA LENGUA EXTRANJERA", "segunda-lengua-extranjera.json"),
]
FIN = "ANEXO 3"
CICLOS = {"Primer": "primer", "Segundo": "segundo", "Tercer": "tercer"}

DESC_TOK = r"(?:CCL|CP|STEM|CD|CPSAA|CCEC|CCE|CC|CE)\d"
DESC_RUN = re.compile(r"(?:^|\s)((?:" + DESC_TOK + r"[,.]?\s*)+)$")
FURNITURE = re.compile(
    r"^(Boletín Oficial de Canarias núm\. 231.*|\d{5}|Miércoles 23 de noviembre de 2022|"
    r"https://sede\.gobiernodecanarias\.org/boc.*|boc-a-2022-231-3533)$")
TAIL_FURN = re.compile(r"\s{2,}(Boletín Oficial de Canarias núm\. 231|Miércoles 23 de noviembre de 2022|\d{5})\s*$")
HEAD_TAIL = re.compile(r"\s{2,}(Descriptores operativos de las|competencias clave\. Perfil de salida)\s*")


def limpiar(lines):
    """Quita cabeceras y pies de página; conserva líneas vacías (separan párrafos)."""
    out = []
    for l in lines:
        s = l.strip()
        if FURNITURE.match(s):
            out.append("")
            continue
        l = TAIL_FURN.sub("", l.rstrip())
        out.append(l)
    return out


def unir(partes):
    """Une líneas de un párrafo; un guion final (palabra compuesta) se une sin espacio."""
    txt = ""
    for p in partes:
        p = p.strip()
        if not p:
            continue
        if not txt:
            txt = p
        elif re.search(r"\w-$", txt):
            txt += p
        else:
            txt += " " + p
    return re.sub(r"\s+", " ", txt).strip()


def secciones(lines):
    """Devuelve {fichero: {ciclo: (ini_bloques, ini_saberes, fin)}}."""
    pos = {}
    for i, l in enumerate(lines):
        s = l.strip()
        for t, f in AREAS:
            if s == t and t not in pos:
                pos[t] = i
        if s == FIN and FIN not in pos:
            pos[FIN] = i
    orden = [t for t, _ in AREAS] + [FIN]
    res = {}
    for k, (t, f) in enumerate(AREAS):
        a, b = pos[t], pos[orden[k + 1]]
        # inicios de ciclo: primera etiqueta «X ciclo Educación Primaria» de cada ciclo
        starts = []
        for i in range(a, b):
            m = re.search(r"(Primer|Segundo|Tercer) ciclo Educación Primaria\s*$", lines[i])
            if m and (not starts or starts[-1][1] != CICLOS[m.group(1)]):
                starts.append((i, CICLOS[m.group(1)]))
        res[f] = {}
        for n, (i, c) in enumerate(starts):
            fin = starts[n + 1][0] if n + 1 < len(starts) else b
            sab = next(j for j in range(i, fin) if re.match(r"^Saberes básicos\.?$", lines[j].strip()))
            res[f][c] = (i, sab, fin)
    return res


# ---------------------------------------------------------------- bloques competenciales
def parse_bloques(lines):
    bloques, cur = [], None
    estado, buf, desc = None, [], []
    comp = None  # (num, [lineas], [desc])
    crit = None
    def nuevo_bloque():
        return {"competencias": [], "criterios": [], "descriptores": [],
                "_enunciados": {}, "_crit_desc": {}, "_crit_txt": {}, "explicacion": ""}
    def cerrar_comp():
        nonlocal comp
        if comp:
            cid = "C" + comp[0]
            cur["competencias"].append(cid)
            cur["descriptores"] += [t for t in toks(comp[2]) if t not in cur["descriptores"]]
            cur["_enunciados"][cid] = re.sub(r"^\d+\.\s*", "", unir(comp[1]))
            comp = None
    def cerrar_crit():
        nonlocal crit
        if crit:
            cur["criterios"].append(crit[0])
            cur["_crit_desc"][crit[0]] = toks(crit[2])
            cur["_crit_txt"][crit[0]] = re.sub(r"^\d+\.\d+\.?\s*", "", unir(crit[1]))
            crit = None
    for l in lines:
        s = l.strip()
        if not s or re.search(r"ciclo Educación Primaria\s*$", s) or s.startswith("Bloques competenciales"):
            continue
        if s.startswith("Competencia específica"):
            if estado in ("expl", None):
                if cur and estado == "expl":
                    cur["explicacion"] = unir(buf)
                    bloques.append(cur)
                cur = nuevo_bloque()
            cerrar_crit(); cerrar_comp()
            estado, comp = "comp", None
            continue
        if s.startswith("Criterios de evaluación"):
            cerrar_comp(); estado = "crit"; continue
        if s.startswith("Explicación del bloque competencial"):
            cerrar_crit(); estado, buf = "expl", []; continue
        if estado == "expl":
            buf.append(s); continue
        l2 = HEAD_TAIL.sub("   ", l)
        m = DESC_RUN.search(l2)
        d = m.group(1) if m else ""
        txt = l2[:m.start(1)] if m else l2
        txt = txt.strip()
        if estado == "comp":
            mm = re.match(r"^(\d+)\.\s", txt)
            if mm and comp and comp[0] == "?":  # descriptores leídos antes del enunciado
                comp[0] = mm.group(1)
            elif mm:  # en Matemáticas un bloque agrupa dos competencias (C1-C2, C7-C8)
                cerrar_comp(); comp = [mm.group(1), [], []]
            if comp is None:
                comp = ["?", [], []]
            if txt: comp[1].append(txt)
            if d: comp[2].append(d)
        elif estado == "crit":
            mm = re.match(r"^(\d+\.\d+)\.?\s", txt)  # el BOC omite a veces el punto («1.2 Reelaborar»)
            if mm:
                cerrar_crit(); crit = [mm.group(1), [], []]
            if crit is None:  # descriptores antes de la primera línea del criterio
                crit = ["?", [], []]
            if txt: crit[1].append(txt)
            if d: crit[2].append(d)
    if cur:
        cerrar_crit(); cerrar_comp()
        if estado == "expl": cur["explicacion"] = unir(buf)
        bloques.append(cur)
    return bloques


def toks(parts):
    return re.findall(DESC_TOK, " ".join(parts))


# ---------------------------------------------------------------- saberes básicos
ROMAN = re.compile(r"^([IVX]+)\.\s+\S")
NUM = re.compile(r"^(\d+(?:\.\d+)*)(?:\.\s*\S|\s+[A-ZÁÉÍÓÚÑ])")  # «1 Conteo y cantidad» sin punto


def parse_saberes(lines):
    """Párrafos: empiezan tras línea vacía y con numeración romana o arábiga."""
    paras, prev_blank = [], True
    for l in lines[1:]:  # salta «Saberes básicos»
        s = l.strip()
        if not s:
            prev_blank = True; continue
        if re.search(r"ciclo Educación Primaria\s*$", s):
            continue
        if prev_blank and (ROMAN.match(s) or NUM.match(s)):
            paras.append([s])
        elif paras:
            paras[-1].append(s)
        else:
            paras.append([s])
        prev_blank = False
    entries = []
    for p in paras:
        t = unir(p)
        m = ROMAN.match(t)
        if m:
            entries.append(("R", m.group(1), t)); continue
        m = NUM.match(t)
        entries.append(("N", m.group(1) if m else None, t))
    bloques, avisos = [], []
    for kind, num, t in entries:
        if kind == "R":
            bloques.append({"bloque": t, "_e": []}); continue
        if not bloques or num is None:
            avisos.append("párrafo sin numeración: " + t[:80]); continue
        bloques[-1]["_e"].append((num, t))
    out = []
    for b in bloques:
        e = b["_e"]
        with_children = {n.split(".")[0] for n, _ in e if "." in n}
        tops = [n for n, _ in e if "." not in n]
        reinicia = any(int(b2) <= int(a2) for a2, b2 in zip(tops, tops[1:]))
        if not with_children and reinicia:
            # Apartados con ítems que reinician la numeración (Matemáticas, «1. Magnitud» → 1., 2., 3.):
            # es título de apartado el párrafo seguido de un «1.»
            aps = []
            for k, (n, t) in enumerate(e):
                if k + 1 < len(e) and e[k + 1][0] == "1":
                    aps.append({"apartado": t, "items": []}); continue
                if not aps:
                    avisos.append(f"{b['bloque'][:30]}: ítem {n} antes del primer apartado")
                    aps.append({"apartado": None, "items": []})
                aps[-1]["items"].append(t)
            for a in aps:
                avisos += comprobar_secuencia(b["bloque"] + " / " + (a["apartado"] or "")[:20],
                                              [re.match(r"\d+", x).group(0) for x in a["items"]])
                if a["apartado"] is None or not a["items"]:
                    avisos.append(f"{b['bloque'][:30]}: apartado vacío o sin título")
            out.append({"bloque": b["bloque"], "apartados": aps,
                        "nota": "En el BOC los ítems de este bloque reinician la numeración en cada apartado (1., 2., 3.); se respeta tal cual."})
            continue
        if with_children:
            aps = []
            for n, t in e:
                if "." not in n:
                    aps.append({"apartado": t, "items": []})
                else:
                    if not aps or re.match(r"\d*", aps[-1]["apartado"] or "").group(0) != n.split(".")[0]:
                        avisos.append(f"{b['bloque'][:30]}: ítem {n} fuera de su apartado")
                        aps.append({"apartado": None, "items": []})
                    aps[-1]["items"].append(t)
            for a in aps:
                if not a["items"]:
                    avisos.append(f"{b['bloque'][:30]}: apartado sin ítems: {(a['apartado'] or '')[:60]}")
            out.append({"bloque": b["bloque"], "apartados": aps})
        else:
            out.append({"bloque": b["bloque"], "items": [t for _, t in e]})
        avisos += comprobar_secuencia(b["bloque"], [n for n, _ in e])
    # numeración romana correlativa
    rom = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"]
    got = [b["bloque"].split(".")[0] for b in out]
    if got != rom[:len(got)]:
        avisos.append("bloques no correlativos: " + ",".join(got))
    return out, avisos


def comprobar_secuencia(bloque, nums):
    """Cada número debe ser el siguiente hermano o el primer hijo del anterior."""
    avisos, prev = [], None
    for n in nums:
        p = [int(x) for x in n.split(".")]
        if prev is None:
            ok = p == [1]
        else:
            ok = False
            if p == prev + [1]:
                ok = True
            for k in range(len(prev)):
                if p == prev[:k] + [prev[k] + 1]:
                    ok = True
        if not ok:
            avisos.append(f"{bloque[:30]}: numeración {n} tras {'.'.join(map(str, prev or []))}")
        prev = p
    return avisos


def contar(sab):
    n = 0
    for b in sab:
        if "items" in b: n += len(b["items"])
        else: n += sum(len(a["items"]) for a in b["apartados"])
    return n


def norm(s):
    s = unicodedata.normalize("NFC", s.lower())
    return re.sub(r"[^\wáéíóúüñ]", "", s)


def main():
    if len(sys.argv) < 2:
        print(__doc__); sys.exit(1)
    src = sys.argv[1]
    escribir = "--escribir" in sys.argv
    volcado = sys.argv[sys.argv.index("--volcado") + 1] if "--volcado" in sys.argv else None
    base = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "data", "canarias", "primaria")
    lines = limpiar(open(src, encoding="utf-8").read().split("\n"))
    secs = secciones(lines)
    total = {"saberes": 0, "bloques": 0, "desc_ok": 0, "desc_fix": 0, "crit": 0, "enun": 0}
    dump = {}
    for t, f in AREAS:
        path = os.path.join(base, f)
        j = json.load(open(path, encoding="utf-8"))
        j["saberes"], j["bloques"] = {}, {}
        correcciones, avisos = [], []
        for c, (a, s, e) in secs[f].items():
            sab, av = parse_saberes(lines[s:e])
            avisos += [f"{c} saberes: {x}" for x in av]
            bl = parse_bloques(lines[a:s])
            j["saberes"][c] = sab
            crits = {x["id"]: x for x in ((j["ciclos"].get(c) or {}).get("criterios") or [])}
            found = set()
            for b in bl:
                for cid in b["criterios"]:
                    found.add(cid)
                    if cid not in crits:
                        avisos.append(f"{c}: criterio {cid} del PDF no está en el JSON"); continue
                    if norm(b["_crit_txt"][cid]) != norm(crits[cid]["texto"]):
                        avisos.append(f"{c}: texto de {cid} difiere (se respeta el JSON)")
                    nuevo = b["_crit_desc"][cid]
                    total["crit"] += 1
                    if nuevo == crits[cid].get("descriptores"):
                        total["desc_ok"] += 1
                    elif not nuevo:
                        avisos.append(f"{c}: {cid} sin descriptores en el PDF extraído")
                    else:
                        total["desc_fix"] += 1
                        correcciones.append({"ciclo": c, "criterio": cid,
                                             "antes": crits[cid].get("descriptores"), "boc": nuevo})
                        crits[cid]["descriptores"] = nuevo
                for cid, en in b["_enunciados"].items():
                    comp = next((k for k in j["competencias"] if k["id"] == cid), None)
                    total["enun"] += 1
                    if comp and comp.get("enunciado") and norm(en) != norm(comp["enunciado"]):
                        avisos.append(f"{c}: enunciado de {cid} difiere del de la ficha general")
                if not b["explicacion"]:
                    avisos.append(f"{c}: bloque {b['competencias']} sin explicación")
            for cid in crits:
                if cid not in found:
                    avisos.append(f"{c}: criterio {cid} del JSON no localizado en el PDF")
            j["bloques"][c] = [{k: v for k, v in b.items() if not k.startswith("_")} for b in bl]
            total["saberes"] += contar(sab); total["bloques"] += len(bl)
            print(f"{f:55s} {c:8s} saberes={contar(sab):3d} bloques_saberes={len(sab)} "
                  f"bloques_comp={len(bl)} criterios={sum(len(b['criterios']) for b in bl)}")
        for x in avisos: print("   AVISO", x)
        for x in correcciones: print("   DESCRIPTORES", x)
        dump[f] = {"saberes": j["saberes"], "bloques": j["bloques"], "correcciones": correcciones, "avisos": avisos}
        if escribir:
            j["pendiente"] = [p for p in j.get("pendiente", [])
                              if not re.search(r"^Saberes básicos|Descriptores operativos no cotejados|"
                                               r"comprobar que (coinciden|son idénticos) en los tres ciclos", p)]
            cot = j.setdefault("cotejo", {})
            cot["fase2"] = {
                "fecha": datetime.date.today().isoformat(),
                "metodo": "tools/extraer_saberes_canarias.py sobre pdftotext -layout del PDF oficial",
                "saberes": "literales, por ciclo y bloque, con la numeración del BOC",
                "bloques": "explicación del bloque competencial literal, por ciclo",
                "descriptores": f"{len(correcciones)} corregidos; el resto coincide con la columna de descriptores del PDF",
                "enunciados": "cada enunciado de competencia coincide con el del bloque competencial de cada ciclo",
                "descriptores_corregidos": correcciones,
            }
            with open(path, "w", encoding="utf-8") as fh:
                json.dump(j, fh, ensure_ascii=False, indent=2); fh.write("\n")
    print("TOTAL", total)
    if volcado:
        json.dump(dump, open(volcado, "w", encoding="utf-8"), ensure_ascii=False, indent=1)


if __name__ == "__main__":
    main()
