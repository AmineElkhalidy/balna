"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ACCESSORIES_SIZE,
  AUDIENCES,
  AUDIENCE_EMOJI,
  CATEGORIES,
  CATEGORY_EMOJI,
  SIZES_BY_AUDIENCE,
  type Audience,
  type Category,
} from "@/lib/catalog";
import type { Dictionary } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n-config";
import { format } from "@/lib/format";
import { BrandChip } from "./BrandChip";

type Step = 1 | 2 | 3 | 4;
const TOTAL_STEPS = 4;

interface QuizProps {
  lang: Locale;
  dict: Dictionary;
  /**
   * Map of `"audience:category"` → distinct brand names available for that
   * combo. Pre-computed on the server (Sanity-aware) so the Quiz never has to
   * fetch on the client.
   */
  brandIndex: Record<string, string[]>;
}

/**
 * "Guided Entry" quiz — four full-screen steps, one decision per screen:
 *   1. Audience  (Men / Kids)
 *   2. Category  (Shoes / Jackets / …)
 *   3. Brand     (multi-select, dynamically derived from in-stock items)
 *   4. Size      (multi-select, audience-aware)
 *
 * Each StepShell is keyed on `step` so it remounts and replays the
 * `step-enter` CSS animation on advance/back — no JS animation library needed.
 */
