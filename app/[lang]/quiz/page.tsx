import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Header } from "../../components/Header";
import { Quiz } from "../../components/Quiz";
import {
  DEFAULT_LOCALE,
  getDictionary,
  hasLocale,
  type Dictionary,
} from "@/lib/i18n";
import { getBrandIndex } from "@/lib/sanity/products";
import { hreflangMap } from "@/lib/seo";

/**
 * Guided pick — `/{lang}/quiz`
 *
 * The 4-step guided experience that used to be the home page. Now it's an
 * opt-in route reachable from the "Find your fit" CTA on the storefront. The
 * page itself is a thin shell around the existing `<Quiz>` client component;
 * all of the step logic, animations, and submit-to-catalog wiring live there.
 *
 * The brand index for Step 3 is computed on the server so the Quiz never has
 * to fetch on the client.
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const key = hasLocale(lang) ? lang : DEFAULT_LOCALE;
  const dict = await getDictionary(key);

  return {
    title: dict.quiz.intro.metadataTitle,
    description: dict.quiz.intro.metadataDescription,
    alternates: {
      canonical: `/${key}/quiz`,
      languages: hreflangMap((l) => `/${l}/quiz`),
    },
    // The quiz is interactive — no value indexing it as a separate landing
    // page (the catalog is the canonical entry point and already cross-links
    // to /quiz). We let robots follow internal links so the products are
    // still discovered, just don't index this URL.
    robots: { index: false, follow: true },
  };
}

export default async function QuizPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();

  const [dict, brandIndex] = await Promise.all([
    getDictionary(lang),
    getBrandIndex(),
  ]);

  return (
    <>
      <Header
        lang={lang}
        dict={dict}
        variant="minimal"
        action={
          <Link
            href={`/${lang}`}
            className="rounded-full border border-balna-line bg-white px-4 py-2 text-sm font-medium text-balna-ink hover:border-balna-teal hover:text-balna-teal-dark"
          >
            {dict.header.backToBrowse}
          </Link>
        }
      />
      <Intro dict={dict} />
      <Quiz lang={lang} dict={dict} brandIndex={brandIndex} />
    </>
  );
}

function Intro({ dict }: { dict: Dictionary }) {
  return (
    <section className="mx-auto w-full max-w-3xl px-5 pt-8 sm:px-8 sm:pt-12">
      <span className="inline-flex items-center gap-2 rounded-full bg-balna-teal-soft px-3 py-1 text-xs font-semibold uppercase tracking-wider text-balna-teal-dark">
        <span aria-hidden>✨</span> {dict.quiz.intro.eyebrow}
      </span>
      <h1 className="mt-4 font-balna-display text-2xl font-bold leading-tight text-balna-ink sm:text-3xl">
        {dict.quiz.intro.title}
      </h1>
      <p className="mt-2 max-w-xl text-balna-muted">
        {dict.quiz.intro.subtitle}
      </p>
    </section>
  );
}
