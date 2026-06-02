"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { AUDIENCES, type Audience } from "@/lib/catalog";
import type { Dictionary } from "@/lib/i18n";

interface AudienceTabsProps {
  dict: Dictionary;
  /** Where the tab links should land. Defaults to the current pathname. */
  basePath?: string;
}

/**
 * Top-level audience navigation: All / Men / Kids.
 *
 * Clicking a tab updates the `for=` query param while preserving every other
 * filter (category, size, brand, sort) so shoppers can pivot the catalog
 * without losing the rest of their refinement. Implemented as `<Link>`s for
 * server-rendered, scroll-restoring navigation.
 */
export function AudienceTabs({ dict, basePath }: AudienceTabsProps) {
  const pathname = usePathname() ?? "/";
  const search = useSearchParams();
  const target = basePath ?? pathname;

  const current = search?.get("for") ?? null;

  const buildHref = (next: Audience | null) => {
    const sp = new URLSearchParams(search?.toString() ?? "");
    if (next) sp.set("for", next);
    else sp.delete("for");
    const qs = sp.toString();
    return qs ? `${target}?${qs}` : target;
  };

  const tabs: Array<{ key: Audience | null; label: string }> = [
    { key: null, label: dict.header.audienceAll },
    ...AUDIENCES.map((a) => ({ key: a, label: dict.audience[a] })),
  ];

  return (
    <nav
      aria-label={dict.header.audienceAll}
      className="flex items-center gap-0.5 rounded-full bg-balna-line/60 p-1 text-sm font-semibold"
    >
      {tabs.map(({ key, label }) => {
        const active =
          key === null ? current === null : current === key;
        return (
          <Link
            key={key ?? "all"}
            href={buildHref(key)}
            scroll={false}
            aria-current={active ? "page" : undefined}
            className={[
              "inline-flex h-9 items-center justify-center rounded-full px-3 transition sm:px-4",
              active
                ? "bg-white text-balna-ink shadow-[var(--shadow-card)]"
                : "text-balna-muted hover:text-balna-ink",
            ].join(" ")}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