export function Quiz({ lang, dict, brandIndex }: QuizProps) {
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);
  const [audience, setAudience] = useState<Audience | null>(null);
  const [category, setCategory] = useState<Category | null>(null);
  const [brands, setBrands] = useState<string[]>([]);
  const [sizes, setSizes] = useState<string[]>([]);

  const sizeOptions = useMemo<readonly string[]>(() => {
    if (category === "accessories") return [ACCESSORIES_SIZE];
    if (audience) return SIZES_BY_AUDIENCE[audience];
    return [];
  }, [audience, category]);

  /** Server-supplied brand list for the current audience + category. */
  const brandOptions = useMemo<readonly string[]>(() => {
    if (!audience || !category) return [];
    return brandIndex[`${audience}:${category}`] ?? [];
  }, [audience, category, brandIndex]);

  function pickAudience(a: Audience) {
    setAudience(a);
    setBrands([]);
    setSizes([]);
    setStep(2);
  }

  function pickCategory(c: Category) {
    setCategory(c);
    setBrands([]);
    setSizes(c === "accessories" ? [ACCESSORIES_SIZE] : []);
    setStep(3);
  }

  function toggleBrand(b: string) {
    setBrands((prev) =>
      prev.includes(b) ? prev.filter((x) => x !== b) : [...prev, b],
    );
  }

  function toggleSize(s: string) {
    setSizes((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s],
    );
  }

  function submit() {
    if (!audience || !category) return;
    const params = new URLSearchParams();
    params.set("for", audience);
    params.set("type", category);
    if (brands.length > 0) params.set("brand", brands.join(","));
    if (sizes.length > 0) params.set("size", sizes.join(","));
    router.push(`/${lang}/shop?${params.toString()}`);
  }

  /**
   * Escape hatch — once an audience is picked, the user can bail out of the
   * funnel at any later step and see every in-stock piece for that audience.
   * The shop page sorts "Like new" first, so the landing view is a curated
   * mix of all categories with the best-quality items up top.
   */
  function skipToAll() {
    if (!audience) return;
    const params = new URLSearchParams();
    params.set("for", audience);
    router.push(`/${lang}/shop?${params.toString()}`);
  }

  return (
    <section
      className="relative flex flex-1 flex-col"
      aria-label={dict.quiz.ariaLabel}
    >
      <ProgressBar step={step} />

      <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-5 pb-10 pt-6 sm:px-8">
        {step === 1 && (
          <StepShell
            key="audience"
            eyebrow={format(dict.quiz.stepLabel, { step: 1, total: TOTAL_STEPS })}
            title={dict.quiz.audience.title}
            subtitle={dict.quiz.audience.subtitle}
          >
            <div className="grid grid-cols-2 gap-4">
              {AUDIENCES.map((a) => (
                <BigCard
                  key={a}
                  selected={audience === a}
                  onClick={() => pickAudience(a)}
                  emoji={AUDIENCE_EMOJI[a]}
                  label={dict.audience[a]}
                />
              ))}
            </div>
          </StepShell>
        )}

        {step === 2 && (
          <StepShell
            key="category"
            eyebrow={format(dict.quiz.stepLabel, { step: 2, total: TOTAL_STEPS })}
            title={dict.quiz.category.title}
            subtitle={dict.quiz.category.subtitle}
            backLabel={dict.quiz.back}
            onBack={() => setStep(1)}
            skipToAllLabel={dict.quiz.skipToAll}
            onSkipToAll={skipToAll}
          >
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              {CATEGORIES.map((c) => (
                <BigCard
                  key={c}
                  selected={category === c}
                  onClick={() => pickCategory(c)}
                  emoji={CATEGORY_EMOJI[c]}
                  label={dict.category[c]}
                />
              ))}
            </div>
          </StepShell>
        )}

        {step === 3 && (
          <StepShell
            key="brand"
            eyebrow={format(dict.quiz.stepLabel, { step: 3, total: TOTAL_STEPS })}
            title={dict.quiz.brand.title}
            subtitle={dict.quiz.brand.subtitle}
            backLabel={dict.quiz.back}
            onBack={() => setStep(2)}
            skipToAllLabel={dict.quiz.skipToAll}
            onSkipToAll={skipToAll}
          >
            {brandOptions.length === 0 ? (
              <BrandEmpty
                dict={dict}
                onContinue={() => {
                  setBrands([]);
                  setStep(4);
                }}
              />
            ) : (
              <>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
                  {brandOptions.map((b) => (
                    <BrandChip
                      key={b}
                      brand={b}
                      selected={brands.includes(b)}
                      onClick={() => toggleBrand(b)}
                    />
                  ))}
                </div>

                <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <button
                    type="button"
                    onClick={() => setStep(4)}
                    className="inline-flex h-14 items-center justify-center rounded-full bg-balna-navy px-7 text-base font-semibold text-white shadow-[var(--shadow-card)] transition hover:bg-balna-navy-dark active:scale-[0.99]"
                  >
                    {dict.quiz.brand.continue}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setBrands([]);
                      setStep(4);
                    }}
                    className="text-sm font-semibold text-balna-muted underline-offset-4 hover:text-balna-ink hover:underline"
                  >
                    {dict.quiz.brand.skip}
                  </button>
                </div>

                <p className="mt-4 text-sm text-balna-muted">
                  {brands.length === 0
                    ? dict.quiz.brand.noneSelectedHint
                    : format(dict.quiz.brand.selectionHint, {
                        count: brands.length,
                      })}
                </p>
              </>
            )}
          </StepShell>
        )}

        {step === 4 && (
          <StepShell
            key="size"
            eyebrow={format(dict.quiz.stepLabel, { step: 4, total: TOTAL_STEPS })}
            title={dict.quiz.size.title}
            subtitle={
              category === "accessories"
                ? dict.quiz.size.subtitleAccessories
                : dict.quiz.size.subtitle
            }
            backLabel={dict.quiz.back}
            onBack={() => setStep(3)}
            skipToAllLabel={dict.quiz.skipToAll}
            onSkipToAll={skipToAll}
          >
            <div className="flex flex-wrap gap-3">
              {sizeOptions.map((s) => {
                const active = sizes.includes(s);
                const label = s === ACCESSORIES_SIZE ? dict.size.oneSize : s;
                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() => toggleSize(s)}
                    aria-pressed={active}
                    className={[
                      "min-h-14 min-w-20 rounded-2xl border-2 px-5 text-lg font-semibold transition",
                      "active:scale-[0.98]",
                      active
                        ? "border-balna-teal bg-balna-teal text-white shadow-[var(--shadow-pop)]"
                        : "border-balna-line bg-white text-balna-ink hover:border-balna-teal/60",
                    ].join(" ")}
                  >
                    {label}
                  </button>
                );
              })}
            </div>

            <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <button
                type="button"
                onClick={submit}
                className="inline-flex h-14 items-center justify-center rounded-full bg-balna-navy px-7 text-base font-semibold text-white shadow-[var(--shadow-card)] transition hover:bg-balna-navy-dark active:scale-[0.99]"
              >
                {dict.quiz.size.submit}
              </button>
              {sizes.length === 0 && category !== "accessories" && (
                <p className="text-sm text-balna-muted">
                  {format(dict.quiz.size.skipHint, {
                    cta: dict.quiz.size.submit.replace(/[→←]/g, "").trim(),
                  })}
                </p>
              )}
            </div>
          </StepShell>
        )}
      </div>
    </section>
  );
}

