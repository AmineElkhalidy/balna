# Minor Shop — Mobile

Native Android (and incidentally iOS / web) companion to the Next.js storefront.
Same brand, same Sanity dataset, same WhatsApp checkout — wrapped in a real
React Native app so it can ship to the Play Store.

## Stack

| | |
|---|---|
| Runtime | Expo SDK 56 · React Native 0.85 · React 19.2 · New Architecture |
| Routing | Expo Router 6 (file-based, similar to Next.js App Router) |
| Styling | NativeWind 4.2 (Tailwind v3 syntax inside RN) + brand tokens mirrored from the web |
| Data | `@sanity/client` against project `enrmb3v3`, dataset `production` |
| i18n | EN + AR (Darija) via the same `dictionaries/{en,ar}.json` files; RTL flip via `I18nManager` |
| Distribution | EAS Build → APK for dev, AAB for Play Store |

## Project layout

```
mobile/
├── app/                    Expo Router file-based screens
│   ├── _layout.tsx           Root: fonts, splash, locale provider, Stack
│   ├── index.tsx             Catalog (home) — sticky filter bar + grid
│   ├── quiz.tsx              Quick-find 4-step wizard
│   └── +not-found.tsx
├── components/             Re-usable UI
│   ├── Header.tsx            Wordmark + audience tabs + Quick-find pill
│   ├── AudienceTabs.tsx      All / Men / Kids
│   ├── CategoryFilter.tsx    Horizontal scroll-rail of category chips
│   ├── SortPicker.tsx        Newest / Price asc / Price desc modal
│   ├── ProductCard.tsx       Tile in the grid; opens CheckoutSheet on press
│   ├── CheckoutSheet.tsx     WhatsApp + bank transfer modal
│   ├── EmptyState.tsx        "Our first drop is on its way" + WhatsApp CTA
│   ├── Wordmark.tsx          "M ı nor Shop" with the hanger tittle
│   ├── LangSwitcher.tsx      EN ↔ AR pill (forces JS reload when flipping RTL)
│   ├── quiz/Quiz.tsx         Coordinator for the 4-step flow
│   └── icons/Ionicon.tsx     Thin alias around @expo/vector-icons
├── lib/
│   ├── catalog.ts            Audience/Category/Size constants + types (mirrors web)
│   ├── useCatalogFilter.ts   Filter state hook for the catalog screen
│   ├── whatsapp.ts           Native deep-link composer + reference-code helper
│   ├── i18n/                 Locale persistence + React Context provider
│   └── sanity/               Client + GROQ queries + product/settings fetchers
├── dictionaries/{en,ar}.json Same files as the web app
├── assets/                   App icon, splash, adaptive icon (placeholders)
├── scripts/
│   ├── gen-placeholder-assets.mjs   Generates the placeholder PNGs (run once)
│   └── open-metro-firewall.ps1      Opens TCP 8081 on Windows for the dev client
├── app.json                  Expo config (name, slug, plugins, projectId)
├── eas.json                  Build profiles: development / preview / production
├── tailwind.config.js        Brand tokens
├── babel.config.js           NativeWind + Reanimated 4 wiring
├── metro.config.js           withNativeWind wrapper
└── global.css                Tailwind directives
```

## Setup

```bash
cd mobile
npm install
node scripts/gen-placeholder-assets.mjs   # renders branded icon/splash/favicon PNGs from inline SVG
cp .env.local.example .env.local          # then fill in EXPO_PUBLIC_MINOR_WHATSAPP
```

> The asset script reads `node_modules/@expo-google-fonts/plus-jakarta-sans/800ExtraBold/PlusJakartaSans_800ExtraBold.ttf`
> directly to render the wordmark with the same typeface the running app uses.
> Re-run the script any time you tweak the SVG constants in
> `scripts/gen-placeholder-assets.mjs` — output goes to `assets/`.

`.env.local` is already pre-populated with the production Sanity project ID
and dataset (the same ones the web app uses). The only value you'll typically
edit is `EXPO_PUBLIC_MINOR_WHATSAPP` — your business WhatsApp number in
international format, no leading `+`.

## Run

### Dev server (Metro)

```bash
npx expo start
```

This serves bundles for the dev client on TCP `8081` and a web preview at
`http://localhost:8081`. The dev server auto-reloads on every file save (Fast
Refresh).

### Android dev client (real device)

