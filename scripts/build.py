#!/usr/bin/env python3
"""Build the slmradar site: content/*.md + data/*.yml -> _site/ (static HTML).

Usage: python3 scripts/build.py [--out _site]
Requires: pip install markdown pyyaml
"""
import json
import re
import shutil
import sys
from datetime import date
from html import escape
from pathlib import Path

import markdown
import yaml

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / (sys.argv[sys.argv.index("--out") + 1] if "--out" in sys.argv else "_site")


def front_matter(text):
    m = re.match(r"^---\n(.*?)\n---\n(.*)$", text, re.S)
    return (yaml.safe_load(m.group(1)) or {}, m.group(2)) if m else ({}, text)


def columnize(html):
    """Split article HTML at <h2> into section cards. Charts, card grids and
    wide tables span both columns; other sections flow as columns."""
    parts = re.split(r"(?=<h2[ >])", html)
    out = []
    for i, part in enumerate(parts):
        if not part.strip():
            continue
        if i == 0 and not part.lstrip().startswith("<h2"):
            out.append(f'<div class="block intro span">{part}</div>')
            continue
        heads = re.findall(r"<thead>(.*?)</thead>", part, re.S)
        widest = max((h.count("<th") for h in heads), default=0)
        code = re.findall(r"<pre>(.*?)</pre>", part, re.S)
        long_code = any(len(l) > 75 for c in code for l in c.splitlines())
        wide = long_code or "data-viz" in part or 'class="cards"' in part or widest >= 4 or len(part) > 2600
        out.append(f'<section class="block{" span" if wide else ""}">{part}</section>')
    return '<div class="columns">' + "".join(out) + "</div>"


def load_data():
    data = {}
    for f in sorted((ROOT / "data").glob("*.yml")):
        data[f.stem] = yaml.safe_load(f.read_text())
    return json.loads(json.dumps(data, default=str))  # dates -> str


def main():
    data = load_data()
    template = (ROOT / "templates/page.html").read_text()
    pages = []
    for f in sorted((ROOT / "content").glob("*.md")):
        meta, body = front_matter(f.read_text())
        meta.setdefault("title", f.stem)
        pages.append((meta, body, f.stem))
    pages.sort(key=lambda p: p[0].get("order", 99))

    if OUT.exists():
        shutil.rmtree(OUT)
    OUT.mkdir(parents=True)
    shutil.copytree(ROOT / "assets", OUT / "assets")
    (OUT / ".nojekyll").write_text("")
    data_js = "window.SLM=" + json.dumps(data, ensure_ascii=False) + ";"
    (OUT / "assets/data.js").write_text(data_js)

    for meta, body, slug in pages:
        md = markdown.Markdown(extensions=["tables", "fenced_code", "attr_list", "md_in_html", "toc"],
                               extension_configs={"toc": {"permalink": "#", "toc_depth": "2-3"}})
        html = md.convert(body)
        if meta.get("columns", True):
            html = columnize(html)
        nav = "".join(
            f'<a href="{"index" if s == "index" else s}.html"{" aria-current=page" if s == slug else ""}>'
            f'{escape(m.get("nav", m["title"]))}</a>'
            for m, _, s in pages if not m.get("hidden"))
        toc = md.toc if meta.get("toc", True) and md.toc_tokens else ""
        page = (template
                .replace("{{title}}", escape(meta["title"]))
                .replace("{{sub}}", escape(meta.get("sub", "")))
                .replace("{{hero_class}}", "hero hero-home" if slug == "index" else "hero")
                .replace("{{nav}}", nav)
                .replace("{{toc}}", toc)
                .replace("{{content}}", html)
                .replace("{{built}}", date.today().isoformat()))
        (OUT / f"{slug}.html").write_text(page)
    print(f"built {len(pages)} pages -> {OUT}")


if __name__ == "__main__":
    main()
