import { ImageResponse } from "next/og";
import { notFound } from "next/navigation";
import { getDictionary, hasLocale } from "@/lib/i18n";
import { LOCALE_META, type Locale } from "@/lib/i18n-config";

export const alt = "Balna — Pre-loved branded thrift, made simple";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * Generate the params for the static-shell OG image. Two files baked at
 * build time — one for /en, one for /ar — and served with strong CDN headers.
 */
export function generateImageMetadata() {
  return [{ id: "default", alt, size, contentType }];
}

/**
 * Fetches a single weight of a Google Font as a binary buffer.
 *
 * Two-step dance:
 *   1. Hit the CSS endpoint with a desktop UA so it returns woff2.
 *   2. Pull the woff2 URL out of the CSS and fetch its bytes.
 *
 * Optionally subsetted to `text` to keep the binary tiny.
 */
async function loadFont(
  family: string,
  weight: number,
  text?: string,
): Promise<ArrayBuffer> {
  const cssUrl = new URL("https://fonts.googleapis.com/css2");
  cssUrl.searchParams.set("family", `${family}:wght@${weight}`);
  cssUrl.searchParams.set("display", "swap");
  if (text) cssUrl.searchParams.set("text", text);

  const css = await fetch(cssUrl, {
    headers: {
      // UA must look modern or Google returns TTF instead of woff2.
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    },
    cache: "force-cache",
  }).then((r) => r.text());

  const fontUrl = css.match(/url\((https:[^)]+\.woff2?)\)/)?.[1];
  if (!fontUrl) throw new Error(`Google font not found for ${family}@${weight}`);
  return fetch(fontUrl, { cache: "force-cache" }).then((r) => r.arrayBuffer());
}

export default async function OgImage({
  params,
}: {
  params: { lang: string };
}) {
  if (!hasLocale(params.lang)) notFound();
  const lang = params.lang as Locale;
  const dict = await getDictionary(lang);
  const meta = LOCALE_META[lang];

  const heading = dict.hero.title;
  const subline = dict.hero.subtitle;
  const eyebrow = dict.hero.eyebrow;

  // Subset the binary to just the glyphs that appear on the card to keep the
  // download under ~30KB. Includes Latin "Balna" wordmark + locale text.
  const subset = "Balna" + heading + subline + eyebrow;
  const family = lang === "ar" ? "Cairo" : "Plus+Jakarta+Sans";

  const [bold, extraBold] = await Promise.all([
    loadFont(family, 700, subset),
    loadFont(family, 800, subset),
  ]);

  const isRtl = meta.dir === "rtl";

  return new ImageResponse(
    (
      <div
        lang={meta.htmlLang}
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background:
            "linear-gradient(135deg, #fbf9f5 0%, #f3f7f6 60%, #e9f8f4 100%)",
          padding: "72px 88px",
          fontFamily: "BalnaDisplay",
          color: "#0d1126",
          direction: isRtl ? "rtl" : "ltr",
        }}
      >
        {/* Top row: wordmark + eyebrow chip */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
          }}
        >
          <Wordmark />
          <span
            style={{
              fontSize: 22,
              fontWeight: 700,
              color: "#0c9281",
              background: "#ffffff",
              padding: "10px 22px",
              borderRadius: 999,
              letterSpacing: "0.05em",
              textTransform: "uppercase",
              boxShadow: "0 2px 4px rgba(13,17,38,0.04)",
            }}
          >
            {eyebrow}
          </span>
        </div>

        {/* Middle: hero copy */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 24,
            maxWidth: "82%",
          }}
        >
          <div
            style={{
              fontSize: 88,
              fontWeight: 800,
              lineHeight: 1.05,
              letterSpacing: "-0.02em",
            }}
          >
            {heading}
          </div>
          <div
            style={{
              fontSize: 32,
              fontWeight: 500,
              lineHeight: 1.35,
              color: "#3a4264",
              maxWidth: 880,
            }}
          >
            {subline}
          </div>
        </div>

        {/* Bottom: tagline + decorative dots */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
          }}
        >
          <div
            style={{
              fontSize: 24,
              fontWeight: 700,
              color: "#1a2a52",
              letterSpacing: "0.02em",
            }}
          >
            {dict.footer.tagline}
          </div>
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <span
              style={{
                width: 18,
                height: 18,
                borderRadius: 999,
                background: "#11b79f",
              }}
            />
            <span
              style={{
                width: 28,
                height: 28,
                borderRadius: 999,
                background: "#1a2a52",
              }}
            />
            <span
              style={{
                width: 22,
                height: 22,
                borderRadius: 999,
                background: "#25d366",
              }}
            />
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "BalnaDisplay", data: bold, style: "normal", weight: 700 },
        { name: "BalnaDisplay", data: extraBold, style: "normal", weight: 800 },
      ],
    },
  );
}

/* The wordmark is rendered as inline JSX so it lives inside Satori's flexbox
   tree — no SVG required, and it preserves the brand's two-tone identity. */
function Wordmark() {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        fontFamily: "BalnaDisplay",
        fontWeight: 800,
        fontSize: 64,
        letterSpacing: "-0.02em",
        // Force LTR — the brand always reads "Balna", even on RTL OG cards.
        direction: "ltr",
      }}
    >
      <span style={{ color: "#11b79f" }}>Bal</span>
      <span style={{ color: "#1a2a52" }}>na</span>
    </div>
  );
}
