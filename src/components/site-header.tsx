import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="border-b border-white/10 bg-slate-950/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 lg:px-6">
        <div>
          <Link href="/" className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-300">
            Intensivo IA
          </Link>
          <p className="mt-1 text-sm text-slate-400">
            Wiki técnica em Next.js, pronta para evoluir e publicar na Vercel.
          </p>
        </div>

        <nav className="flex items-center gap-3 text-sm text-slate-300">
          <Link
            href="/"
            className="rounded-full border border-white/10 px-3 py-1.5 transition hover:border-sky-400/40 hover:text-white"
          >
            Home
          </Link>
          <Link
            href="/wiki"
            className="rounded-full border border-white/10 px-3 py-1.5 transition hover:border-sky-400/40 hover:text-white"
          >
            Wiki
          </Link>
        </nav>
      </div>
    </header>
  );
}
