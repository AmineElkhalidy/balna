/**
 * Seed Minor Shop's Sanity dataset with demo brands + products + site settings.
 *
 * Idempotent: every document has a stable `_id`, so re-running the script
 * UPDATES existing documents instead of duplicating them. Running it after
 * editing this file is a safe way to refresh the demo catalog.
 *
 * What it does NOT do:
 *   - Upload images. The app gracefully falls back to an emoji + accent tile
 *     when a product has no photos, so we keep the seed lightweight. Once
 *     you have real product photography, upload via Sanity Studio (the
 *     `/studio` route in the web app) — Studio handles asset CDN + LQIP for
 *     you out of the box.
 *
 * ──────────────────────────────────────────────────────────────────────────
 *
 * SETUP (one-time):
 *
 *   1. Open https://www.sanity.io/manage/project/enrmb3v3/api
 *   2. "Add API token" → name "Seed script" → role "Editor" → Create.
 *   3. Copy the token (you only see it once!).
 *   4. Add to .env.local at the project root:
 *
 *        SANITY_WRITE_TOKEN=skXXXXXXXXXXXXXXXXXXXXXXXXX
 *
 *      (Already gitignored. Never commit this token.)
 *
 * RUN:
 *
 *      node scripts/seed-sanity.mjs            # uses NEXT_PUBLIC_SANITY_*
 *      node scripts/seed-sanity.mjs --reset    # also DELETES every existing
 *                                              # product/brand/siteSettings
 *                                              # before seeding (clean slate)
 *
 *   Read env from `.env.local`:
 *
 *      Bash:        export $(grep -v '^#' .env.local | xargs) && node scripts/seed-sanity.mjs
 *      PowerShell:  Get-Content .env.local | ForEach-Object {
 *                     if ($_ -match '^(?!#)([^=]+)=(.*)$') {
 *                       [Environment]::SetEnvironmentVariable($matches[1].Trim(), $matches[2].Trim())
 *                     }
 *                   }; node scripts/seed-sanity.mjs
 */
import { createClient } from "@sanity/client";
import { readFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, "..");

