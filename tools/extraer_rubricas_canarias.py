#!/usr/bin/env python3
"""Extrae literalmente las rúbricas oficiales de Educación Primaria de Canarias.

Fuente: Resolución de 15 de mayo de 2025 (BOC n.º 107, 02/06/2025, anuncio 2005),
anexo 1 (páginas 6-361 del PDF). Las tablas están giradas 90º en página A4; el
script gira las coordenadas de cada carácter, reconstruye la rejilla de la tabla a
partir de los filetes (líneas) del PDF y asigna cada carácter a su celda, de modo
que las columnas de nivel (INSUFICIENTE, SUFICIENTE/BIEN, NOTABLE, SOBRESALIENTE)
nunca se mezclan. Las celdas que continúan en la página siguiente se concatenan.

Uso:
  python3 -I tools/extraer_rubricas_canarias.py PDF [--repo DIR] [--txt PLANO.txt]

  --txt: texto plano del PDF (pdftotext sin -layout). Si no se da, se genera con
         pdftotext en un directorio temporal. Se usa para el cotejo.

Genera data/canarias/primaria/rubricas/<slug>.json y un informe JSON del cotejo en
data/canarias/primaria/rubricas/_cotejo.json. Requiere pdfplumber y pdftotext.
No completa ni corrige texto: lo que no se puede leer se informa como discrepancia.
"""
import argparse, json, os, re, subprocess, sys, tempfile, unicodedata
from collections import defaultdict

import pdfplumber

FUENTE = "Resolución de 15/05/2025 (BOC 107, 02/06/2025)"
PRIMERA, ULTIMA = 6, 361  # páginas (1-based) del anexo 1 con tablas de Primaria

AREAS = {  # título en la cabecera "RÚBRICA – <título> – <CICLO> CICLO DE EDUCACIÓN PRIMARIA" -> slug
    "CONOCIMIENTO DEL MEDIO NATURAL, SOCIAL Y CULTURAL": "conocimiento-del-medio-natural-social-y-cultural",
    "EDUCACIÓN ARTÍSTICA": "educacion-artistica",
    "EDUCACIÓN EMOCIONAL Y PARA LA CREATIVIDAD": "educacion-emocional-y-para-la-creatividad",
    "EDUCACIÓN EN VALORES CÍVICOS Y ÉTICOS": "educacion-en-valores-civicos-y-eticos",
    "EDUCACIÓN FÍSICA": "educacion-fisica",
    "LENGUA CASTELLANA Y LITERATURA": "lengua-castellana-y-literatura",
    "LENGUA EXTRANJERA (INGLÉS)": "lengua-extranjera",
    "MATEMÁTICAS": "matematicas",
    "SEGUNDA LENGUA EXTRANJERA": "segunda-lengua-extranjera",
}
CICLOS = {"PRIMER": "primer", "SEGUNDO": "segundo", "TERCER": "tercer"}
TITULO_RE = re.compile(r"RÚBRICA\s*–\s*(.+?)\s*–\s*(PRIMER|SEGUNDO|TERCER) CICLO DE EDUCACIÓN PRIMARIA")
CRIT_RE = re.compile(r"^(\d+\.\d+)\s+(.*)$", re.S)
COMP_RE = re.compile(r"^(\d+)\.\s+(.*)$", re.S)


