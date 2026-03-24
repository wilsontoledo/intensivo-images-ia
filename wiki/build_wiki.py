#!/usr/bin/env python3
"""
Gera HTML estático a partir dos .md em treinamento-modulos/.
Execute a partir desta pasta: python3 build_wiki.py
"""
from __future__ import annotations

import html
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent
PARENT = ROOT.parent
PAGES = ROOT / "pages"
PAGES.mkdir(parents=True, exist_ok=True)

H2_EXACT = {
    "Objetivo",
    "Premissas",
    "Análise",
    "Estrutura de milestones macro",
    "Método de ensino ideal para esse treinamento",
    "Ordem de estudo recomendada",
    "Conclusão",
    "Próximos passos",
}
H3_EXACT = {
    "Milestone",
    "Resultado esperado",
    "Laboratórios",
    "Tópicos",
}
H2_PREFIXES = ("Trilhas paralelas",)


def esc(s: str) -> str:
    return html.escape(s, quote=True)


def extract_card_subtitle(md_path: Path) -> str:
    """Primeira linha útil: título após 'Módulo … —' ou 'FASE … —'."""
    try:
        lines = md_path.read_text(encoding="utf-8").splitlines()
    except OSError:
        return ""
    for line in lines[:12]:
        s = line.strip()
        if s.startswith("Módulo ") and " — " in s:
            return s.split(" — ", 1)[1].strip()
    for line in lines[:12]:
        s = line.strip()
        if s.startswith("FASE ") and " — " in s:
            return s.split(" — ", 1)[1].strip()
    return ""


def md_basename_to_label(stem: str, md_path: Path | None = None) -> tuple[str, str]:
    """Retorna (rótulo curto, subtítulo opcional)."""
    if stem == "01-inicio":
        return "Início", "Objetivo, premissas e mapa do treinamento"
    if stem == "41-encerramento-e-complementos":
        return "Encerramento", "Trilhas, marcos, método e próximos passos"
    m = re.match(r"^(\d+)-modulo-(\d+)-(\d+)$", stem)
    if m:
        b, c = m.group(2), m.group(3)
        sub = extract_card_subtitle(md_path) if md_path else ""
        return f"Módulo {b}.{c}", sub
    return stem.replace("-", " ").title(), ""


def collect_md_files() -> list[Path]:
    files = sorted(PARENT.glob("*.md"), key=lambda p: p.name)
    return [p for p in files if p.name != "README.md"]


def line_kind(line: str) -> str:
    s = line.rstrip("\n")
    if s.strip() == "":
        return "blank"
    if s.strip() == "⸻":
        return "hr"
    if re.match(r"^\t*•", s) or re.match(r"^ {4}•", s):
        return "ul"
    if re.match(r"^\t*\d+\.\s", s) or re.match(r"^ {4}\d+\.\s", s):
        return "ol"
    return "text"


def bullet_text(line: str) -> str:
    s = line.strip()
    if s.startswith("•"):
        return s[1:].strip()
    return s


def ol_text(line: str) -> str:
    return re.sub(r"^\s*\d+\.\s*", "", line.strip())