Expo Go from the Play Store **does not yet support SDK 56** (as of June 2026).
You need a one-time custom dev client APK built via EAS Build:

```bash
npx eas-cli login
npx eas-cli build --profile development --platform android
```

The first build takes ~10 minutes (free tier queues during peak hours).
You'll get a download URL — install the APK on your phone (allow "install from
unknown sources" on first run). After that, your phone keeps the dev client;
re-install only when native deps change.

To connect the dev client to Metro:

1. Phone + laptop on the **same Wi-Fi**.
2. On Windows, open inbound TCP 8081 once:

   ```powershell
   # From an Administrator PowerShell, in the mobile/ folder:
   powershell -ExecutionPolicy Bypass -File scripts/open-metro-firewall.ps1
   ```

3. `npx expo start` on your laptop, then open the Minor Shop dev client on
   your phone — it'll auto-discover the project (or paste `exp://<your-LAN-IP>:8081`).

### Web preview (instant, browser-based)

Hit `http://localhost:8081/` in any browser while `npx expo start` is running.
Useful for quickly verifying UI changes without the dev-client round-trip.

## Sanity

This app reads from the same Sanity project + dataset as the web. To populate
demo content (8 brands, 12 products, site settings) run from the **project
root** (one level up from `mobile/`):

```bash
node scripts/seed-sanity.mjs
```

You'll need a `SANITY_WRITE_TOKEN` in the root `.env.local` (the editor token
you create at https://www.sanity.io/manage/project/enrmb3v3/api/tokens).

To inspect or add real products, open the embedded Studio at
`http://localhost:3000/studio` while the **web** dev server is running.

## Building for the Play Store

```bash
npx eas-cli build --profile production --platform android
```

That produces an **`.aab`** (Android App Bundle) signed with the EAS-managed
upload keystore. Submit it via:

```bash
npx eas-cli submit --profile production --platform android
```

…or upload manually through the Play Console.

## Troubleshooting

- **Build queues forever**: free-tier EAS Build can queue up to ~30 min during
  peak hours. Check status at https://expo.dev/accounts/<your-username>/projects/minor-shop/builds.

- **Metro crashes with `ENOENT … @isaacs/.fs-minipass-…`**: a known
  Metro-on-Windows quirk where the file watcher trips over npm's temp
  staging directories. Restart with `npx expo start --clear`.

- **Phone can't connect to Metro**: run the firewall opener
  (`scripts/open-metro-firewall.ps1`) once. Confirm your phone is on the
  *same* Wi-Fi (not 4G or a guest network).

- **Layout doesn't flip when switching to AR**: that's intentional — RN can't
  safely flip RTL mid-session. The `LangSwitcher` shows an alert asking you
  to relaunch.

- **`expo-doctor` complains "EAS CLI installed locally"**: don't `npm install
  eas-cli` here. Use `npx eas-cli …` (it's a remote/self-installing tool).

- **NativeWind classes don't apply in `_layout.tsx`**: known race condition
  between NativeWind's CSS interop and Expo Router's nav context. We use
  inline styles in the root layout instead — keep className-driven styling
  in screen-level components only.

## Tooling

| | |
|---|---|
| `npm run start` | Boot Metro bundler |
| `npm run android` | Boot Metro and try to launch on an attached Android device |
| `npm run web` | Web preview |
| `npm run lint` | ESLint via `expo lint` |
| `npm run doctor` | `npx expo-doctor` — sanity-checks dependencies + config |
| `node scripts/gen-placeholder-assets.mjs` | Regen branded icon + splash + favicon (uses `@resvg/resvg-js`) |
| `node scripts/open-metro-firewall.ps1` | Open inbound TCP 8081 on Windows |

## Brand parity

The brand identity is intentionally identical across web and mobile:

- **Wordmark**: "Minor Shop" with a dotless `ı` and a tiny clothes-hanger
  tittle. Forced LTR even on AR screens.
- **Palette**: teal `#11b79f`, navy `#1a2a52`, cream `#fbf9f5`, paper
  `#ffffff`, line `#e7e3d8`, WhatsApp green `#25d366`.
- **Display font**: Plus Jakarta Sans 800. Body: Jakarta 500/600/700.
  Arabic copy switches to Cairo at the same weights.

If you change a token in the web's `app/globals.css`, mirror it in
`mobile/tailwind.config.js` `theme.extend.colors` so the two surfaces stay
in lockstep.