# ---------------------------------------------------------------- geometría
def celdas_pagina(page):
    """Devuelve (filas, fuera). filas: lista ordenada de filas; cada fila es una
    lista de celdas (texto) de izquierda a derecha en la vista girada.
    fuera: líneas de texto fuera de la rejilla (títulos, números de página)."""
    H = page.height
    # vista girada: X = H - y (sentido de lectura), Y = x (avance de línea)
    chars = []
    vistos = set()
    for c in page.chars:
        if c["upright"]:
            continue  # cabecera/pie del BOC, en horizontal
        X0, X1, Y0, Y1 = H - c["bottom"], H - c["top"], c["x0"], c["x1"]
        clave = (c["text"], round(X0, 1), round(Y0, 1))
        if clave in vistos:  # sobreimpresión
            continue
        vistos.add(clave)
        chars.append(dict(t=c["text"], X0=X0, X1=X1, Y=(Y0 + Y1) / 2, size=c["size"]))
    # filetes horizontales (en la vista girada) y bordes de los rectángulos de cabecera
    hl = [l for l in page.lines if abs(l["x0"] - l["x1"]) < 1 and abs(l["top"] - l["bottom"]) > 100]
    hs = {round(l["x0"], 1) for l in hl}
    for r in page.rects:
        hs.update({round(r["x0"], 1), round(r["x1"], 1)})
    hs = sorted(hs)
    if hl or page.rects:
        xmin = min([H - l["bottom"] for l in hl] + [H - r["bottom"] for r in page.rects]) - 2
        xmax = max([H - l["top"] for l in hl] + [H - r["top"] for r in page.rects]) + 2
    else:
        xmin = xmax = 0
    vs = [(H - l["bottom"], l["x0"], l["x1"]) for l in page.lines
          if abs(l["top"] - l["bottom"]) < 1 and abs(l["x1"] - l["x0"]) > 3]
    for r in page.rects:
        vs += [(H - r["bottom"], r["x0"], r["x1"]), (H - r["top"], r["x0"], r["x1"])]
    vs = [v for v in vs if xmin <= v[0] <= xmax]  # descarta filetes de la cabecera del BOC
    # fusionar separadores muy próximos (doble filete)
    hsep = []
    for y in hs:
        if not hsep or y - hsep[-1] > 2:
            hsep.append(y)
    bandas = list(zip(hsep, hsep[1:]))
    contenido = defaultdict(list)  # (banda, col) -> chars
    fuera = []
    cols_banda = {}
    for b, (ya, yb) in enumerate(bandas):
        ym = (ya + yb) / 2
        xs = []
        for x in sorted(x for x, y0, y1 in vs if y0 - 1 <= ym <= y1 + 1):
            if not xs or x - xs[-1] > 2:
                xs.append(x)
        cols_banda[b] = list(zip(xs, xs[1:]))
    for ch in chars:
        b = next((i for i, (ya, yb) in enumerate(bandas) if ya <= ch["Y"] <= yb), None)
        if b is None:
            fuera.append(ch); continue
        xm = (ch["X0"] + ch["X1"]) / 2
        col = next((i for i, (xa, xb) in enumerate(cols_banda[b]) if xa <= xm <= xb), None)
        if col is None:
            fuera.append(ch); continue
        contenido[(b, col)].append(ch)
    filas = []
    for b in range(len(bandas)):
        ncols = len(cols_banda[b])
        celdas = [texto_de(contenido.get((b, i), [])) for i in range(ncols)]
        if any(celdas):
            filas.append(celdas)
    return filas, lineas_de(fuera)


def _lineas(chars):
    grupos = defaultdict(list)
    for c in chars:
        grupos[round(c["Y"])].append(c)
    # agrupar líneas cuyo centro difiera <3 pt
    ys = sorted(grupos)
    merged = []
    for y in ys:
        if merged and y - merged[-1][0] < 3:
            merged[-1][1].extend(grupos[y])
        else:
            merged.append([y, list(grupos[y])])
    out = []
    for y, cs in merged:
        # Los espacios se deducen de la geometría y no de los caracteres de espacio del PDF
        # (están mal posicionados en algunas líneas justificadas). Entre glifos de una misma
        # palabra el hueco es < 0,4 pt; entre palabras, > 2 pt (histograma de todo el anexo).
        cs = sorted((c for c in cs if not c["t"].isspace()), key=lambda c: c["X0"])
        s, prev = "", None
        for c in cs:
            if prev is not None and c["X0"] - prev > 1.0:
                s += " "
            s += c["t"]
            prev = c["X1"]
        out.append(re.sub(r"\s+", " ", s).strip())
    return [l for l in out if l]


def lineas_de(chars):
    return _lineas(chars)


GUIONES = []  # registro de cortes de palabra con guion al final de línea


def unir(lineas):
    s = ""
    for l in lineas:
        if not s:
            s = l
        elif re.search(r"\w-$", s) and l[:1].islower():
            # El PDF no parte palabras con guion: un guion a final de línea es de
            # palabra compuesta (p. ej. "afectivo-sexual"); se conserva y se une sin espacio.
            GUIONES.append(s.split()[-1] + l.split()[0])
            s = s + l
        else:
            s += " " + l
    return s


