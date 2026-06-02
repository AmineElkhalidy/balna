import { Suspense } from "react";
import Link from "next/link";
import { LangSwitcher } from "./LangSwitcher";
import { AudienceTabs } from "./AudienceTabs";
import type { Dictionary } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n-config";

interface HeaderProps {
  lang: Locale;
  dict: Dictionary;
  /**
   * What to render in the right-hand toolbar.
   *
   * - `"catalog"` (default): audience tabs + Quick-find icon + lang switcher.
   *   Used on the catalog landing where the header doubles as primary nav.
   * - `"minimal"`: just the lang switcher + an optional `action` slot. Used
   *   on /quiz so the header isn't busy while the user is mid-flow.
   */
  variant?: "catalog" | "minimal";
  /** Optional right-side slot (e.g. "Back to browse" on /quiz). */
  action?: React.ReactNode;
}

export function Header({
  lang,
  dict,
  variant = "catalog",
  action,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 w-full border-b border-balna-line/70 bg-balna-paper/85 backdrop-blur supports-backdrop-filter:bg-balna-paper/70">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center gap-3 px-4 sm:px-6">
        <Link
          href={`/${lang}`}
          aria-label={dict.header.homeAria}
          className="flex shrink-0 items-center"
        >
          <Wordmark />
        </Link>

        {variant === "catalog" ? (
          <>
            <Suspense fallback={<TabsFallback />}>
              <div className="hidden flex-1 justify-center sm:flex">
                <AudienceTabs dict={dict} basePath={`/${lang}`} />
              </div>
            </Suspense>

            <div className="ms-auto flex items-center gap-2 sm:ms-0">
              <Link
                href={`/${lang}/quiz`}
                aria-label={dict.header.quickFindAria}
                className="inline-flex h-9 items-center gap-1.5 rounded-full bg-balna-teal-soft px-3 text-sm font-semibold text-balna-teal-dark transition hover:bg-balna-teal/15 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-balna-teal"
              >
                <SparkIcon className="h-4 w-4" />
                <span className="hidden sm:inline">
                  {dict.header.quickFind}
                </span>
              </Link>

              <Suspense fallback={<LangFallback />}>
                <LangSwitcher
                  currentLang={lang}
                  switchLabel={dict.header.switchTo}
                />
              </Suspense>
            </div>
          </>
        ) : (
          <div className="ms-auto flex items-center gap-2">
            {action}
            <Suspense fallback={<LangFallback />}>
              <LangSwitcher
                currentLang={lang}
                switchLabel={dict.header.switchTo}
              />
            </Suspense>
          </div>
        )}
      </div>

      {/* Mobile-only audience tabs row — the header proper is too narrow on
          phones for the wordmark + tabs + actions to coexist on one line. */}
      {variant === "catalog" && (
        <div className="border-t border-balna-line/60 bg-balna-paper/80 sm:hidden">
          <div className="mx-auto flex w-full max-w-6xl items-center justify-center px-4 py-2">
            <Suspense fallback={<TabsFallback />}>
              <AudienceTabs dict={dict} basePath={`/${lang}`} />
            </Suspense>
          </div>
        </div>
      )}
    </header>
  );
}

/* ────────────────────────────────────────────────────────────────────────── */

function TabsFallback() {
  return (
    <span
      aria-hidden
      className="inline-block h-9 w-48 rounded-full bg-balna-line/60"
    />
  );
}

function LangFallback() {
  return (
    <span
      aria-hidden
      className="inline-block h-9 w-20 rounded-full border border-balna-line bg-white"
    />
  );
}

/**
 * Two-tone Minor Shop wordmark. The "i" of Minor is rendered as a dotless ı
 * so the little hanger tag can sit above it as the tittle — a tiny clothes
 * hanger that doubles as the dot of the i. `dir="ltr"` keeps the wordmark
 * left-to-right even on RTL pages so the brand always reads "Minor Shop"
 * (instead of being bidi-flipped).
 */
function Wordmark() {
  return (
    <span
      dir="ltr"
      className="font-balna-display text-2xl font-extrabold leading-none tracking-tight sm:text-[26px]"
    >
      <span className="text-balna-teal">M</span>
      <span className="relative inline-block text-balna-teal">
        ı
        <HangerTag className="absolute -top-2 left-1/2 h-3 w-3 -translate-x-1/2 text-balna-teal sm:-top-2.5 sm:h-3.5 sm:w-3.5" />
      </span>
      <span className="text-balna-teal">nor</span>
      <span className="text-balna-navy">&nbsp;Shop</span>
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

function SparkIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden
    >
      <path d="M12 2.5l1.6 4.7a3 3 0 0 0 1.9 1.9L20 10.5l-4.5 1.4a3 3 0 0 0-1.9 1.9L12 18.5l-1.6-4.7a3 3 0 0 0-1.9-1.9L4 10.5l4.5-1.4a3 3 0 0 0 1.9-1.9L12 2.5Z" />
      <path d="M19 16l.7 2.1a1 1 0 0 0 .6.6L22 19.5l-1.7.7a1 1 0 0 0-.6.6L19 23l-.7-2.1a1 1 0 0 0-.6-.6L16 19.5l1.7-.7a1 1 0 0 0 .6-.6L19 16Z" />
    </svg>
  );
}
