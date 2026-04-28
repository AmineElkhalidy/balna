/**
 * Locale proxy.
 *
 * Next.js 16 renamed Middleware to "Proxy" — same shape, new file name.
 * This routes every visitor to a localised version of the page they asked for:
 *
 *   /              →  /en   (or /ar if their browser prefers Arabic)
 *   /shop?for=...  →  /en/shop?for=...
 *   /en/shop       →  pass-through
 *   /ar/shop       →  pass-through
 */
import { NextResponse, type NextRequest } from "next/server";

const LOCALES = ["en", "ar"] as const;
const DEFAULT_LOCALE = "en";

function pickLocale(req: NextRequest): (typeof LOCALES)[number] {
  const cookie = req.cookies.get("balna_locale")?.value;
  if (cookie && (LOCALES as readonly string[]).includes(cookie)) {
    return cookie as (typeof LOCALES)[number];
  }
  const accept = req.headers.get("accept-language") ?? "";
  // Cheap negotiation: just look for "ar" anywhere in the preference list.
  if (/\bar(?:-|;|,|$)/i.test(accept)) return "ar";
  return DEFAULT_LOCALE;
}

export function proxy(req: NextRequest) {
  const { pathname, search } = req.nextUrl;

  const hasLocale = LOCALES.some(
    (l) => pathname === `/${l}` || pathname.startsWith(`/${l}/`),
  );
  if (hasLocale) return NextResponse.next();

  const locale = pickLocale(req);
  const url = req.nextUrl.clone();
  url.pathname = `/${locale}${pathname === "/" ? "" : pathname}`;
  url.search = search;
  return NextResponse.redirect(url);
}

export const config = {
  // Skip Next internals, the favicon, the logo, and any file with an extension.
  matcher: ["/((?!_next/|api/|favicon\\.ico|logo\\.png|.*\\..*).*)"],
};
