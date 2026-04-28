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

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL || "https://balna.example.com";

const titles: Record<string, { title: string; description: string }> = {
  en: {
    title: "Balna — Pre-loved branded thrift, made simple",
    description:
      "Shop pre-owned branded clothing from Balna. Answer 3 quick questions and we show you only what fits.",
  },
  ar: {
    title: "Balna — حوايج ماركات مستعملة، بسيطة وسهلة",
    description:
      "تسوق حوايج ماركات مستعملة من Balna. جاوب على 3 أسئلة وغانوريوك غير اللي يناسبك.",
  },
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const key = hasLocale(lang) ? lang : DEFAULT_LOCALE;
  const meta = titles[key];
  return {
    metadataBase: new URL(siteUrl),
    title: meta.title,
    description: meta.description,
    applicationName: "Balna",
    icons: { icon: "/logo.png", apple: "/logo.png" },
    alternates: {
      canonical: `/${key}`,
      languages: {
        en: "/en",
        "ar-MA": "/ar",
      },
    },
    openGraph: {
      title: meta.title,
      description: meta.description,
      images: ["/logo.png"],
      locale: LOCALE_META[key].htmlLang,
      type: "website",
    },
  };
}

export const viewport: Viewport = {
  themeColor: "#11b79f",
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
