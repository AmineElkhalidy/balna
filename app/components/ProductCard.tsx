import Link from "next/link";
import { whatsappLinkForProduct } from "@/lib/whatsapp";
import { ACCESSORIES_SIZE, type Product } from "@/lib/catalog";
import type { Dictionary } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n-config";
import { format } from "@/lib/format";

interface ProductCardProps {
  product: Product;
  lang: Locale;
  dict: Dictionary;
}

export function ProductCard({ product, lang, dict }: ProductCardProps) {
  const wa = whatsappLinkForProduct(product, dict);
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

  return (
    <article className="group flex flex-col overflow-hidden rounded-3xl bg-white shadow-[var(--shadow-card)] ring-1 ring-balna-line/60 transition hover:-translate-y-0.5 hover:shadow-[var(--shadow-pop)]">
      <div
        className="relative aspect-[4/5] w-full overflow-hidden"
        style={{ backgroundColor: product.accent.bg }}
      >
        <span
          aria-hidden
          className="absolute inset-0 grid place-items-center text-7xl sm:text-8xl"
        >
          {product.accent.emoji}
        </span>
        {savings !== null && (
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

        <Link
          href={wa}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-auto inline-flex h-12 items-center justify-center gap-2 rounded-full bg-balna-whatsapp px-4 text-sm font-semibold text-white transition hover:bg-balna-whatsapp-dark active:scale-[0.99]"
        >
          <WhatsAppIcon className="h-4 w-4" />
          {dict.product.buy}
        </Link>
      </div>
    </article>
  );
}

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <path d="M19.11 4.91A10 10 0 0 0 4.05 18.27L3 22l3.83-1A10 10 0 1 0 19.1 4.92ZM12 20.13a8.13 8.13 0 0 1-4.13-1.13l-.3-.18-2.27.6.61-2.21-.2-.32A8.13 8.13 0 1 1 12 20.13Zm4.45-6.07c-.24-.12-1.44-.71-1.66-.79s-.39-.12-.55.12-.63.79-.78.95-.29.18-.53.06a6.66 6.66 0 0 1-3.34-2.93c-.25-.43.25-.4.72-1.34a.45.45 0 0 0 0-.43c-.06-.12-.55-1.32-.75-1.81s-.4-.41-.55-.42h-.47a.9.9 0 0 0-.65.3 2.74 2.74 0 0 0-.86 2.05 4.78 4.78 0 0 0 1 2.55 11 11 0 0 0 4.21 3.71c.59.26 1 .41 1.4.53a3.41 3.41 0 0 0 1.55.1 2.54 2.54 0 0 0 1.66-1.18 2.06 2.06 0 0 0 .14-1.18c-.06-.1-.22-.16-.46-.28Z" />
    </svg>
  );
}