def md_to_html_body(raw: str) -> str:
    lines = raw.splitlines()
    out: list[str] = []
    i = 0
    in_ul = False
    in_ol = False

    def close_lists() -> None:
        nonlocal in_ul, in_ol
        if in_ul:
            out.append("</ul>")
            in_ul = False
        if in_ol:
            out.append("</ol>")
            in_ol = False

    while i < len(lines):
        line = lines[i]
        kind = line_kind(line)

        if kind == "blank":
            close_lists()
            i += 1
            continue

        if kind == "hr":
            close_lists()
            out.append('<hr class="wiki-sep" aria-hidden="true">')
            i += 1
            continue

        if kind == "ul":
            if in_ol:
                out.append("</ol>")
                in_ol = False
            if not in_ul:
                out.append("<ul>")
                in_ul = True
            out.append(f"<li>{esc(bullet_text(line))}</li>")
            i += 1
            continue

        if kind == "ol":
            if in_ul:
                out.append("</ul>")
                in_ul = False
            if not in_ol:
                out.append("<ol>")
                in_ol = True
            out.append(f"<li>{esc(ol_text(line))}</li>")
            i += 1
            continue

        close_lists()
        stripped = line.strip()

        if stripped.startswith("FASE ") or stripped.startswith("Módulo "):
            out.append(f"<h2>{esc(stripped)}</h2>")
            i += 1
            continue

        if stripped.startswith("Trilha ") and "—" in stripped:
            out.append(f"<h3>{esc(stripped)}</h3>")
            i += 1
            continue

        if re.match(r"^Marco \d+ —", stripped):
            out.append(f"<h3>{esc(stripped)}</h3>")
            i += 1
            continue

        if stripped in H2_EXACT or any(stripped.startswith(p) for p in H2_PREFIXES):
            out.append(f"<h2>{esc(stripped)}</h2>")
            i += 1
            continue

        if stripped in H3_EXACT:
            out.append(f"<h3>{esc(stripped)}</h3>")
            i += 1
            continue

        if stripped.startswith("[") and stripped.endswith("]"):
            out.append(f'<p class="wiki-lead">{esc(stripped)}</p>')
            i += 1
            continue

        if stripped == "Sumário-mestre do treinamento imersivo":
            out.append(f"<h3>{esc(stripped)}</h3>")
            i += 1
            continue

        para_lines = [stripped]
        i += 1
        while i < len(lines):
            nk = line_kind(lines[i])
            if nk in ("blank", "hr", "ul", "ol"):
                break
            nstrip = lines[i].strip()
            if nstrip.startswith("FASE ") or nstrip.startswith("Módulo "):
                break
            if nstrip in H2_EXACT or nstrip in H3_EXACT:
                break
            if nstrip.startswith("Trilha ") and "—" in nstrip:
                break
            if re.match(r"^Marco \d+ —", nstrip):
                break
            if any(nstrip.startswith(p) for p in H2_PREFIXES):
                break
            para_lines.append(nstrip)
            i += 1

        text = " ".join(para_lines)
        if text:
            out.append(f"<p>{esc(text)}</p>")

    close_lists()
    return "\n".join(out)


PAGE_TEMPLATE = """<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>{title} · Wiki Treinamento IA</title>
  <link rel="stylesheet" href="../styles.css">
</head>
<body class="wiki-body">
  <a class="skip-link" href="#conteudo">Ir para o conteúdo</a>
  <header class="wiki-top">
    <div class="wiki-top-inner">
      <a class="btn-back" href="../index.html">← Voltar ao sumário</a>
      <span class="wiki-top-meta">{meta}</span>
    </div>
  </header>
  <main id="conteudo" class="wiki-main">
    <article class="wiki-article">
      <h1 class="wiki-title">{h1}</h1>
      {body}
    </article>
    <nav class="wiki-footer-nav" aria-label="Navegação entre páginas">
      {prev_link}
      <a class="fn-mid" href="../index.html">Sumário</a>
      {next_link}
    </nav>
  </main>
</body>
</html>
"""


def build_pages(files: list[Path]) -> list[dict]:
    entries: list[dict] = []
    for idx, md_path in enumerate(files):
        stem = md_path.stem
        label, sub = md_basename_to_label(stem, md_path)
        slug = f"{stem}.html"
        raw = md_path.read_text(encoding="utf-8")
        body = md_to_html_body(raw)
        h1 = label
        meta = sub or f"Página {idx + 1} de {len(files)}"
        title = label

        prev_link = ""
        next_link = ""
        if idx > 0:
            p = files[idx - 1].stem + ".html"
            prev_link = f'<a class="fn-prev" href="{p}">← Anterior</a>'
        else:
            prev_link = '<span class="fn-prev fn-disabled">← Anterior</span>'
        if idx < len(files) - 1:
            n = files[idx + 1].stem + ".html"
            next_link = f'<a class="fn-next" href="{n}">Próxima →</a>'
        else:
            next_link = '<span class="fn-next fn-disabled">Próxima →</span>'

        html_page = PAGE_TEMPLATE.format(
            title=esc(title),
            meta=esc(meta),
            h1=esc(h1),
            body=body,
            prev_link=prev_link,
            next_link=next_link,
        )
        (PAGES / slug).write_text(html_page, encoding="utf-8")
        entries.append(
            {
                "href": f"pages/{slug}",
                "label": label,
                "sub": sub,
                "stem": stem,
                "order": idx + 1,
            }
        )
    return entries


