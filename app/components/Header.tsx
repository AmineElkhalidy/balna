import { Suspense } from "react";
import Link from "next/link";
import { LangSwitcher } from "./LangSwitcher";
import { SocialLinks } from "./SocialLinks";
import type { Dictionary } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n-config";

interface HeaderProps {
  lang: Locale;
  dict: Dictionary;
  /** Optional right-side slot (e.g. "Start over" on the catalog page). */
  action?: React.ReactNode;
}

export function Header({ lang, dict, action }: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 w-full border-b border-balna-line/70 bg-balna-paper/85 backdrop-blur supports-backdrop-filter:bg-balna-paper/70">
      <div className="mx-auto flex h-16 w-full max-w-5xl items-center justify-between gap-3 px-4 sm:px-6">
        <Link
          href={`/${lang}`}
          aria-label={dict.header.homeAria}
          className="flex items-center"
        >
          <Wordmark />
        </Link>
        <div className="flex items-center gap-2 text-sm">
          <SocialLinks dict={dict} variant="header" />
          <Suspense
            fallback={
              <span
                aria-hidden
                className="inline-block h-9 w-24 rounded-full border border-balna-line bg-white"
              />
            }
          >
            <LangSwitcher
              currentLang={lang}
              switchLabel={dict.header.switchTo}
            />
          </Suspense>
          {action}
        </div>
      </div>
    </header>
  );
}

/**
 * Two-tone Balna wordmark. Mirrors the official logo: teal "Bal" + navy "na".
 * `dir="ltr"` keeps the wordmark left-to-right even on RTL pages so the brand
 * always reads "Balna" (instead of being bidi-flipped).
 */
function Wordmark() {
  return (
    <span
      dir="ltr"
      className="font-balna-display text-2xl font-extrabold leading-none tracking-tight sm:text-[26px]"
    >
      <span className="text-balna-teal">Ba</span>
      <span className="relative inline-block text-balna-teal">
        l
        <HangerTag className="absolute -top-2.5 left-1/2 h-3 w-3 -translate-x-1/2 text-balna-teal sm:-top-3 sm:h-3.5 sm:w-3.5" />
      </span>
      <span className="text-balna-navy">na</span>
    </span>
  );
}

function HangerTag({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M12 4.5a2 2 0 1 1 2 2v2" />
      <circle cx="17.5" cy="13" r="1.2" fill="currentColor" stroke="none" />
    </svg>
  );
}
