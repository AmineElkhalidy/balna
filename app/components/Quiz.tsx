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

type Step = 1 | 2 | 3;

interface QuizProps {
  lang: Locale;
  dict: Dictionary;
}

/**
 * "Guided Entry" quiz — three full-screen steps, one decision per screen.
 *
 * Receives its dictionary as a prop so the same component renders correctly
 * in either locale without bundling both dictionaries on the client.
 */
export function Quiz({ lang, dict }: QuizProps) {
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);
  const [audience, setAudience] = useState<Audience | null>(null);
  const [category, setCategory] = useState<Category | null>(null);
  const [sizes, setSizes] = useState<string[]>([]);

  const sizeOptions = useMemo<readonly string[]>(() => {
    if (category === "accessories") return [ACCESSORIES_SIZE];
    if (audience) return SIZES_BY_AUDIENCE[audience];
    return [];
  }, [audience, category]);

  function pickAudience(a: Audience) {
    setAudience(a);
    setSizes([]);
    setStep(2);
  }

  function pickCategory(c: Category) {
    setCategory(c);
    setSizes(c === "accessories" ? [ACCESSORIES_SIZE] : []);
    setStep(3);
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
    if (sizes.length > 0) params.set("size", sizes.join(","));
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
            eyebrow={format(dict.quiz.stepLabel, { step: 1 })}
            title={dict.quiz.step1.title}
            subtitle={dict.quiz.step1.subtitle}
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
            eyebrow={format(dict.quiz.stepLabel, { step: 2 })}
            title={dict.quiz.step2.title}
            subtitle={dict.quiz.step2.subtitle}
            backLabel={dict.quiz.back}
            onBack={() => setStep(1)}
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
            eyebrow={format(dict.quiz.stepLabel, { step: 3 })}
            title={dict.quiz.step3.title}
            subtitle={
              category === "accessories"
                ? dict.quiz.step3.subtitleAccessories
                : dict.quiz.step3.subtitle
            }
            backLabel={dict.quiz.back}
            onBack={() => setStep(2)}
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
                {dict.quiz.step3.submit}
              </button>
              {sizes.length === 0 && category !== "accessories" && (
                <p className="text-sm text-balna-muted">
                  {format(dict.quiz.step3.skipHint, {
                    cta: dict.quiz.step3.submit.replace(/[→←]/g, "").trim(),
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
  const pct = (step / 3) * 100;
  return (
    <div
      className="h-1.5 w-full bg-balna-line"
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={3}
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
  children,
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
  backLabel?: string;
  onBack?: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-1 flex-col">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-balna-teal-dark">
          {eyebrow}
        </p>
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
