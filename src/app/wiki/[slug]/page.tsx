import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { MarkdownRenderer } from "@/components/markdown-renderer";
import { PageNavigation } from "@/components/page-navigation";
import { TableOfContents } from "@/components/table-of-contents";
import { getAdjacentWikiPages, getAllWikiPages, getWikiPage } from "@/lib/wiki";

type WikiPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export const dynamicParams = false;

export function generateStaticParams() {
  return getAllWikiPages().map((page) => ({
    slug: page.slug,
  }));
}

export async function generateMetadata({ params }: WikiPageProps): Promise<Metadata> {
  const { slug } = await params;
  const page = getWikiPage(slug);

  if (!page) {
    return {
      title: "Página não encontrada",
    };
  }

  return {
    title: page.title,
    description: page.description,
  };
}

export default async function WikiPage({ params }: WikiPageProps) {
  const { slug } = await params;
  const page = getWikiPage(slug);

  if (!page) {
    notFound();
  }

  const navigation = getAdjacentWikiPages(slug);

  return (
    <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_18rem] xl:items-start">
      <article className="rounded-3xl border border-white/10 bg-white/5 p-6 md:p-8">
        <div className="border-b border-white/10 pb-6">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-300">{page.category}</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white md:text-4xl">{page.title}</h1>
          <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-300">{page.description}</p>
          {page.lead ? (
            <div className="mt-6 rounded-2xl border border-sky-400/20 bg-sky-400/10 px-4 py-4 text-sm text-sky-100">
              {page.lead}
            </div>
          ) : null}
        </div>

        <div className="mt-8">
          <MarkdownRenderer content={page.content} />
        </div>

        <PageNavigation previous={navigation.previous} next={navigation.next} />
      </article>

      <TableOfContents headings={page.headings} />
    </div>
  );
}
