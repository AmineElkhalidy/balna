"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useId, useTransition } from "react";
import { DEFAULT_SORT, SORT_KEYS, type SortKey } from "@/lib/catalog";
import type { Dictionary } from "@/lib/i18n";

interface SortDropdownProps {
  dict: Dictionary;
}

/**
 * Native <select> sort control. Wired to `useRouter().push()` so changing the
 * value reloads the catalog with the new `sort=` query param while preserving
 * every other filter. Native widget on purpose — it's a11y-friendly,
 * mobile-friendly, and zero CSS work.
 */
export function SortDropdown({ dict }: SortDropdownProps) {
  const router = useRouter();
  const pathname = usePathname() ?? "/";
  const search = useSearchParams();
  const id = useId();
  const [isPending, startTransition] = useTransition();

  const current = (search?.get("sort") as SortKey) ?? DEFAULT_SORT;

  function onChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const next = e.target.value as SortKey;
    const sp = new URLSearchParams(search?.toString() ?? "");
    if (next === DEFAULT_SORT) sp.delete("sort");
    else sp.set("sort", next);
    const qs = sp.toString();
    const href = qs ? `${pathname}?${qs}` : pathname;
    startTransition(() => router.push(href, { scroll: false }));
  }

  return (
    <label
      htmlFor={id}
      className="inline-flex items-center gap-2 text-sm font-semibold text-balna-muted"
    >
      <span className="hidden sm:inline">{dict.home.sortBy}</span>
      <span className="relative inline-flex">
        <select
          id={id}
          value={current}
          onChange={onChange}
          disabled={isPending}
          className="h-10 appearance-none rounded-full border border-balna-line bg-white pe-9 ps-4 text-sm font-semibold text-balna-ink transition hover:border-balna-teal focus-visible:border-balna-teal disabled:opacity-60"
        >
          {SORT_KEYS.map((k) => (
            <option key={k} value={k}>
              {dict.sort[k]}
            </option>
          ))}
        </select>
        <span
          aria-hidden
          className="pointer-events-none absolute end-3 top-1/2 -translate-y-1/2 text-balna-muted"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-3.5 w-3.5"
          >
            <path d="M6 9l6 6 6-6" />
          </svg>
        </span>
      </span>
    </label>
  );
}
