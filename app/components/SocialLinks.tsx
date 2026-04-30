import { SOCIAL_LINKS, SOCIAL_ORDER, type SocialKey } from "@/lib/socials";
import type { Dictionary } from "@/lib/i18n";

/**
 * Icon row linking out to Balna's public social profiles.
 *
 * Two visual variants:
 *   • `header` — small monochrome icons, hidden on narrow viewports so the
 *     header doesn't feel crowded next to the language switcher.
 *   • `footer` — larger circular chips with a soft border, always visible.
 *
 * Icons are inlined as SVG (no icon-library dependency). They use
 * `currentColor`, so styling stays in the surrounding `<a>`'s Tailwind classes.
 */
export function SocialLinks({
  dict,
  variant,
  className = "",
}: {
  dict: Dictionary;
  variant: "header" | "footer";
  className?: string;
}) {
  const wrapper =
    variant === "header"
      ? `hidden items-center gap-1 sm:flex ${className}`
      : `flex items-center justify-center gap-2 ${className}`;

  return (
    <ul className={wrapper}>
      {SOCIAL_ORDER.map((key) => (
        <li key={key}>
          <a
            href={SOCIAL_LINKS[key].href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={dict.socials[key]}
            className={linkClass(variant)}
          >
            <Icon name={key} className="h-4 w-4" />
            <span className="sr-only">{dict.socials[key]}</span>
          </a>
        </li>
      ))}
    </ul>
  );
}

function linkClass(variant: "header" | "footer"): string {
  if (variant === "header") {
    return [
      "flex h-8 w-8 items-center justify-center rounded-full",
      "text-balna-muted transition",
      "hover:bg-balna-line/60 hover:text-balna-ink",
      "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-balna-teal",
    ].join(" ");
  }
  return [
    "flex h-10 w-10 items-center justify-center rounded-full",
    "border border-balna-line bg-white text-balna-muted transition",
    "hover:border-balna-teal hover:text-balna-teal-dark",
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-balna-teal",
  ].join(" ");
}

/* ────────────────────────────────────────────────────────────────────────── */
/*  Icons (inline SVG, currentColor)                                          */
/* ────────────────────────────────────────────────────────────────────────── */

function Icon({ name, className }: { name: SocialKey; className?: string }) {
  switch (name) {
    case "instagram":
      return <InstagramIcon className={className} />;
    case "facebook":
      return <FacebookIcon className={className} />;
    case "whatsapp":
      return <WhatsappIcon className={className} />;
  }
}

function InstagramIcon({ className }: { className?: string }) {
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
      <rect x="3" y="3" width="18" height="18" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden
    >
      <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c5.05-.5 9-4.76 9-9.95z" />
    </svg>
  );
}

function WhatsappIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
    </svg>
  );
}
