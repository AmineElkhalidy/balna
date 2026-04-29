"use client";

import Image from "next/image";
import { useState } from "react";
import { whatsappLinkForProduct } from "@/lib/whatsapp";
import { ACCESSORIES_SIZE, type Product } from "@/lib/catalog";
import type { Dictionary } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n-config";
import type { SiteSettings } from "@/lib/sanity/products";
import { format } from "@/lib/format";
import { CheckoutModal } from "./CheckoutModal";

interface ProductCardProps {
  product: Product;
  lang: Locale;
  dict: Dictionary;
  settings: SiteSettings;
}

export function ProductCard({ product, lang, dict, settings }: ProductCardProps) {
  const [open, setOpen] = useState(false);
  const wa = whatsappLinkForProduct(product, dict, settings.whatsappNumber);
  const savings =
    product.originalPrice && product.originalPrice > product.price
      ? Math.round(
          ((product.originalPrice - product.price) / product.originalPrice) *
            100,
        )
      : null;

  const localizedSizes = product.sizes
    .map((s) => (s === ACCESSORIES_SIZE ? dict.size.oneSize : s))
    .join(" · ");

  const cover = product.images?.[0];
  const isSoldOut = product.isSoldOut === true;

  return (
    <>
      <article className="group flex flex-col overflow-hidden rounded-3xl bg-white shadow-[var(--shadow-card)] ring-1 ring-balna-line/60 transition hover:-translate-y-0.5 hover:shadow-[var(--shadow-pop)]">
        <div
          className="relative aspect-[4/5] w-full overflow-hidden"
          style={{ backgroundColor: product.accent.bg }}
        >
          {cover && cover.url ? (
            <Image
              src={cover.url}
              alt={cover.alt || product.title}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              placeholder={cover.lqip ? "blur" : "empty"}
              blurDataURL={cover.lqip ?? undefined}
              className={
                "object-cover transition-transform duration-500 group-hover:scale-[1.02] " +
                (isSoldOut ? "grayscale" : "")
              }
            />
          ) : (
            <span
              aria-hidden
              className="absolute inset-0 grid place-items-center text-7xl sm:text-8xl"
            >
              {product.accent.emoji}
            </span>
          )}
          {isSoldOut && (
            <span className="absolute inset-x-0 top-1/2 -translate-y-1/2 bg-balna-ink/85 py-2 text-center text-sm font-extrabold uppercase tracking-[0.2em] text-white">
              {dict.product.soldOut}
            </span>
          )}
          {savings !== null && !isSoldOut && (
            <span className="absolute start-3 top-3 rounded-full bg-balna-navy px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-white">
              {format(dict.product.savings, { percent: savings })}
            </span>
          )}
          <span className="absolute end-3 top-3 rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-semibold text-balna-ink">
            {dict.condition[product.condition]}
          </span>
        </div>

        <div className="flex flex-1 flex-col gap-3 p-4">
          <div>
            <p
              dir={lang === "ar" ? "ltr" : undefined}
              className="text-xs font-semibold uppercase tracking-wider text-balna-teal-dark"
            >
              {product.brand}
            </p>
            <h3
              dir={lang === "ar" ? "ltr" : undefined}
              className="mt-1 line-clamp-2 text-base font-semibold text-balna-ink"
            >
              {product.title}
            </h3>
          </div>

          <div className="flex items-baseline gap-2" dir="ltr">
            <span className="text-xl font-extrabold text-balna-ink">
              ${product.price}
            </span>
            {product.originalPrice && (
              <span className="text-sm text-balna-muted line-through">
                ${product.originalPrice}
              </span>
            )}
          </div>

          <p className="text-xs text-balna-muted">
            {dict.size.label}: {localizedSizes}
          </p>

          <button
            type="button"
            onClick={() => setOpen(true)}
            disabled={isSoldOut}
            className={[
              "mt-auto inline-flex h-12 items-center justify-center gap-2 rounded-full text-sm font-semibold transition active:scale-[0.99]",
              isSoldOut
                ? "cursor-not-allowed bg-balna-line text-balna-muted"
                : "bg-balna-whatsapp text-white hover:bg-balna-whatsapp-dark",
            ].join(" ")}
          >
            {isSoldOut ? dict.product.soldOut : dict.product.buy}
          </button>
        </div>
      </article>

      <CheckoutModal
        open={open}
        onClose={() => setOpen(false)}
        product={product}
        whatsappHref={wa}
        settings={settings}
        dict={dict}
      />
    </>
  );
}