INDEX_TEMPLATE = """<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="description" content="Wiki HTML do treinamento de geração de imagens e vídeo com IA — sumário navegável.">
  <title>Wiki · Treinamento IA (imagens &amp; vídeo)</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body class="wiki-body wiki-index">
  <div class="index-hero">
    <p class="index-kicker">Material de estudo · exportável</p>
    <h1 class="index-title">Treinamento IA</h1>
    <p class="index-sub">Geração de imagens, pipelines e ponte para vídeo — progressão por módulos. Abra <code>index.html</code> no navegador; toda a wiki funciona offline nesta pasta.</p>
    <p class="index-cta"><a class="btn-primary" href="pages/01-inicio.html">Começar pelo início →</a></p>
  </div>

  <section class="index-section" aria-labelledby="sumario-heading">
    <h2 id="sumario-heading" class="index-section-title">Sumário</h2>
    <p class="index-section-lead">{count} páginas — clique para abrir dentro da wiki.</p>
    <ul class="module-grid">
{items}
    </ul>
  </section>

  <footer class="index-footer">
    <p>Gerado a partir dos arquivos Markdown em <code>treinamento-modulos/</code>. Copie apenas a pasta <code>wiki</code> para usar em outro lugar.</p>
  </footer>
</body>
</html>
"""


def build_index(entries: list[dict]) -> None:
    lines = []
    for e in entries:
        sub = f'<span class="card-sub">{esc(e["sub"])}</span>' if e.get("sub") else ""
        lines.append(
            f'      <li><a class="module-card" href="{esc(e["href"])}">'
            f'<span class="card-num">{e["order"]:02d}</span>'
            f'<span class="card-body"><span class="card-label">{esc(e["label"])}</span>{sub}</span>'
            f"</a></li>"
        )
    html_out = INDEX_TEMPLATE.format(
        count=len(entries),
        items="\n".join(lines),
    )
    (ROOT / "index.html").write_text(html_out, encoding="utf-8")


