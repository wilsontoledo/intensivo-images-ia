#!/usr/bin/env python3
from __future__ import annotations

import html
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
LEGACY_PAGES_DIR = ROOT / "wiki" / "pages"
OUTPUT_DIR = ROOT / "content" / "wiki"


def extract_match(pattern: str, content: str, label: str) -> str:
    match = re.search(pattern, content, re.DOTALL)
    if not match:
        raise ValueError(f"Nao foi possivel extrair {label}")
    return match.group(1).strip()


def slug_from_stem(stem: str) -> str:
    parts = stem.split("-", 1)
    return parts[1] if len(parts) == 2 else stem


def category_from_title(title: str) -> str:
    if title == "Início":
        return "Visão geral"
    if title == "Encerramento":
        return "Encerramento"

    match = re.match(r"^Módulo (\d+)\.(\d+)$", title)
    if match:
        return f"Módulo {match.group(1)}"

    return "Wiki"


def clean_inline(text: str) -> str:
    text = re.sub(r"<code>(.*?)</code>", lambda m: f"`{html.unescape(m.group(1).strip())}`", text, flags=re.DOTALL)
    text = re.sub(r"<[^>]+>", "", text)
    text = html.unescape(text)
    text = re.sub(r"\s+", " ", text)
    return text.strip()


def html_list_to_markdown(block: str, ordered: bool) -> str:
    items = re.findall(r"<li>(.*?)</li>", block, re.DOTALL)
    lines: list[str] = []
    for index, item in enumerate(items, start=1):
        marker = f"{index}." if ordered else "-"
        lines.append(f"{marker} {clean_inline(item)}")
    return "\n".join(lines)


def convert_article_html(article_html: str) -> tuple[str | None, str]:
    body_html = re.sub(r'<h1 class="wiki-title">.*?</h1>', "", article_html, count=1, flags=re.DOTALL).strip()

    lead_match = re.search(r'<p class="wiki-lead">(.*?)</p>', body_html, re.DOTALL)
    lead = clean_inline(lead_match.group(1)) if lead_match else None
    if lead_match:
        body_html = body_html.replace(lead_match.group(0), "", 1).strip()

    token_pattern = re.compile(
        r"(<hr[^>]*?>|<h2>.*?</h2>|<h3>.*?</h3>|<p>.*?</p>|<ul>.*?</ul>|<ol>.*?</ol>)",
        re.DOTALL,
    )

    pieces: list[str] = []
    for token in token_pattern.findall(body_html):
        if token.startswith("<hr"):
            pieces.append("---")
            continue

        if token.startswith("<h2>"):
            pieces.append(f"## {clean_inline(token)}")
            continue

        if token.startswith("<h3>"):
            pieces.append(f"### {clean_inline(token)}")
            continue

        if token.startswith("<p>"):
            pieces.append(clean_inline(token))
            continue

        if token.startswith("<ul>"):
            pieces.append(html_list_to_markdown(token, ordered=False))
            continue

        if token.startswith("<ol>"):
            pieces.append(html_list_to_markdown(token, ordered=True))

    body = "\n\n".join(piece for piece in pieces if piece).strip()
    return lead, body


def build_frontmatter(title: str, description: str, order: int, category: str, lead: str | None) -> str:
    lines = [
        "---",
        f"title: {json.dumps(title, ensure_ascii=False)}",
        f"description: {json.dumps(description, ensure_ascii=False)}",
        f"order: {order}",
        f"category: {json.dumps(category, ensure_ascii=False)}",
    ]

    if lead:
        lines.append(f"lead: {json.dumps(lead, ensure_ascii=False)}")

    lines.append("---")
    return "\n".join(lines)


def main() -> None:
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    page_files = sorted(LEGACY_PAGES_DIR.glob("*.html"))
    if not page_files:
        raise SystemExit("Nenhuma pagina HTML encontrada em wiki/pages")

    for index, page_file in enumerate(page_files, start=1):
        raw = page_file.read_text(encoding="utf-8")
        title = extract_match(r'<h1 class="wiki-title">(.*?)</h1>', raw, "titulo")
        description = extract_match(r'<span class="wiki-top-meta">(.*?)</span>', raw, "descricao")
        article_html = extract_match(r'<article class="wiki-article">(.*?)</article>', raw, "article")
        lead, body = convert_article_html(article_html)
        category = category_from_title(title)
        slug = slug_from_stem(page_file.stem)

        frontmatter = build_frontmatter(title, description, index, category, lead)
        output = f"{frontmatter}\n\n{body}\n"
        (OUTPUT_DIR / f"{slug}.md").write_text(output, encoding="utf-8")

    print(f"OK: {len(page_files)} paginas migradas para {OUTPUT_DIR.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
