"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import type { WikiCategoryGroup } from "@/lib/wiki";

type SidebarNavProps = {
  groups: WikiCategoryGroup[];
};

function isPageActive(pathname: string, slug: string) {
  return pathname === `/wiki/${slug}`;
}

function NavItems({ groups, pathname }: SidebarNavProps & { pathname: string }) {
  return (
    <nav aria-label="Navegação da wiki" className="space-y-6">
      {groups.map((group) => (
        <section key={group.title} className="space-y-2">
          <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
            {group.title}
          </h2>

          <ul className="space-y-1">
            {group.pages.map((page) => {
              const active = isPageActive(pathname, page.slug);

              return (
                <li key={page.slug}>
                  <Link
                    href={`/wiki/${page.slug}`}
                    className={[
                      "block rounded-xl border px-3 py-2 transition",
                      active
                        ? "border-sky-400/40 bg-sky-400/10 text-white"
                        : "border-transparent text-slate-300 hover:border-white/10 hover:bg-white/5 hover:text-white",
                    ].join(" ")}
                  >
                    <span className="block text-sm font-medium">{page.title}</span>
                    <span className="mt-1 block text-xs text-slate-400">{page.description}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </nav>
  );
}

export function SidebarNav({ groups }: SidebarNavProps) {
  const pathname = usePathname();

  return (
    <>
      <div className="hidden lg:block">
        <div className="sticky top-24 rounded-2xl border border-white/10 bg-white/5 p-4 shadow-panel">
          <NavItems groups={groups} pathname={pathname} />
        </div>
      </div>

      <details className="overflow-hidden rounded-2xl border border-white/10 bg-white/5 lg:hidden">
        <summary className="cursor-pointer list-none px-4 py-3 text-sm font-medium text-white">
          Navegação da wiki
        </summary>
        <div className="border-t border-white/10 px-4 py-4">
          <NavItems groups={groups} pathname={pathname} />
        </div>
      </details>
    </>
  );
}