CSS = r"""/* Wiki Treinamento IA — portável, sem dependências externas */
:root {
  --bg: #0f1419;
  --bg-elevated: #1a222d;
  --surface: #232d3b;
  --border: rgba(255, 255, 255, 0.08);
  --text: #e8edf4;
  --muted: #9aa8b8;
  --accent: #5eb8ff;
  --accent-soft: rgba(94, 184, 255, 0.15);
  --accent2: #c4a5ff;
  --radius: 12px;
  --font: "Segoe UI", system-ui, -apple-system, sans-serif;
  --serif: "Georgia", "Iowan Old Style", "Times New Roman", serif;
}

*, *::before, *::after { box-sizing: border-box; }

html { scroll-behavior: smooth; }

body.wiki-body {
  margin: 0;
  min-height: 100vh;
  font-family: var(--font);
  font-size: 1.05rem;
  line-height: 1.65;
  color: var(--text);
  background: var(--bg);
  background-image:
    radial-gradient(ellipse 120% 80% at 50% -30%, rgba(94, 184, 255, 0.12), transparent),
    radial-gradient(ellipse 80% 50% at 100% 0%, rgba(196, 165, 255, 0.08), transparent);
}

.skip-link {
  position: absolute;
  left: -9999px;
  top: 0;
  background: var(--accent);
  color: var(--bg);
  padding: 0.5rem 1rem;
  z-index: 100;
}
.skip-link:focus { left: 1rem; top: 1rem; }

/* ——— Index ——— */
.wiki-index {
  padding: 0 1.25rem 3rem;
  max-width: 900px;
  margin: 0 auto;
}

.index-hero {
  padding: 3rem 0 2.5rem;
  border-bottom: 1px solid var(--border);
  margin-bottom: 2rem;
}

.index-kicker {
  margin: 0 0 0.5rem;
  font-size: 0.8rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--accent);
}

.index-title {
  margin: 0;
  font-family: var(--serif);
  font-size: clamp(2rem, 5vw, 2.75rem);
  font-weight: 600;
  letter-spacing: -0.02em;
}

.index-sub {
  margin: 1rem 0 0;
  max-width: 52ch;
  color: var(--muted);
  font-size: 1.05rem;
}

.index-sub code {
  font-size: 0.9em;
  padding: 0.15em 0.4em;
  border-radius: 6px;
  background: var(--surface);
  color: var(--accent2);
}

.index-cta { margin: 1.75rem 0 0; }

.btn-primary {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.65rem 1.25rem;
  border-radius: var(--radius);
  background: linear-gradient(135deg, var(--accent), #7ec8ff);
  color: #0a0e12;
  font-weight: 600;
  text-decoration: none;
  box-shadow: 0 4px 20px rgba(94, 184, 255, 0.35);
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}
.btn-primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 28px rgba(94, 184, 255, 0.45);
}

.index-section-title {
  margin: 0 0 0.35rem;
  font-size: 1.25rem;
}

.index-section-lead {
  margin: 0 0 1.25rem;
  color: var(--muted);
  font-size: 0.95rem;
}

.module-grid {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.module-card {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1rem 1.15rem;
  border-radius: var(--radius);
  background: var(--bg-elevated);
  border: 1px solid var(--border);
  text-decoration: none;
  color: inherit;
  transition: border-color 0.15s ease, background 0.15s ease, transform 0.15s ease;
}
.module-card:hover {
  border-color: rgba(94, 184, 255, 0.35);
  background: var(--surface);
  transform: translateX(4px);
}

.card-num {
  flex-shrink: 0;
  width: 2.5rem;
  height: 2.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--accent);
  background: var(--accent-soft);
}

.card-body {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  min-width: 0;
}

.card-label {
  font-weight: 600;
}

.card-sub {
  font-size: 0.88rem;
  color: var(--muted);
}

.index-footer {
  margin-top: 3rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--border);
  font-size: 0.85rem;
  color: var(--muted);
}
.index-footer code {
  font-size: 0.9em;
  background: var(--surface);
  padding: 0.1em 0.35em;
  border-radius: 4px;
}

/* ——— Article pages ——— */
.wiki-top {
  position: sticky;
  top: 0;
  z-index: 50;
  background: rgba(15, 20, 25, 0.85);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid var(--border);
}

.wiki-top-inner {
  max-width: 720px;
  margin: 0 auto;
  padding: 0.75rem 1.25rem;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.75rem 1rem;
}

.btn-back {
  display: inline-flex;
  align-items: center;
  padding: 0.45rem 0.85rem;
  border-radius: 8px;
  background: var(--surface);
  border: 1px solid var(--border);
  color: var(--text);
  text-decoration: none;
  font-size: 0.9rem;
  font-weight: 500;
  transition: border-color 0.15s, color 0.15s;
}
.btn-back:hover {
  border-color: var(--accent);
  color: var(--accent);
}

.wiki-top-meta {
  font-size: 0.8rem;
  color: var(--muted);
}

.wiki-main {
  max-width: 720px;
  margin: 0 auto;
  padding: 2rem 1.25rem 3rem;
}

.wiki-article {
  padding-bottom: 2rem;
}

.wiki-title {
  margin: 0 0 1.5rem;
  font-family: var(--serif);
  font-size: clamp(1.6rem, 4vw, 2rem);
  font-weight: 600;
  letter-spacing: -0.02em;
  line-height: 1.25;
}

.wiki-article h2 {
  margin: 2rem 0 0.75rem;
  font-size: 1.2rem;
  font-weight: 600;
  color: var(--accent2);
}

.wiki-article h3 {
  margin: 1.5rem 0 0.5rem;
  font-size: 1.05rem;
  font-weight: 600;
  color: var(--text);
}

.wiki-article p {
  margin: 0 0 1rem;
  color: var(--text);
}

.wiki-lead {
  font-size: 0.95rem;
  color: var(--muted);
  border-left: 3px solid var(--accent);
  padding-left: 1rem;
  margin-bottom: 1.5rem !important;
}

.wiki-article ul,
.wiki-article ol {
  margin: 0 0 1.25rem;
  padding-left: 1.35rem;
  color: var(--text);
}

.wiki-article li {
  margin-bottom: 0.35rem;
}

.wiki-article li::marker {
  color: var(--accent);
}

.wiki-sep {
  border: none;
  height: 1px;
  margin: 2rem 0;
  background: linear-gradient(90deg, transparent, var(--border), transparent);
}

.wiki-footer-nav {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  gap: 1rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--border);
  font-size: 0.9rem;
}

.wiki-footer-nav a {
  color: var(--accent);
  text-decoration: none;
}
.wiki-footer-nav a:hover { text-decoration: underline; }

.fn-prev { justify-self: start; }
.fn-mid { justify-self: center; font-weight: 600; color: var(--muted) !important; }
.fn-next { justify-self: end; }

.fn-disabled {
  color: var(--muted);
  opacity: 0.45;
  user-select: none;
}
"""


def main() -> None:
    files = collect_md_files()
    if not files:
        raise SystemExit("Nenhum .md encontrado em treinamento-modulos/")
    (ROOT / "styles.css").write_text(CSS, encoding="utf-8")
    entries = build_pages(files)
    build_index(entries)
    print(f"OK: {len(entries)} páginas em {PAGES.relative_to(ROOT)} + index.html")


if __name__ == "__main__":
    main()
