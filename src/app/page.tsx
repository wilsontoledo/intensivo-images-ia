import Link from "next/link";

import { SiteHeader } from "@/components/site-header";
import { getFirstWikiPage, getWikiCategoryGroups } from "@/lib/wiki";

export default function HomePage() {
  const groups = getWikiCategoryGroups();
  const firstPage = getFirstWikiPage();
  const totalPages = groups.reduce((accumulator, group) => accumulator + group.pages.length, 0);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <SiteHeader />

      <main className="mx-auto max-w-7xl px-4 py-12 lg:px-6">
        <section className="grid gap-12 lg:grid-cols-[minmax(0,1.1fr)_320px] lg:items-start">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-300">
              Base de wiki pronta para Vercel
            </p>
            <h1 className="mt-4 max-w-3xl text-4xl font-semibold tracking-tight text-white md:text-5xl">
              Documentação técnica simples hoje, estruturada para crescer depois.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
              O conteúdo agora vive em arquivos Markdown desacoplados da UI, com rotas dinâmicas,
              navegação automática e uma base limpa em Next.js, TypeScript, App Router e Tailwind CSS.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href={firstPage ? `/wiki/${firstPage.slug}` : "/wiki"}
                className="inline-flex items-center justify-center rounded-full bg-sky-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-sky-300"
              >
                Começar pela wiki
              </Link>
              <Link
                href="/wiki"
                className="inline-flex items-center justify-center rounded-full border border-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:border-sky-400/40 hover:bg-white/5"
              >
                Ver índice completo
              </Link>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-panel">
            <p className="text-sm font-semibold text-white">Visão geral</p>
            <dl className="mt-6 grid grid-cols-2 gap-4">
              <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
                <dt className="text-xs uppercase tracking-[0.2em] text-slate-500">Páginas</dt>
                <dd className="mt-2 text-2xl font-semibold text-white">{totalPages}</dd>
              </div>
              <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
                <dt className="text-xs uppercase tracking-[0.2em] text-slate-500">Seções</dt>
                <dd className="mt-2 text-2xl font-semibold text-white">{groups.length}</dd>
              </div>
            </dl>

            <ul className="mt-6 space-y-3 text-sm text-slate-300">
              <li>Conteúdo em `content/wiki/*.md`</li>
              <li>Rotas em `/wiki/[slug]`</li>
              <li>Preparado para busca, progresso e persistência futura</li>
            </ul>
          </div>
        </section>

        <section className="mt-14">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold text-white">Mapa do conteúdo</h2>
              <p className="mt-2 text-slate-400">
                As páginas foram agrupadas por módulo para facilitar manutenção e expansão.
              </p>
            </div>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {groups.map((group) => (
              <section key={group.title} className="rounded-3xl border border-white/10 bg-white/5 p-5">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-lg font-semibold text-white">{group.title}</h3>
                  <span className="rounded-full border border-white/10 px-2.5 py-1 text-xs text-slate-400">
                    {group.pages.length} páginas
                  </span>
                </div>

                <ul className="mt-4 space-y-2">
                  {group.pages.slice(0, 4).map((page) => (
                    <li key={page.slug}>
                      <Link
                        href={`/wiki/${page.slug}`}
                        className="block rounded-2xl border border-transparent px-3 py-2 transition hover:border-white/10 hover:bg-slate-950/50"
                      >
                        <span className="block text-sm font-medium text-white">{page.title}</span>
                        <span className="mt-1 block text-sm text-slate-400">{page.description}</span>
                      </Link>
                    </li>
                  ))}
                </ul>

                <Link
                  href="/wiki"
                  className="mt-4 inline-flex text-sm font-medium text-sky-300 transition hover:text-sky-200"
                >
                  Explorar índice completo
                </Link>
              </section>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
