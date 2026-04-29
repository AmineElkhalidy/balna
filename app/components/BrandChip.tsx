"use client";

import { getBrandStyle } from "@/lib/catalog";

interface BrandChipProps {
  brand: string;
  selected: boolean;
  onClick: () => void;
}

/**
 * Brand selector tile.
 *
 * Real logos would replace the inner wordmark in production (a <Image /> with
 * a Sanity asset). For now we render a minimal "logo plate" using each brand's
 * own colour palette — recognisable and consistent across all brands without
 * pulling third-party assets.
 */
export function BrandChip({ brand, selected, onClick }: BrandChipProps) {
  const style = getBrandStyle(brand);
  const label = style.mark ?? brand;

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      aria-label={brand}
      className={[
        "group relative flex aspect-[5/3] w-full items-center justify-center overflow-hidden rounded-2xl border-2 bg-white p-3 transition",
        "shadow-[var(--shadow-card)] active:scale-[0.98]",
        selected
          ? "border-balna-teal ring-4 ring-balna-teal/20"
          : "border-balna-line hover:border-balna-teal/70 hover:shadow-[var(--shadow-pop)]",
      ].join(" ")}
    >
      <span
        dir="ltr"
        className="font-balna-display flex h-full w-full items-center justify-center rounded-xl px-3 text-base font-extrabold uppercase tracking-[0.08em] sm:text-lg"
        style={{ background: style.bg, color: style.fg }}
      >
        {label}
      </span>
      {selected && (
        <span
          aria-hidden
          className="absolute right-1.5 top-1.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-balna-teal text-[11px] font-bold text-white shadow-[var(--shadow-card)]"
        >
          ✓
        </span>
      )}
    </button>
  );
}