LINEAS = {}  # texto de celda -> líneas tal como aparecen en el PDF (para el cotejo)


def texto_de(chars):
    if not chars:
        return ""
    ls = _lineas(chars)
    t = unir(ls)
    LINEAS.setdefault(t, ls)
    return t


# ---------------------------------------------------------------- estructura
def es_cabecera_niveles(fila):
    return len(fila) >= 3 and all(c.isupper() for c in fila if c) and "INSUFICIENTE" in fila[0]


def extraer(pdf_path):
    pdf = pdfplumber.open(pdf_path)
    rubricas = {}  # slug -> dict
    avisos = []
    cur = None  # (slug, ciclo)
    estado = None  # 'comp', 'crit', 'niv'
    crit = None
    ultima_fila_niv = None  # lista de celdas abiertas
    competencia = None
    for pn in range(PRIMERA, ULTIMA + 1):
        page = pdf.pages[pn - 1]
        filas, fuera = celdas_pagina(page)
        # tokens de la página tal como los ha leído el extractor (para el cotejo)
        horiz = page.filter(lambda o: o.get("object_type") != "char" or o.get("upright"))
        TOKENS_PAGINA[pn] = tokens(" ".join([" ".join(c for f in filas for c in f), " ".join(fuera),
                                             horiz.extract_text() or ""]))
        nueva_pagina = True
        for l in fuera:
            m = TITULO_RE.search(l)
            if m:
                area_t, ciclo_t = m.group(1).strip(), m.group(2)
                if area_t not in AREAS:
                    avisos.append(f"p.{pn}: área no reconocida {area_t!r}")
                    continue
                cur = (AREAS[area_t], CICLOS[ciclo_t])
                r = rubricas.setdefault(cur[0], {"titulo": area_t, "niveles": None, "ciclos": {}})
                r["ciclos"].setdefault(cur[1], [])
            elif not re.fullmatch(r"\d+", l):
                avisos.append(f"p.{pn}: texto fuera de tabla ignorado: {l[:80]!r}")
        for fila in filas:
            n = len(fila)
            if n == 2 and fila[0] == "COMPETENCIA ESPECÍFICA":
                estado = "comp"; competencia = None; ultima_fila_niv = None; continue
            if n == 2 and fila[0] == "CRITERIO DE EVALUACIÓN":
                estado = "crit"; crit = None; ultima_fila_niv = None; continue
            if es_cabecera_niveles(fila):
                niveles = fila
                r = rubricas[cur[0]]
                if r["niveles"] is None:
                    r["niveles"] = niveles
                elif r["niveles"] != niveles:
                    avisos.append(f"p.{pn}: niveles distintos {niveles}")
                if crit is None:
                    avisos.append(f"p.{pn}: cabecera de niveles sin criterio"); continue
                crit["_niveles"] = niveles
                estado = "niv"; ultima_fila_niv = None; continue
            if estado == "comp" and n == 2:
                if competencia is None:
                    m = COMP_RE.match(fila[0])
                    competencia = {"id": m.group(1) if m else None, "texto": fila[0], "descriptores": fila[1]}
                else:
                    competencia["texto"] += " " + fila[0]; competencia["descriptores"] += " " + fila[1]
                continue
            if estado == "crit" and n == 2:
                if crit is None:
                    m = CRIT_RE.match(fila[0])
                    if not m:
                        avisos.append(f"p.{pn}: criterio sin número: {fila[0][:60]!r}")
                        crit = {"criterio": None, "texto": fila[0], "dop": fila[1]}
                    else:
                        crit = {"criterio": m.group(1), "texto": m.group(2), "dop": fila[1]}
                    crit["_comp"] = competencia
                    crit["_pag"] = pn
                    crit["_filas"] = []
                    rubricas[cur[0]]["ciclos"][cur[1]].append(crit)
                else:  # continúa en la página siguiente
                    crit["texto"] += " " + fila[0]; crit["dop"] = (crit["dop"] + " " + fila[1]).strip()
                continue
            if estado == "niv" and n == len(crit["_niveles"]):
                if nueva_pagina and ultima_fila_niv is not None and filas.index(fila) == 0:
                    # continuación de la(s) celda(s) de la página anterior
                    for i, t in enumerate(fila):
                        if t:
                            nuevo = unir([ultima_fila_niv[i], t]) if ultima_fila_niv[i] else t
                            LINEAS[nuevo] = LINEAS.get(ultima_fila_niv[i], []) + LINEAS.get(t, [t])
                            ultima_fila_niv[i] = nuevo
                    crit["_continuaciones"] = crit.get("_continuaciones", 0) + 1
                else:
                    ultima_fila_niv = list(fila)
                    crit["_filas"].append(ultima_fila_niv)
                continue
            avisos.append(f"p.{pn}: fila no interpretada ({n} celdas, estado {estado}): {[c[:40] for c in fila]}")
        nueva_pagina = False
    return rubricas, avisos


