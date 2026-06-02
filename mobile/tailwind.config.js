// Tailwind config for the mobile app. Mirrors the web app's brand tokens so
// teal, navy, cream, and the display font behave identically across platforms.
//
// We intentionally re-declare the palette here (instead of importing from the
// web app's tailwind config) because:
//   1. NativeWind v4 uses Tailwind v3, while the web is on Tailwind v4 — the
//      config schemas differ slightly.
//   2. RN doesn't need every utility (no aspect ratios beyond a few, no
//      cursor variants, etc.) so a leaner config keeps the runtime class
//      table small.
//
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./lib/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // Brand — kept in sync with web: app/globals.css :root.
        "balna-cream": "#fbf9f5",
        "balna-paper": "#ffffff",
        "balna-ink": "#0d1126",
        "balna-muted": "#5b6379",
        "balna-line": "#e7e3d8",
        "balna-teal": "#11b79f",
        "balna-teal-dark": "#0c9281",
        "balna-teal-soft": "#e9f8f4",
        "balna-navy": "#1a2a52",
        "balna-navy-dark": "#0f1d3d",
        "balna-whatsapp": "#25d366",
        "balna-whatsapp-dark": "#1ebd5b",
        "balna-sand": "#f3efe5",
      },
      fontFamily: {
        // Loaded via expo-font in app/_layout.tsx. Falls back to the system
        // sans/UI font if the network blob hasn't streamed in yet.
        sans: ["PlusJakartaSans_400Regular", "System"],
        "sans-medium": ["PlusJakartaSans_500Medium", "System"],
        "sans-semibold": ["PlusJakartaSans_600SemiBold", "System"],
        "sans-bold": ["PlusJakartaSans_700Bold", "System"],
        "sans-extrabold": ["PlusJakartaSans_800ExtraBold", "System"],
        display: ["PlusJakartaSans_800ExtraBold", "System"],
        "ar-sans": ["Cairo_400Regular", "System"],
        "ar-bold": ["Cairo_700Bold", "System"],
        "ar-extrabold": ["Cairo_800ExtraBold", "System"],
      },
    },
  },
  plugins: [],
};
