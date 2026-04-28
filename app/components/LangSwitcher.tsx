"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { LOCALES, LOCALE_META, type Locale } from "@/lib/i18n-config";
import { format } from "@/lib/format";

interface LangSwitcherProps {
  currentLang: Locale;
  switchLabel: string;
}

/**
 * Compact pill that swaps the route's first segment between locales while
 * preserving the rest of the path AND any active query string (so the user
 * keeps their quiz answers when they flip languages on /shop).
 */
export function LangSwitcher({ currentLang, switchLabel }: LangSwitcherProps) {
  const pathname = usePathname() ?? `/${currentLang}`;
  const search = useSearchParams();

  const next = LOCALES.find((l) => l !== currentLang) ?? currentLang;
  const meta = LOCALE_META[next];

  // Replace just the leading locale segment so /en/shop ↔ /ar/shop.
  const segments = pathname.split("/").filter(Boolean);
  if (segments[0] && (LOCALES as readonly string[]).includes(segments[0])) {
    segments[0] = next;
  } else {
    segments.unshift(next);
  }
  const qs = search?.toString();
  const href = `/${segments.join("/")}${qs ? `?${qs}` : ""}`;

  return (
    <Link
      href={href}
      hrefLang={meta.htmlLang}
      aria-label={format(switchLabel, { language: meta.nativeLabel })}
      className="inline-flex h-9 items-center gap-1.5 rounded-full border border-balna-line bg-white px-3 text-sm font-semibold text-balna-ink transition hover:border-balna-teal hover:text-balna-teal-dark"
    >
      <GlobeIcon className="h-4 w-4 text-balna-teal-dark" />
      <span className="font-balna-display">{meta.nativeLabel}</span>
    </Link>
  );
}

function GlobeIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18" />
      <path d="M12 3a14 14 0 0 1 0 18a14 14 0 0 1 0-18" />
    </svg>
  );
}
