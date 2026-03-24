import Link from "next/link";

import { getFirstWikiPage, getWikiCategoryGroups } from "@/lib/wiki";

export default function WikiIndexPage() {
  const groups = getWikiCategoryGroups();
  const firstPage = getFirstWikiPage();

  return (
    <div className="space-y-8">
      <section className="rounded-3xl border border-white/10 bg-white/5 p-6 md:p-8">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-300">Wiki</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white">Índice da documentação</h1>
        <p className="mt-4 max-w-3xl leading-8 text-slate-300">
          Esta área usa arquivos Markdown como fonte de verdade. A UI só lê e organiza esse conteúdo,
          o que simplifica manutenção agora e facilita adicionar busca, favoritos, progresso de leitura
          ou persistência em banco no futuro.
        </p>

        {firstPage ? (
          <Link
            href={`/wiki/${firstPage.slug}`}
            className="mt-6 inline-flex rounded-full bg-sky-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-sky-300"
          >
            Começar pelo início
          </Link>
        ) : null}
      </section>

      <div className="space-y-6">
        {groups.map((group) => (
          <section key={group.title} className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-xl font-semibold text-white">{group.title}</h2>
              <span className="text-sm text-slate-500">{group.pages.length} páginas</span>
            </div>

            <div className="mt-5 grid gap-3">
              {group.pages.map((page) => (
                <Link
                  key={page.slug}
                  href={`/wiki/${page.slug}`}
                  className="rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-4 transition hover:border-sky-400/40 hover:bg-sky-400/10"
                >
                  <span className="block text-base font-semibold text-white">{page.title}</span>
                  <span className="mt-1 block text-sm text-slate-400">{page.description}</span>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
