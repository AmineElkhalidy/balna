import type { Metadata, Viewport } from "next";
import { Geist, Plus_Jakarta_Sans, Cairo } from "next/font/google";
import { notFound } from "next/navigation";
import "../globals.css";
import {
  DEFAULT_LOCALE,
  LOCALES,
  LOCALE_META,
  hasLocale,
} from "@/lib/i18n";
import { BASE_KEYWORDS, SITE_NAME, SITE_URL, hreflangMap } from "@/lib/seo";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const display = Plus_Jakarta_Sans({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
});

// Cairo is a clean, friendly Arabic-script display + UI face. Loading once at
// the layout means RTL pages get correct shaping without runtime swaps.
const arabic = Cairo({
  variable: "--font-arabic",
  subsets: ["arabic", "latin"],
  weight: ["500", "600", "700", "800"],
});

const titles: Record<string, { title: string; description: string }> = {
  en: {
    title: "Balna — Pre-loved branded thrift, made simple",
    description:
      "Shop pre-owned branded clothing from Balna. Answer 4 quick questions and we show you only what fits — buy via WhatsApp or bank transfer.",
  },
  ar: {
    title: "Balna — حوايج ماركات مستعملة، بسيطة وسهلة",
    description:
      "تسوق حوايج ماركات مستعملة من Balna. جاوب على 4 أسئلة وغانوريوك غير اللي يناسبك — شراء عبر واتساب ولا تحويل بنكي.",
  },
};

const localeKeywords: Record<string, string[]> = {
  en: [
    "thrift store",
    "pre-loved fashion",
    "branded thrift",
    "vintage clothing Morocco",
    "WhatsApp shop",
  ],
  ar: [
    "حوايج مستعملة",
    "ماركات مستعملة",
    "ثوب مستعمل",
    "تسوق على واتساب",
    "Balna",
  ],
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const key = hasLocale(lang) ? lang : DEFAULT_LOCALE;
  const meta = titles[key];
  const ogLocale = LOCALE_META[key].htmlLang;
  const ogLocaleAlternate = LOCALES.filter((l) => l !== key).map(
    (l) => LOCALE_META[l].htmlLang,
  );

  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: meta.title,
      // Inner pages opt into the brand-suffixed pattern via `title: "Foo"`
      // and end up rendering as "Foo · Balna".
      template: `%s · ${SITE_NAME}`,
    },
    description: meta.description,
    applicationName: SITE_NAME,
    referrer: "origin-when-cross-origin",
    creator: SITE_NAME,
    publisher: SITE_NAME,
    category: "shopping",
    keywords: [...BASE_KEYWORDS, ...(localeKeywords[key] ?? [])],
    formatDetection: {
      // The WhatsApp deep-link contains a phone number; iOS Safari otherwise
      // styles every digit as a tappable phone link in the page body.
      telephone: false,
      address: false,
      email: false,
    },
    icons: {
      icon: [
        { url: "/logo.png", type: "image/png" },
        { url: "/favicon.ico", sizes: "any" },
      ],
      apple: { url: "/logo.png", sizes: "180x180", type: "image/png" },
    },
    alternates: {
      canonical: `/${key}`,
      languages: hreflangMap((l) => `/${l}`),
    },
    openGraph: {
      type: "website",
      siteName: SITE_NAME,
      title: meta.title,
      description: meta.description,
      url: `/${key}`,
      locale: ogLocale,
      alternateLocale: ogLocaleAlternate,
      // `images` is auto-populated from `app/[lang]/opengraph-image.tsx` —
      // omitting the field here makes Next inject the dynamic card.
    },
    twitter: {
      card: "summary_large_image",
      title: meta.title,
      description: meta.description,
      // Likewise, the dynamic `twitter-image.tsx` is auto-detected.
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },
  };
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#11b79f" },
    { media: "(prefers-color-scheme: dark)", color: "#0c9281" },
  ],
  colorScheme: "light",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export function generateStaticParams() {
  return LOCALES.map((lang) => ({ lang }));
}

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const meta = LOCALE_META[lang];

  return (
    <html
      lang={meta.htmlLang}
      dir={meta.dir}
      data-locale={lang}
      className={`${geistSans.variable} ${display.variable} ${arabic.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-balna-cream text-balna-ink">
        {children}
      </body>
    </html>
  );
}