TOKENS_PAGINA = {}


def tokens(s):
    return re.findall(r"[^\s\-\u00ad]+", unicodedata.normalize("NFC", s))


def nombre_nivel(c):
    return {"INSUFICIENTE": "Insuficiente", "SUFICIENTE/BIEN": "Suficiente/Bien",
            "NOTABLE": "Notable", "SOBRESALIENTE": "Sobresaliente"}.get(c, c)


# ---------------------------------------------------------------- cotejo
def norm(s):
    s = unicodedata.normalize("NFC", s)
    s = s.replace("­", "")
    s = re.sub(r"-\s*\n\s*", "", s)  # guion de corte
    s = re.sub(r"[\s ]+", "", s)  # sin espacios: robusto a justificación
    s = s.replace("-", "")
    return s


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("pdf")
    ap.add_argument("--repo", default=os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))
    ap.add_argument("--txt")
    a = ap.parse_args()
    repo = os.path.abspath(a.repo)
    rubricas, avisos = extraer(a.pdf)

    if a.txt:
        plano = open(a.txt, encoding="utf-8").read()
        paginas = plano.split("\f")  # página i (1-based) = paginas[i-1]
    else:
        with tempfile.TemporaryDirectory() as d:
            out = os.path.join(d, "plano.txt")
            subprocess.run(["pdftotext", a.pdf, out], check=True)
            plano = open(out, encoding="utf-8").read()
        paginas = plano.split("\f")
    plano = "\f".join(paginas[PRIMERA - 1:ULTIMA])
    plano_n = norm(plano)
    # 1) conservación de palabras por página: lo leído por el extractor frente al texto plano
    from collections import Counter
    conservacion = []
    for pn in range(PRIMERA, ULTIMA + 1):
        a_ = Counter(TOKENS_PAGINA[pn]); b_ = Counter(tokens(paginas[pn - 1]))
        if a_ != b_:
            conservacion.append({"pagina": pn, "solo_extractor": dict(a_ - b_), "solo_texto_plano": dict(b_ - a_)})

    outdir = os.path.join(repo, "data", "canarias", "primaria", "rubricas")
    os.makedirs(outdir, exist_ok=True)
    cotejo = {"fuente": FUENTE, "paginas_pdf": [PRIMERA, ULTIMA], "areas": {}, "avisos": avisos,
              "guiones_de_compuesto_a_final_de_linea": sorted(set(GUIONES)),
              "conservacion_de_palabras_por_pagina": {"paginas": ULTIMA - PRIMERA + 1,
                                                      "paginas_con_diferencias": conservacion}}
    for slug, r in rubricas.items():
        area_json = json.load(open(os.path.join(repo, "data", "canarias", "primaria", slug + ".json"), encoding="utf-8"))
        niveles = [nombre_nivel(n) for n in (r["niveles"] or [])]
        salida = {"area": area_json["area"], "fuente": FUENTE,
                  "titulo_en_fuente": f"RÚBRICA – {r['titulo']}",
                  "niveles": niveles,
                  "equivalencias": {"Insuficiente": "IN", "Suficiente/Bien": "SU/BI", "Notable": "NT", "Sobresaliente": "SB"},
                  "nota": "Texto literal del anexo 1. El descriptor de Suficiente/Bien incluye el texto del criterio; "
                          "los demás niveles lo gradúan (apartado introductorio del anexo 1).",
                  "ciclos": {}}
        rep = {}
        for ciclo in ("primer", "segundo", "tercer"):
            lista = r["ciclos"].get(ciclo)
            esperados = [c["id"] for c in area_json["ciclos"].get(ciclo, {}).get("criterios", [])]
            if lista is None:
                rep[ciclo] = {"rubricas": 0, "esperados": len(esperados),
                              "estado": "sin rúbrica en la fuente" if not esperados else "FALTA"}
                continue
            items, no_encontrados, multi = [], [], []
            for c in lista:
                filas = c["_filas"]
                if len(filas) != 1:
                    multi.append((c["criterio"], len(filas)))
                def dic(f):
                    return {nombre_nivel(n): t for n, t in zip(c["_niveles"], f)}
                it = {"criterio": c["criterio"],
                      "competencia_especifica": c["_comp"]["id"] if c["_comp"] else None,
                      "enunciado_criterio": c["texto"],
                      "descriptores_operativos": [d.strip() for d in re.split(r",\s*", c["dop"].rstrip(".")) if d.strip()],
                      "pagina_pdf": c["_pag"]}
                if len(filas) == 1:
                    it["descriptores"] = dic(filas[0])
                else:
                    it["aspectos"] = [{"descriptores": dic(f)} for f in filas]
                for f in filas:
                    for n, t in zip(c["_niveles"], f):
                        # 2) cada línea de la celda, tal como está en el PDF, debe estar en el texto plano
                        malas = [l for l in LINEAS.get(t, [t]) if norm(l) not in plano_n]
                        if not t or malas or unir(LINEAS.get(t, [t])) != t:
                            no_encontrados.append({"criterio": c["criterio"], "nivel": nombre_nivel(n),
                                                   "inicio": t[:80], "lineas_no_encontradas": malas})
                items.append(it)
            ids = [i["criterio"] for i in items]
            # enunciado del criterio frente al JSON del área
            textos_area = {c["id"]: c["texto"] for c in area_json["ciclos"][ciclo]["criterios"]}
            enun_dif = [i["criterio"] for i in items if i["criterio"] in textos_area
                        and norm(textos_area[i["criterio"]]) != norm(i["enunciado_criterio"])]
            salida["ciclos"][ciclo] = items
            rep[ciclo] = {"rubricas": len(items), "esperados": len(esperados),
                          "ids_coinciden": ids == esperados,
                          "faltan": [e for e in esperados if e not in ids],
                          "sobran": [i for i in ids if i not in esperados],
                          "duplicados": sorted({i for i in ids if ids.count(i) > 1}),
                          "descriptores_cotejados": sum(len(c["_filas"]) * len(c["_niveles"]) for c in lista),
                          "no_encontrados_en_texto_plano": no_encontrados,
                          "criterios_con_varias_filas": multi,
                          "enunciado_distinto_del_json_area": enun_dif}
        with open(os.path.join(outdir, slug + ".json"), "w", encoding="utf-8") as f:
            json.dump(salida, f, ensure_ascii=False, indent=2); f.write("\n")
        cotejo["areas"][slug] = rep
    with open(os.path.join(outdir, "_cotejo.json"), "w", encoding="utf-8") as f:
        json.dump(cotejo, f, ensure_ascii=False, indent=2); f.write("\n")
    # resumen por pantalla
    for slug, rep in cotejo["areas"].items():
        for ciclo, x in rep.items():
            print(f"{slug:50s} {ciclo:8s} {x.get('rubricas')}/{x.get('esperados')} "
                  f"ids_ok={x.get('ids_coinciden')} no_enc={len(x.get('no_encontrados_en_texto_plano', []))} "
                  f"multi={x.get('criterios_con_varias_filas')} enun_dif={x.get('enunciado_distinto_del_json_area')}")
    print("avisos:", len(avisos)); [print(" ", v) for v in avisos[:40]]
    print("guiones de compuesto:", cotejo["guiones_de_compuesto_a_final_de_linea"])
    print("páginas con diferencias de palabras:", len(conservacion))
    for x in conservacion[:10]:
        print(" ", x)


if __name__ == "__main__":
    main()
