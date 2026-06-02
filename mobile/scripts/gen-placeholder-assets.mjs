/**
 * Generate Minor Shop's mobile asset PNGs from inline SVG markup.
 *
 *   - icon.png            (1024×1024)   teal bg, white "MS" monogram + tiny wordmark
 *   - adaptive-icon.png   (1024×1024)   transparent bg, teal "MS" monogram + wordmark
 *                                       (Android masks the outer ~17 % per side)
 *   - splash.png          (1024×1024)   transparent bg, "MS" mark + full brand wordmark
 *   - favicon.png         (   48× 48)   teal bg, tiny white "MS" monogram
 *   - splash-bg.png       (   16× 16)   solid cream tile (rare fallback use)
 *
 * The "MS" monogram is the brand mark — the first letters of "Minor Shop" set
 * in Plus Jakarta Sans 800 ExtraBold with a tight negative tracking so the M
 * and S read as a single bonded glyph at every size. Brand colours mirror the
 * running app's tokens.
 *
 * Run:
 *   cd mobile
 *   node ./scripts/gen-placeholder-assets.mjs
 *
 * Re-run any time you tweak the design constants below.
 */
import { writeFileSync, mkdirSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { Resvg } from "@resvg/resvg-js";

const HERE = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = resolve(HERE, "..", "assets");
mkdirSync(OUT_DIR, { recursive: true });

// ── Brand palette (mirrors web/mobile tailwind tokens) ────────────────────
const TEAL = "#11b79f";
const NAVY = "#1a2a52";
const CREAM = "#fbf9f5";

// ── Font (loaded from the already-installed Google Fonts package) ─────────
const FONT_TTF = resolve(
  HERE,
  "..",
  "node_modules",
  "@expo-google-fonts",
  "plus-jakarta-sans",
  "800ExtraBold",
  "PlusJakartaSans_800ExtraBold.ttf",
);
if (!existsSync(FONT_TTF)) {
  console.error(
    `✖ Couldn't find Plus Jakarta Sans 800 at:\n   ${FONT_TTF}\n` +
      `   Run \`npm install\` first so @expo-google-fonts/plus-jakarta-sans is on disk.`,
  );
  process.exit(1);
}

// ── "MS" monogram ─────────────────────────────────────────────────────────
//
// Plus Jakarta Sans 800 ExtraBold, tight negative tracking so the M + S
// touch and read as a single mark. The text is rendered via the resvg
// rasterizer using the locally-bundled TTF (loaded below).
//
// `centerX` / `baselineY` are in the parent SVG's user units — the caller
// is responsible for picking a position that makes sense for that canvas.
function monogramSvg({ fill, fontSize, centerX, baselineY, letterSpacing = -8 }) {
  return `
    <text x="${centerX}" y="${baselineY}"
          font-family="Plus Jakarta Sans"
          font-weight="800"
          font-size="${fontSize}"
          letter-spacing="${letterSpacing}"
          fill="${fill}"
          text-anchor="middle">MS</text>
  `;
}

// ── SVG compositions ──────────────────────────────────────────────────────

/**
 * Square launcher icon (Play Store, app drawer, iOS home screen, etc.).
 * Full-bleed teal background, big white "MS" monogram, with a small tracked
 * "MINOR SHOP" wordmark below for additional context at large sizes.
 *
 * Layout uses a 1024×1024 canvas with ~120 px safe-zone margin so the mark
 * survives Android's circular / squircle / rounded-rect mask treatments.
 */
function iconSvg() {
  return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024">
      <rect width="1024" height="1024" fill="${TEAL}" />
      ${monogramSvg({
        fill: "white",
        fontSize: 600,
        centerX: 512,
        baselineY: 660,
        letterSpacing: -28,
      })}
      <text x="512" y="820"
            font-family="Plus Jakarta Sans"
            font-weight="800"
            font-size="78"
            letter-spacing="14"
            fill="rgba(255,255,255,0.95)"
            text-anchor="middle">MINOR SHOP</text>
    </svg>
  `;
}

/**
 * Adaptive-icon foreground. Background is cream (set in app.json); we draw
 * a teal monogram + wordmark on transparent so Android's mask can paint the
 * cream behind it.
 *
 * Everything sits inside the inner ~66 % safe area Android guarantees not
 * to crop — i.e. roughly the central 683×683 of the 1024×1024 canvas.
 */
function adaptiveIconSvg() {
  return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024">
      ${monogramSvg({
        fill: TEAL,
        fontSize: 460,
        centerX: 512,
        baselineY: 600,
        letterSpacing: -22,
      })}
      <text x="512" y="730"
            font-family="Plus Jakarta Sans"
            font-weight="800"
            font-size="60"
            letter-spacing="11"
            fill="${TEAL}"
            text-anchor="middle">MINOR SHOP</text>
    </svg>
  `;
}

/**
 * Splash logo used by expo-splash-screen at imageWidth=180. We render at
 * 1024×1024 transparent so Expo can scale it without aliasing.
 *
 * Stack:
 *   1. Large "MS" monogram (teal) — the brand mark
 *   2. Two-tone "Minor Shop" wordmark below (teal "Minor" + navy "Shop")
 */
function splashSvg() {
  return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024">
      ${monogramSvg({
        fill: TEAL,
        fontSize: 380,
        centerX: 512,
        baselineY: 550,
        letterSpacing: -18,
      })}
      <text x="512" y="710"
            font-family="Plus Jakarta Sans"
            font-weight="800"
            font-size="120"
            letter-spacing="-3"
            text-anchor="middle">
        <tspan fill="${TEAL}">Minor</tspan><tspan fill="${NAVY}"> Shop</tspan>
      </text>
    </svg>
  `;
}

/** Tiny web favicon — just the "MS" monogram on a teal rounded square. */
function faviconSvg() {
  return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
      <rect width="64" height="64" rx="12" fill="${TEAL}" />
      ${monogramSvg({
        fill: "white",
        fontSize: 44,
        centerX: 32,
        baselineY: 47,
        letterSpacing: -2,
      })}
    </svg>
  `;
}

/** Pure-cream backdrop tile (rarely used; kept for backwards compat). */
function splashBgSvg() {
  return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16">
      <rect width="16" height="16" fill="${CREAM}" />
    </svg>
  `;
}

// ── Renderer ──────────────────────────────────────────────────────────────
function render(svg, { width, background = "rgba(0,0,0,0)" }) {
  const resvg = new Resvg(svg, {
    fitTo: { mode: "width", value: width },
    background,
    font: {
      fontFiles: [FONT_TTF],
      loadSystemFonts: false,
      defaultFontFamily: "Plus Jakarta Sans",
    },
    shapeRendering: 2, // geometric precision
    textRendering: 1, // optimize legibility
    imageRendering: 0, // optimize quality
  });
  return resvg.render().asPng();
}

function write(name, png) {
  writeFileSync(resolve(OUT_DIR, name), png);
  console.log(`  ✓ ${name.padEnd(20)} ${png.length.toLocaleString()} bytes`);
}

console.log("Rendering Minor Shop assets to", OUT_DIR);
write("icon.png", render(iconSvg(), { width: 1024 }));
write("adaptive-icon.png", render(adaptiveIconSvg(), { width: 1024 }));
write("splash.png", render(splashSvg(), { width: 1024 }));
write("favicon.png", render(faviconSvg(), { width: 48 }));
write("splash-bg.png", render(splashBgSvg(), { width: 16 }));
console.log("Done.");
