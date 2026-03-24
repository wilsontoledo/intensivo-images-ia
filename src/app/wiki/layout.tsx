import type { ReactNode } from "react";

import { SidebarNav } from "@/components/sidebar-nav";
import { SiteHeader } from "@/components/site-header";
import { getWikiCategoryGroups } from "@/lib/wiki";

export default function WikiLayout({ children }: { children: ReactNode }) {
  const groups = getWikiCategoryGroups();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <SiteHeader />

      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-6 lg:flex-row lg:items-start lg:gap-8 lg:px-6">
        <div className="lg:w-72 lg:shrink-0">
          <SidebarNav groups={groups} />
        </div>

        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
