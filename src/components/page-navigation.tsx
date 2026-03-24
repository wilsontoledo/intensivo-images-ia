import Link from "next/link";

import type { WikiPageSummary } from "@/lib/wiki";

type PageNavigationProps = {
  previous: WikiPageSummary | null;
  next: WikiPageSummary | null;
};

function NavigationCard({
  direction,
  page,
}: {
  direction: "Anterior" | "Próxima";
  page: WikiPageSummary | null;
}) {
  if (!page) {
    return (
      <div className="rounded-2xl border border-dashed border-white/10 px-4 py-4 text-sm text-slate-500">
        {direction === "Anterior" ? "Esta é a primeira página." : "Esta é a última página."}
      </div>
    );
  }

  return (
    <Link
      href={`/wiki/${page.slug}`}
      className="block rounded-2xl border border-white/10 bg-white/5 px-4 py-4 transition hover:border-sky-400/40 hover:bg-sky-400/10"
    >
      <span className="block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{direction}</span>
      <span className="mt-2 block text-base font-semibold text-white">{page.title}</span>
      <span className="mt-1 block text-sm text-slate-400">{page.description}</span>
    </Link>
  );
}

export function PageNavigation({ previous, next }: PageNavigationProps) {
  return (
    <nav className="mt-12 grid gap-4 border-t border-white/10 pt-8 md:grid-cols-2" aria-label="Navegação entre páginas">
      <NavigationCard direction="Anterior" page={previous} />
      <NavigationCard direction="Próxima" page={next} />
    </nav>
  );
}
