import fs from "node:fs";
import path from "node:path";

import matter from "gray-matter";

import { slugify } from "@/lib/utils";

// Markdown keeps the content portable, versionable and independent from React components.
const wikiDirectory = path.join(process.cwd(), "content", "wiki");

export type WikiHeading = {
  id: string;
  text: string;
  level: 2 | 3;
};

export type WikiPageSummary = {
  slug: string;
  title: string;
  description: string;
  order: number;
  category: string;
  lead?: string;
};

export type WikiPage = WikiPageSummary & {
  content: string;
  headings: WikiHeading[];
};

export type WikiCategoryGroup = {
  title: string;
  pages: WikiPageSummary[];
};

type Frontmatter = {
  title: string;
  description: string;
  order: number;
  category: string;
  lead?: string;
};

function getWikiFilePaths(): string[] {
  return fs
    .readdirSync(wikiDirectory)
    .filter((fileName) => fileName.endsWith(".md"))
    .sort((left, right) => left.localeCompare(right, "pt-BR"));
}

function parseWikiFile(fileName: string): WikiPage {
  const fullPath = path.join(wikiDirectory, fileName);
  const raw = fs.readFileSync(fullPath, "utf8");
  const { data, content } = matter(raw);
  const frontmatter = data as Partial<Frontmatter>;
  const slug = fileName.replace(/\.md$/, "");

  if (
    typeof frontmatter.title !== "string" ||
    typeof frontmatter.description !== "string" ||
    typeof frontmatter.order !== "number" ||
    typeof frontmatter.category !== "string"
  ) {
    throw new Error(`Frontmatter invalido em ${fileName}`);
  }

  return {
    slug,
    title: frontmatter.title,
    description: frontmatter.description,
    order: frontmatter.order,
    category: frontmatter.category,
    lead: typeof frontmatter.lead === "string" ? frontmatter.lead : undefined,
    content: content.trim(),
    headings: extractHeadings(content),
  };
}

function toSummary(page: WikiPage): WikiPageSummary {
  return {
    slug: page.slug,
    title: page.title,
    description: page.description,
    order: page.order,
    category: page.category,
    lead: page.lead,
  };
}

function sortPages(pages: WikiPageSummary[]): WikiPageSummary[] {
  return [...pages].sort((left, right) => left.order - right.order);
}

function stripMarkdown(content: string): string {
  return content
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/^>\s+/gm, "")
    .replace(/^[-*+]\s+/gm, "")
    .replace(/^\d+\.\s+/gm, "")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, "$1")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/\n{2,}/g, " ")
    .trim();
}

function extractHeadings(content: string): WikiHeading[] {
  return content
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.startsWith("## ") || line.startsWith("### "))
    .map((line) => {
      const level = line.startsWith("### ") ? 3 : 2;
      const text = line.replace(/^###?\s+/, "").trim();

      return {
        id: slugify(text),
        text,
        level,
      } satisfies WikiHeading;
    });
}

export function getAllWikiPages(): WikiPageSummary[] {
  return sortPages(getWikiFilePaths().map((fileName) => toSummary(parseWikiFile(fileName))));
}

export function getFirstWikiPage(): WikiPageSummary | undefined {
  return getAllWikiPages()[0];
}

export function getWikiPage(slug: string): WikiPage | null {
  const fileName = `${slug}.md`;
  if (!fs.existsSync(path.join(wikiDirectory, fileName))) {
    return null;
  }

  return parseWikiFile(fileName);
}

export function getWikiCategoryGroups(): WikiCategoryGroup[] {
  const groups = new Map<string, WikiPageSummary[]>();

  for (const page of getAllWikiPages()) {
    const pages = groups.get(page.category) ?? [];
    pages.push(page);
    groups.set(page.category, pages);
  }

  return Array.from(groups.entries()).map(([title, pages]) => ({
    title,
    pages: sortPages(pages),
  }));
}

export function getAdjacentWikiPages(slug: string): {
  previous: WikiPageSummary | null;
  next: WikiPageSummary | null;
} {
  const pages = getAllWikiPages();
  const currentIndex = pages.findIndex((page) => page.slug === slug);

  return {
    previous: currentIndex > 0 ? pages[currentIndex - 1] : null,
    next: currentIndex >= 0 && currentIndex < pages.length - 1 ? pages[currentIndex + 1] : null,
  };
}

export function getSearchDocuments(): Array<
  WikiPageSummary & {
    text: string;
  }
> {
  // Mantemos essa saida simples para uma futura busca client-side ou indexacao externa.
  return getWikiFilePaths()
    .map((fileName) => parseWikiFile(fileName))
    .sort((left, right) => left.order - right.order)
    .map((page) => ({
      ...toSummary(page),
      text: stripMarkdown(page.content),
    }));
}
