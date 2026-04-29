import { notFound } from "next/navigation";
import { Header } from "../components/Header";
import { Quiz } from "../components/Quiz";
import { getDictionary, hasLocale, type Dictionary } from "@/lib/i18n";
import { getBrandIndex } from "@/lib/sanity/products";

export default async function Home({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();

  // Run dict + brand index in parallel — both are cheap (60s ISR for Sanity).
  const [dict, brandIndex] = await Promise.all([
    getDictionary(lang),
    getBrandIndex(),
  ]);

  return (
    <>
      <Header lang={lang} dict={dict} />
      <Hero dict={dict} />
      <Quiz lang={lang} dict={dict} brandIndex={brandIndex} />
      <FooterNote dict={dict} />
    </>
  );
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
      <div className="mx-auto w-full max-w-5xl px-5 py-6 text-center text-sm text-balna-muted sm:px-6">
        {dict.footer.tagline}
      </div>
    </footer>
  );
}
