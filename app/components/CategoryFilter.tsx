"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import {
  CATEGORIES,
  CATEGORY_EMOJI,
  type Category,
} from "@/lib/catalog";
import type { Dictionary } from "@/lib/i18n";

interface CategoryFilterProps {
  dict: Dictionary;
  basePath?: string;
}

/**
 * Horizontal scroll-rail of category chips: All / Shoes / Jackets / …
 *
 * Tapping a chip toggles the `type=` query param. Like {@link AudienceTabs},
 * other filters are preserved across navigation so the shopper can mix and
 * match audience + category + sort without restart.
 */
export function CategoryFilter({ dict, basePath }: CategoryFilterProps) {
  const pathname = usePathname() ?? "/";
  const search = useSearchParams();
  const target = basePath ?? pathname;

  const current = search?.get("type") ?? null;

  const buildHref = (next: Category | null) => {
    const sp = new URLSearchParams(search?.toString() ?? "");
    if (next) sp.set("type", next);
    else sp.delete("type");
    const qs = sp.toString();
    return qs ? `${target}?${qs}` : target;
  };

  const chips: Array<{ key: Category | null; label: string; emoji: string | null }> = [
    { key: null, label: dict.home.categoryAll, emoji: null },
    ...CATEGORIES.map((c) => ({
      key: c,
      label: dict.category[c],
      emoji: CATEGORY_EMOJI[c],
    })),
  ];

  return (
    <div
      role="tablist"
      aria-label={dict.home.categoryAll}
      className="no-scrollbar -mx-4 flex items-center gap-2 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0"
    >
      {chips.map(({ key, label, emoji }) => {
        const active =
          key === null ? current === null : current === key;
        return (
          <Link
            key={key ?? "all"}
            href={buildHref(key)}
            scroll={false}
            role="tab"
            aria-selected={active}
            className={[
              "inline-flex h-10 shrink-0 items-center gap-1.5 rounded-full border px-3.5 text-sm font-semibold transition active:scale-[0.98]",
              active
                ? "border-balna-teal bg-balna-teal text-white shadow-[var(--shadow-card)]"
                : "border-balna-line bg-white text-balna-ink hover:border-balna-teal/60",
            ].join(" ")}
          >
            {emoji && (
              <span aria-hidden className="text-base leading-none">
                {emoji}
              </span>
            )}
            <span>{label}</span>
          </Link>
        );
      })}
    </div>
  );
}
