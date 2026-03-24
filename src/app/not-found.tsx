import Link from "next/link";

import { SiteHeader } from "@/components/site-header";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <SiteHeader />

      <main className="mx-auto flex max-w-3xl flex-col items-start px-4 py-20 lg:px-6">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-300">404</p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight text-white">Página não encontrada</h1>
        <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-300">
          A rota solicitada não existe ou o conteúdo foi movido. Use o índice da wiki para retomar a navegação.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/wiki"
            className="inline-flex rounded-full bg-sky-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-sky-300"
          >
            Ir para a wiki
          </Link>
          <Link
            href="/"
            className="inline-flex rounded-full border border-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:border-sky-400/40 hover:bg-white/5"
          >
            Voltar para a home
          </Link>
        </div>
      </main>
    </div>
  );
}
