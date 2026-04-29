/**
 * Studio sits at `/studio` outside the locale group, so we need our own
 * <html>/<body> shell — Next.js requires exactly one root layout per route
 * tree. We deliberately don't import `globals.css` here so Tailwind/brand
 * styles can't leak into the Sanity UI.
 */
export const metadata = {
  title: "Balna Studio",
  robots: { index: false, follow: false },
};

export default function StudioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body style={{ margin: 0 }}>{children}</body>
    </html>
  );
}
