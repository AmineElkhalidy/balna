import { notFound } from "next/navigation";
import { Header } from "../components/Header";
import { Quiz } from "../components/Quiz";
import { SocialLinks } from "../components/SocialLinks";
import { getDictionary, hasLocale, type Dictionary } from "@/lib/i18n";
import { getBrandIndex, getSiteSettings } from "@/lib/sanity/products";
import { SITE_NAME, SITE_URL, absoluteUrl, jsonLdString } from "@/lib/seo";
import { LOCALE_META, type Locale } from "@/lib/i18n-config";

export default async function Home({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();

  // Run dict + brand index + site settings in parallel.
  const [dict, brandIndex, settings] = await Promise.all([
    getDictionary(lang),
    getBrandIndex(),
    getSiteSettings(),
  ]);

  const phone = settings?.whatsappNumber ?? process.env.NEXT_PUBLIC_BALNA_WHATSAPP;
  const orgLd = buildOrganizationLd(lang, dict, phone);
  const siteLd = buildWebsiteLd(lang, dict);

  return (
    <>
      {/* JSON-LD must live in the body of the document — Next streams it
          alongside the route output. Keep both blobs as separate scripts so
          Google can parse them independently. */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdString(orgLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdString(siteLd) }}
      />
      <Header lang={lang} dict={dict} />
      <Hero dict={dict} />
      <Quiz lang={lang} dict={dict} brandIndex={brandIndex} />
      <FooterNote dict={dict} />
    </>
  );
}

function buildOrganizationLd(
  lang: Locale,
  dict: Dictionary,
  phone: string | undefined,
) {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${SITE_URL}/#organization`,
    name: SITE_NAME,
    url: SITE_URL,
    logo: absoluteUrl("/logo.png"),
    description: dict.footer.tagline,
    inLanguage: LOCALE_META[lang].htmlLang,
    ...(phone
      ? {
          contactPoint: [
            {
              "@type": "ContactPoint",
              contactType: "customer service",
              telephone: `+${phone.replace(/\D/g, "")}`,
              availableLanguage: ["en", "ar"],
              areaServed: "MA",
            },
          ],
        }
      : {}),
  };
}

function buildWebsiteLd(lang: Locale, dict: Dictionary) {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    name: SITE_NAME,
    url: absoluteUrl(`/${lang}`),
    description: dict.hero.subtitle,
    inLanguage: LOCALE_META[lang].htmlLang,
    publisher: { "@id": `${SITE_URL}/#organization` },
  };
}

function Hero({ dict }: { dict: Dictionary }) {
  return (
    <section className="mx-auto w-full max-w-3xl px-5 pt-8 sm:px-8 sm:pt-12">
      <span className="inline-flex items-center gap-2 rounded-full bg-balna-teal-soft px-3 py-1 text-xs font-semibold uppercase tracking-wider text-balna-teal-dark">
        <span aria-hidden>✨</span> {dict.hero.eyebrow}
      </span>
      <h2 className="mt-4 font-balna-display text-2xl font-bold leading-tight text-balna-ink sm:text-3xl">
        {dict.hero.title}
      </h2>
      <p className="mt-2 max-w-xl text-balna-muted">{dict.hero.subtitle}</p>
    </section>
  );
}

function FooterNote({ dict }: { dict: Dictionary }) {
  return (
    <footer className="mt-auto border-t border-balna-line bg-balna-paper">
      <div className="mx-auto flex w-full max-w-5xl flex-col items-center gap-3 px-5 py-6 text-center text-sm text-balna-muted sm:px-6">
        <SocialLinks dict={dict} variant="footer" />
        <p>{dict.footer.tagline}</p>
        <p className="text-xs">
          {dict.footer.developedBy}{" "}
          <a
            href="https://amineelkhalidy.dev"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-balna-ink underline-offset-2 hover:text-balna-teal-dark hover:underline"
          >
            Amine Elkhalidy
          </a>
        </p>
      </div>
    </footer>
  );
}
