import Link from "next/link";

export function LegalShell({
  title,
  updated,
  children,
}: {
  title: string;
  updated: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen">
      <header className="border-b border-stone-light bg-bg">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2">
            <div
              className="h-6 w-6 bg-navy"
              style={{
                clipPath:
                  "polygon(50% 0%,61% 35%,98% 35%,68% 57%,79% 91%,50% 70%,21% 91%,32% 57%,2% 35%,39% 35%)",
              }}
            />
            <span className="font-display text-lg">StarPrep AI</span>
          </Link>
          <Link href="/" className="text-sm text-stone hover:text-navy">
            Back to site
          </Link>
        </div>
      </header>
      <article className="mx-auto max-w-3xl px-6 py-16">
        <h1 className="font-display mb-2 text-4xl font-light">{title}</h1>
        <p className="mb-12 text-[13px] text-stone">Last updated {updated}</p>
        <div className="prose-content space-y-6 text-[15px] leading-relaxed text-navy">
          {children}
        </div>
        <footer className="mt-16 border-t border-stone-light pt-6 text-[13px] text-stone">
          Questions? Email <a className="text-navy hover:underline" href="mailto:privacy@starprepai.com">privacy@starprepai.com</a>.
        </footer>
      </article>
    </div>
  );
}

export function LegalSection({ heading, children }: { heading: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="font-display mb-3 mt-10 text-2xl font-normal text-navy">{heading}</h2>
      <div className="space-y-3 text-stone">{children}</div>
    </section>
  );
}