// ── Lightweight .env.local loader ─────────────────────────────────────────
// Doesn't depend on `dotenv`; just parses KEY=VALUE pairs. Skips comments and
// blank lines. Won't override variables that are already set in the shell.
function loadEnvLocal() {
  const path = resolve(ROOT, ".env.local");
  if (!existsSync(path)) return;
  for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (!m) continue;
    const [, key, raw] = m;
    if (process.env[key]) continue;
    process.env[key] = raw.replace(/^['"]|['"]$/g, "");
  }
}
loadEnvLocal();

const projectId =
  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ??
  process.env.EXPO_PUBLIC_SANITY_PROJECT_ID;
const dataset =
  process.env.NEXT_PUBLIC_SANITY_DATASET ??
  process.env.EXPO_PUBLIC_SANITY_DATASET ??
  "production";
const token = process.env.SANITY_WRITE_TOKEN;

if (!projectId) {
  console.error(
    "✖ Missing NEXT_PUBLIC_SANITY_PROJECT_ID. Add it to .env.local.",
  );
  process.exit(1);
}
if (!token) {
  console.error(
    "✖ Missing SANITY_WRITE_TOKEN. See the setup steps in the header of this script.",
  );
  process.exit(1);
}

const client = createClient({
  projectId,
  dataset,
  token,
  apiVersion: "2024-09-01",
  useCdn: false, // writes always hit the live API
});

// ── Helpers ───────────────────────────────────────────────────────────────
const slug = (current) => ({ _type: "slug", current });
const ref = (id) => ({ _type: "reference", _ref: id });

// ── Brand catalogue ──────────────────────────────────────────────────────
//
// Stable IDs of the form `brand.<slug>` so re-runs upsert instead of dup.
// Accent colours come from each brand's well-known palette so the empty-
// image fallback tile feels intentional, not generic.
const BRANDS = [
  { id: "brand.adidas",     name: "Adidas",         accentBg: "#e2f0ff", accentFg: "#0d1126" },
  { id: "brand.nike",       name: "Nike",           accentBg: "#f4f4f4", accentFg: "#0d1126" },
  { id: "brand.uniqlo",     name: "Uniqlo",         accentBg: "#ffe9e9", accentFg: "#aa0000" },
  { id: "brand.northface",  name: "The North Face", accentBg: "#d8efe8", accentFg: "#1a2a52" },
  { id: "brand.carhartt",   name: "Carhartt",       accentBg: "#f4ead2", accentFg: "#5a3b18" },
  { id: "brand.rayban",     name: "Ray-Ban",        accentBg: "#dee2f1", accentFg: "#0d1126" },
  { id: "brand.levis",      name: "Levi's",         accentBg: "#f8e8d4", accentFg: "#7a3a1a" },
  { id: "brand.zara",       name: "Zara",           accentBg: "#0d1126", accentFg: "#ffffff" },
];

// ── Product catalogue ─────────────────────────────────────────────────────
//
// IDs follow `product.<audience>-<short>` so they sort predictably in
// Studio's list view and re-runs cleanly upsert.
const PRODUCTS = [
  // ── Men ─────────────────────────────────────────────────────────────────
  {
    id: "product.m-adidas-samba",
    title: "Samba OG Trainers",
    brand: "brand.adidas",
    audience: "men",
    category: "shoes",
    sizes: ["41", "42", "43", "44"],
    price: 62,
    originalPrice: 110,
    description:
      "Iconic black-and-white Samba OG. Hand-picked from our Turkey supplier. Light wear on the toe-cap, pristine soles.",
  },
  {
    id: "product.m-nike-airforce",
    title: "Air Force 1 '07",
    brand: "brand.nike",
    audience: "men",
    category: "shoes",
    sizes: ["42", "43", "44", "45"],
    price: 78,
    originalPrice: 120,
    description:
      "Classic all-white Air Force 1. Sourced from China — boxed, never worn outdoors.",
  },
  {
    id: "product.m-northface-nuptse",
    title: "Nuptse 700 Puffer",
    brand: "brand.northface",
    audience: "men",
    category: "jackets",
    sizes: ["M", "L", "XL"],
    price: 95,
    originalPrice: 280,
    description:
      "Heritage 700-fill puffer. Charcoal colourway. Warmth-to-weight ratio you cannot beat at this price.",
  },
  {
    id: "product.m-uniqlo-oxford",
    title: "Oxford Button-down Shirt",
    brand: "brand.uniqlo",
    audience: "men",
    category: "shirts",
    sizes: ["S", "M", "L", "XL"],
    price: 12,
    originalPrice: 39,
    description:
      "Soft Oxford cotton, regular fit. Light blue. Pairs with everything.",
  },
  {
    id: "product.m-carhartt-doubleknee",
    title: "Double-knee Work Pants",
    brand: "brand.carhartt",
    audience: "men",
    category: "pants",
    sizes: ["32", "34", "36", "38"],
    price: 34,
    originalPrice: 89,
    description: "Workwear staple. Hammer loop, 12oz duck canvas, hawthorne brown.",
  },
  {
    id: "product.m-rayban-wayfarer",
    title: "Wayfarer Sunglasses",
    brand: "brand.rayban",
    audience: "men",
    category: "accessories",
    sizes: ["One Size"],
    price: 45,
    originalPrice: 165,
    description: "Original Wayfarer in black with green G-15 lenses. Includes case.",
  },
  {
    id: "product.m-levis-501",
    title: "501 Original Jeans",
    brand: "brand.levis",
    audience: "men",
    category: "pants",
    sizes: ["30", "32", "34", "36"],
    price: 38,
    originalPrice: 95,
    description: "Mid-blue wash, straight leg, button fly. The original.",
  },
  // ── Kids ────────────────────────────────────────────────────────────────
  {
    id: "product.k-adidas-sneakers",
    title: "Stan Smith Kids",
    brand: "brand.adidas",
    audience: "kids",
    category: "shoes",
    sizes: ["4-6y", "6-8y", "8-10y"],
    price: 25,
    originalPrice: 55,
    description: "Classic white Stan Smiths in toddler sizes. Easy-on velcro variant.",
  },
  {
    id: "product.k-nike-hoodie",
    title: "Tech Fleece Hoodie",
    brand: "brand.nike",
    audience: "kids",
    category: "jackets",
    sizes: ["6-8y", "8-10y", "10-12y"],
    price: 22,
    originalPrice: 60,
    description: "Lightweight fleece hoodie, charcoal. Soft inside, smooth outside.",
  },
  {
    id: "product.k-uniqlo-tees",
    title: "Crewneck T-Shirt 3-Pack",
    brand: "brand.uniqlo",
    audience: "kids",
    category: "shirts",
    sizes: ["4-6y", "6-8y", "8-10y", "10-12y"],
    price: 15,
    originalPrice: 35,
    description: "White / navy / heather grey. 100% combed cotton. The basics done right.",
  },
  {
    id: "product.k-zara-cargo",
    title: "Cargo Pants",
    brand: "brand.zara",
    audience: "kids",
    category: "pants",
    sizes: ["4-6y", "6-8y", "8-10y"],
    price: 18,
    originalPrice: 45,
    description: "Olive cargo pants with elasticated waist. Roomy through the knee.",
  },
  {
    id: "product.k-levis-denim-jacket",
    title: "Trucker Denim Jacket",
    brand: "brand.levis",
    audience: "kids",
    category: "jackets",
    sizes: ["6-8y", "8-10y", "10-12y"],
    price: 28,
    originalPrice: 75,
    description: "Indigo trucker jacket. Lightly faded for that worn-in look.",
  },
];

// ── Site settings ─────────────────────────────────────────────────────────
//
// Singleton document — Sanity Studio's structure forces `_id: "siteSettings"`,
// so we use the same ID here. Update the values to match your real account
// before going live.
const SITE_SETTINGS = {
  _id: "siteSettings",
  _type: "siteSettings",
  whatsappNumber: process.env.EXPO_PUBLIC_MINOR_WHATSAPP || "212600000000",
  bankTransfer: {
    bankName: "Attijariwafa Bank",
    accountHolder: "Minor Shop SARL",
    iban: "MA00 0000 0000 0000 0000 0000",
    swift: "BCMAMAMC",
    instructions:
      "Use this reference: MS-#### (the 4-digit code shown on the checkout sheet). Send a screenshot of the transfer to our WhatsApp once done.",
  },
};

// ── Build documents ───────────────────────────────────────────────────────
function buildBrandDoc(b) {
  return {
    _id: b.id,
    _type: "brand",
    name: b.name,
    slug: slug(b.id.replace(/^brand\./, "")),
    accentBg: b.accentBg,
    accentFg: b.accentFg,
  };
}

function buildProductDoc(p) {
  return {
    _id: p.id,
    _type: "product",
    title: p.title,
    slug: slug(p.id.replace(/^product\./, "")),
    brand: ref(p.brand),
    audience: p.audience,
    category: p.category,
    sizes: p.sizes,
    price: p.price,
    ...(p.originalPrice ? { originalPrice: p.originalPrice } : {}),
    ...(p.description ? { description: p.description } : {}),
    isSoldOut: false,
    // images intentionally omitted — Studio's `min(1)` is editor-time only;
    // the GROQ query and the app handle empty arrays gracefully.
  };
}

// ── Main ──────────────────────────────────────────────────────────────────
const RESET = process.argv.includes("--reset");

(async () => {
  console.log(`Seeding Sanity project ${projectId} / dataset "${dataset}"\n`);

  if (RESET) {
    console.log("⚠ --reset: deleting every existing brand / product / siteSettings…");
    const deleted = await client.delete({
      query: '*[_type in ["product","brand","siteSettings"]]',
    });
    console.log(`   ${deleted.results?.length ?? 0} document(s) removed.\n`);
  }

  const tx = client.transaction();

  for (const b of BRANDS) tx.createOrReplace(buildBrandDoc(b));
  for (const p of PRODUCTS) tx.createOrReplace(buildProductDoc(p));
  tx.createOrReplace(SITE_SETTINGS);

  console.log(`Committing ${BRANDS.length} brands + ${PRODUCTS.length} products + 1 siteSettings…`);
  const result = await tx.commit({ visibility: "async" });
  console.log(`✓ Committed transaction ${result.transactionId}.\n`);

  console.log("Inventory now in Sanity:");
  const counts = await client.fetch(
    `{
      "brands": count(*[_type == "brand"]),
      "products": count(*[_type == "product"]),
      "siteSettings": count(*[_type == "siteSettings"])
    }`,
  );
  console.log(`   • brands:        ${counts.brands}`);
  console.log(`   • products:      ${counts.products}`);
  console.log(`   • siteSettings:  ${counts.siteSettings}`);
  console.log(
    `\nOpen Studio at http://localhost:3000/studio/structure to inspect, or hit your storefront — products should be live.`,
  );
})().catch((err) => {
  console.error("\n✖ Seed failed:", err.message);
  if (err.statusCode === 401 || err.statusCode === 403) {
    console.error(
      "   Your SANITY_WRITE_TOKEN is missing the Editor role for this dataset.",
    );
  }
  process.exit(1);
});