/* ────────────────────────────────────────────────────────────────────────── */

function ProgressBar({ step }: { step: Step }) {
  const pct = (step / TOTAL_STEPS) * 100;
  return (
    <div
      className="h-1.5 w-full bg-balna-line"
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={TOTAL_STEPS}
      aria-valuenow={step}
    >
      <div
        className="h-full bg-balna-teal transition-[width] duration-500 ease-out"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

function StepShell({
  eyebrow,
  title,
  subtitle,
  backLabel,
  onBack,
  skipToAllLabel,
  onSkipToAll,
  children,
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
  backLabel?: string;
  onBack?: () => void;
  skipToAllLabel?: string;
  onSkipToAll?: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="step-enter flex flex-1 flex-col">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-balna-teal-dark">
          {eyebrow}
        </p>
        <div className="flex items-center gap-2">
          {onSkipToAll && skipToAllLabel ? (
            <button
              type="button"
              onClick={onSkipToAll}
              className="rounded-full bg-balna-teal/10 px-3 py-1.5 text-sm font-semibold text-balna-teal-dark transition hover:bg-balna-teal/20"
            >
              {skipToAllLabel}
            </button>
          ) : null}
          {onBack && backLabel ? (
            <button
              type="button"
              onClick={onBack}
              className="rounded-full px-3 py-1.5 text-sm font-medium text-balna-muted hover:bg-balna-line/60 hover:text-balna-ink"
            >
              {backLabel}
            </button>
          ) : null}
        </div>
      </div>
      <h1 className="mt-4 font-balna-display text-3xl font-extrabold tracking-tight text-balna-ink sm:text-4xl">
        {title}
      </h1>
      {subtitle && (
        <p className="mt-2 max-w-xl text-base text-balna-muted">{subtitle}</p>
      )}
      <div className="mt-8 flex flex-1 flex-col">{children}</div>
    </div>
  );
}

function BigCard({
  emoji,
  label,
  selected,
  onClick,
}: {
  emoji: string;
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={[
        "group relative flex aspect-square w-full flex-col items-center justify-center gap-3 rounded-3xl border-2 bg-white p-6 text-center transition",
        "shadow-[var(--shadow-card)] active:scale-[0.98]",
        selected
          ? "border-balna-teal ring-4 ring-balna-teal/20"
          : "border-balna-line hover:border-balna-teal/70 hover:shadow-[var(--shadow-pop)]",
      ].join(" ")}
    >
      <span aria-hidden className="text-5xl sm:text-6xl">
        {emoji}
      </span>
      <span className="text-lg font-semibold text-balna-ink sm:text-xl">
        {label}
      </span>
    </button>
  );
}

function BrandEmpty({
  dict,
  onContinue,
}: {
  dict: Dictionary;
  onContinue: () => void;
}) {
  return (
    <div className="rounded-3xl border-2 border-dashed border-balna-line bg-white p-6 text-center">
      <span aria-hidden className="text-4xl">
        🪧
      </span>
      <h2 className="mt-3 text-lg font-bold text-balna-ink">
        {dict.quiz.brand.empty.title}
      </h2>
      <p className="mt-2 text-sm text-balna-muted">
        {dict.quiz.brand.empty.body}
      </p>
      <button
        type="button"
        onClick={onContinue}
        className="mt-5 inline-flex h-12 items-center justify-center rounded-full bg-balna-navy px-6 font-semibold text-white hover:bg-balna-navy-dark"
      >
        {dict.quiz.brand.empty.cta}
      </button>
    </div>
  );
}
