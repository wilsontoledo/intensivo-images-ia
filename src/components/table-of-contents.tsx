import type { WikiHeading } from "@/lib/wiki";

type TableOfContentsProps = {
  headings: WikiHeading[];
};

export function TableOfContents({ headings }: TableOfContentsProps) {
  if (headings.length === 0) {
    return null;
  }

  return (
    <aside className="sticky top-24 hidden h-fit rounded-2xl border border-white/10 bg-white/5 p-4 xl:block">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Nesta página</p>
      <ul className="mt-4 space-y-2">
        {headings.map((heading) => (
          <li key={heading.id}>
            <a
              href={`#${heading.id}`}
              className={[
                "block text-sm text-slate-400 transition hover:text-white",
                heading.level === 3 ? "pl-4" : "",
              ].join(" ")}
            >
              {heading.text}
            </a>
          </li>
        ))}
      </ul>
    </aside>
  );
}
