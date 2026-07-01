/**
 * app/page.tsx
 * Marketing landing page. Server component, no client JS, statically rendered.
 */
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen">
      <Nav />
      <Hero />
      <Proof />
      <HowItWorks />
      <Features />
      <Sample />
      <Pricing />
      <FAQ />
      <CTA />
      <Footer />
    </div>
  );
}

function Logo({ size = "default" }: { size?: "default" | "small" }) {
  const dim = size === "small" ? "h-6 w-6" : "h-8 w-8";
  const text = size === "small" ? "text-lg" : "text-2xl";
  return (
    <div className="flex items-center gap-2">
      <div
        className={`${dim} bg-navy`}
        style={{
          clipPath:
            "polygon(50% 0%,61% 35%,98% 35%,68% 57%,79% 91%,50% 70%,21% 91%,32% 57%,2% 35%,39% 35%)",
        }}
      />
      <span className={`font-display ${text}`}>StarPrep AI</span>
    </div>
  );
}

function Nav() {
  return (
    <header className="sticky top-0 z-40 border-b border-stone-light bg-bg/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/"><Logo size="small" /></Link>
        <nav className="hidden gap-8 text-sm text-stone sm:flex">
          <a href="#how" className="hover:text-navy">How it works</a>
          <a href="#features" className="hover:text-navy">Features</a>
          <a href="#pricing" className="hover:text-navy">Pricing</a>
          <a href="#faq" className="hover:text-navy">FAQ</a>
        </nav>
        <div className="flex items-center gap-3">
          <Link href="/login" className="text-sm text-stone hover:text-navy">Sign in</Link>
          <Link href="/login" className="rounded-md bg-navy px-4 py-2 text-sm font-medium text-white hover:bg-[#1a3050]">
            Get started
          </Link>
        </div>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="mx-auto max-w-6xl px-6 pb-20 pt-24 sm:pt-32">
      <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-stone-light bg-surface px-3 py-1 text-[12px] text-stone">
        <span className="inline-block h-1.5 w-1.5 rounded-full bg-success" />
        Built for Texas educators
      </div>
      <h1 className="font-display max-w-3xl text-5xl font-light leading-[1.1] tracking-tight sm:text-6xl">
        Infinite STAAR practice, generated in seconds.
      </h1>
      <p className="mt-6 max-w-xl text-lg text-stone">
        TEKS-aligned practice questions for every grade, subject, and standard. Including the
        multiselect, two-part, drag-and-drop, and constructed-response items the real test uses.
      </p>
      <div className="mt-10 flex flex-wrap items-center gap-3">
        <Link href="/login" className="rounded-md bg-navy px-7 py-3.5 text-sm font-medium text-white hover:bg-[#1a3050]">
          Start generating, free
        </Link>
        <a href="#how" className="rounded-md border border-stone-light bg-surface px-7 py-3.5 text-sm font-medium hover:bg-navy/[0.04]">
          See how it works
        </a>
      </div>
      <div className="mt-12 flex flex-wrap items-center gap-8 text-[13px] text-stone">
        <span className="flex items-center gap-2"><Check /> Every question tagged to a TEKS standard</span>
        <span className="flex items-center gap-2"><Check /> Print-ready PDFs with answer keys</span>
        <span className="flex items-center gap-2"><Check /> One-click remediation from weak standards</span>
      </div>
    </section>
  );
}

function Proof() {
  return (
    <section className="border-y border-stone-light bg-surface">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <p className="mb-6 text-center text-[12px] uppercase tracking-wider text-stone">
          Built on the actual STAAR redesign
        </p>
        <div className="grid grid-cols-2 gap-8 text-center sm:grid-cols-4">
          <Stat n="30s" label="Generation time per set" />
          <Stat n="9" label="STAAR item types supported" />
          <Stat n="100%" label="TEKS-tagged output" />
          <Stat n="FERPA" label="Row-level security on every table" />
        </div>
      </div>
    </section>
  );
}

function Stat({ n, label }: { n: string; label: string }) {
  return (
    <div>
      <div className="font-display text-3xl font-light text-navy">{n}</div>
      <div className="mt-1 text-[13px] text-stone">{label}</div>
    </div>
  );
}

function HowItWorks() {
  const steps = [
    { n: "01", title: "Pick a standard", body: "Choose a grade, subject, and TEKS code, plus the difficulty and item types you want. The generator handles the rest." },
    { n: "02", title: "Generate, edit, save", body: "Claude produces a complete STAAR-format set in about 30 seconds. Review, inline-edit, regenerate single items, then save the set." },
    { n: "03", title: "Assign and analyze", body: "Share a classroom link with your students. The platform auto-grades, tracks mastery per TEKS, and offers one-click remediation for the weakest standards." },
  ];
  return (
    <section id="how" className="mx-auto max-w-6xl px-6 py-24">
      <h2 className="font-display mb-3 text-4xl font-light">How it works</h2>
      <p className="mb-12 max-w-lg text-stone">
        The full classroom loop, from generation to analytics, runs end-to-end in the same product.
      </p>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        {steps.map((s) => (
          <div key={s.n} className="rounded-lg border border-stone-light bg-surface p-7">
            <div className="font-display mb-4 text-2xl text-red">{s.n}</div>
            <h3 className="font-display mb-2 text-xl">{s.title}</h3>
            <p className="text-[14px] leading-relaxed text-stone">{s.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function Features() {
  const items = [
    { title: "Every STAAR item type", body: "Multiple choice, multiselect, inline choice, equation entry, hot spot, drag-and-drop, matching, two-part, and constructed response. The redesigned test isn't all bubbles, and neither is our output." },
    { title: "TEKS alignment baked in", body: "Every generated question is tagged to a specific TEKS student expectation. Mastery analytics flow naturally from there." },
    { title: "Print and digital", body: "Export a print-ready worksheet with answer key, or share a classroom link so students take it on their devices. The grader works either way." },
    { title: "Auto-graded analytics", body: "When students submit, the server grades and writes per-TEKS mastery. The Analytics page surfaces the weakest standards and lets you generate targeted remediation in two clicks." },
    { title: "Built for FERPA", body: "Row Level Security on every table means a teacher can only ever see their own students, sets, and results. No cross-tenant leakage, ever." },
    { title: "Spanish-language support", body: "Toggle generation language to produce Spanish-language items for bilingual classrooms and dual-language programs." },
  ];
  return (
    <section id="features" className="border-t border-stone-light bg-surface">
      <div className="mx-auto max-w-6xl px-6 py-24">
        <h2 className="font-display mb-3 text-4xl font-light">What you get</h2>
        <p className="mb-12 max-w-lg text-stone">
          A small set of capabilities that cover the full practice-to-mastery loop, with nothing
          you have to stitch together yourself.
        </p>
        <div className="grid grid-cols-1 gap-x-12 gap-y-10 sm:grid-cols-2">
          {items.map((f) => (
            <div key={f.title}>
              <h3 className="font-display mb-2 text-xl">{f.title}</h3>
              <p className="text-[14px] leading-relaxed text-stone">{f.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Sample() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-24">
      <div className="mb-3 inline-block rounded-full border border-stone-light bg-surface px-3 py-1 text-[12px] text-stone">
        Sample output
      </div>
      <h2 className="font-display mb-3 text-4xl font-light">
        What a generated question actually looks like
      </h2>
      <p className="mb-10 max-w-lg text-stone">
        Grade 8 mathematics. TEKS 8.4(B), Slope of a line from a verbal description.
      </p>
      <div className="rounded-lg border border-stone-light bg-surface p-8">
        <div className="mb-4 flex flex-wrap gap-2">
          <Pill>Multiple choice</Pill>
          <Pill tone="navy">TEKS 8.4(B)</Pill>
          <Pill tone="red">Meets-level</Pill>
        </div>
        <p className="mb-6 text-[16px] leading-relaxed">
          A water tank starts the morning containing 12 gallons. Over the next 4 hours, the water
          level rises at a steady rate to 30 gallons. Which expression represents the slope of the
          line describing the water level over time, in gallons per hour?
        </p>
        <ul className="mb-6 space-y-2">
          <Option letter="A" correct>(30 - 12) / 4</Option>
          <Option letter="B">(30 + 12) / 4</Option>
          <Option letter="C">30 / 4</Option>
          <Option letter="D">12 / 4</Option>
        </ul>
        <div className="rounded bg-[#EDF7F2] p-4 text-[13px] text-success">
          <span className="font-semibold">Why:</span> Slope is change in output over change in
          input. The tank goes from 12 to 30 gallons (rise = 30 - 12) over 4 hours (run = 4).
          Choice A correctly applies the slope formula in context.
        </div>
      </div>
    </section>
  );
}

function Pill({ children, tone = "stone" }: { children: React.ReactNode; tone?: "stone" | "navy" | "red" }) {
  const cls =
    tone === "navy" ? "bg-navy/10 text-navy"
    : tone === "red" ? "bg-red/10 text-red"
    : "border border-stone-light bg-bg text-stone";
  return (
    <span className={`rounded px-2.5 py-1 text-[11px] font-medium uppercase tracking-wider ${cls}`}>
      {children}
    </span>
  );
}

function Option({ letter, children, correct }: { letter: string; children: React.ReactNode; correct?: boolean }) {
  return (
    <li className={`flex items-start gap-3 rounded px-3 py-2.5 text-[14px] ${correct ? "bg-[#EDF7F2] text-success" : ""}`}>
      <span className="font-semibold">{letter}.</span>
      <span>{children}</span>
      {correct && <span className="ml-auto text-[12px]">Correct</span>}
    </li>
  );
}

function Pricing() {
  const tiers = [
    {
      name: "Teacher", price: "$29", period: "/month", tag: "Per teacher",
      features: ["Unlimited question generation", "Up to 200 students on your roster", "Print-ready PDF export", "TEKS mastery analytics", "Email support"],
      cta: "Start free trial", featured: false,
    },
    {
      name: "Campus", price: "$2,400", period: "/year", tag: "Per campus, all teachers",
      features: ["Everything in Teacher", "Unlimited teachers and students", "Campus admin dashboard", "BuyBoard purchasing supported", "Priority support"],
      cta: "Talk to sales", featured: true,
    },
    {
      name: "District", price: "Custom", period: "", tag: "Multi-campus pricing",
      features: ["Everything in Campus", "SSO and SIS integration", "District-wide mastery analytics", "Dedicated onboarding", "Custom data agreements"],
      cta: "Talk to sales", featured: false,
    },
  ];
  return (
    <section id="pricing" className="border-t border-stone-light bg-surface">
      <div className="mx-auto max-w-6xl px-6 py-24">
        <h2 className="font-display mb-3 text-4xl font-light">Pricing</h2>
        <p className="mb-12 max-w-lg text-stone">
          Texas procurement below $100,000 doesn&apos;t require an RFP, so campuses can sign up
          directly. Districts get co-op pricing through BuyBoard.
        </p>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          {tiers.map((t) => (
            <div key={t.name} className={`flex flex-col rounded-lg border p-7 ${t.featured ? "border-navy bg-bg ring-1 ring-navy/20" : "border-stone-light bg-bg"}`}>
              <div className="mb-1 text-[12px] uppercase tracking-wider text-stone">{t.tag}</div>
              <div className="font-display text-2xl">{t.name}</div>
              <div className="mt-4 mb-6 flex items-baseline gap-1">
                <span className="font-display text-4xl font-light">{t.price}</span>
                <span className="text-stone">{t.period}</span>
              </div>
              <ul className="mb-8 space-y-2 text-[14px]">
                {t.features.map((f) => (
                  <li key={f} className="flex gap-2"><Check /> <span>{f}</span></li>
                ))}
              </ul>
              <Link href="/login" className={`mt-auto rounded-md py-2.5 text-center text-sm font-medium ${t.featured ? "bg-navy text-white hover:bg-[#1a3050]" : "border border-stone-light bg-surface hover:bg-navy/[0.06]"}`}>
                {t.cta}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FAQ() {
  const qs = [
    { q: "How accurate is the TEKS alignment?", a: "Every question is tagged to a specific TEKS student expectation and prompted to match STAAR rigor and format. Before any classroom use, we recommend a teacher review a batch of 50 samples to validate fidelity for their grade level." },
    { q: "Can students take assignments on their phones?", a: "Yes. The student-take page is mobile-friendly. Students go to a shareable URL, pick their name from the roster, and answer the questions. No app, no signup." },
    { q: "How is student data protected?", a: "Row Level Security is enabled on every table. A teacher can only ever read or write their own students, sets, and results, enforced at the database level. We collect only display name and optional SIS id; no other PII." },
    { q: "Does it support Spanish?", a: "Yes. The generator accepts a language parameter and produces fully Spanish-language items, useful for bilingual and dual-language classrooms." },
    { q: "What happens to my data if I cancel?", a: "You can export everything (sets, rosters, results) as JSON. After cancellation, data is deleted within 30 days unless you request otherwise." },
    { q: "Can a district buy without an RFP?", a: "In Texas, campus-level purchases under $100,000 do not require an RFP. The Campus plan is intentionally priced below that threshold. Districts can also purchase through BuyBoard cooperative." },
  ];
  return (
    <section id="faq" className="mx-auto max-w-3xl px-6 py-24">
      <h2 className="font-display mb-12 text-center text-4xl font-light">Common questions</h2>
      <div className="divide-y divide-stone-light border-y border-stone-light">
        {qs.map((item) => (
          <details key={item.q} className="group py-6">
            <summary className="flex cursor-pointer items-center justify-between text-[15px] font-medium">
              {item.q}
              <span className="font-display text-2xl text-stone transition group-open:rotate-45">+</span>
            </summary>
            <p className="mt-3 text-[14px] leading-relaxed text-stone">{item.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}

function CTA() {
  return (
    <section className="border-t border-stone-light bg-navy">
      <div className="mx-auto max-w-6xl px-6 py-20 text-center">
        <h2 className="font-display mb-4 text-4xl font-light text-white">Start generating today.</h2>
        <p className="mx-auto mb-8 max-w-md text-[15px] text-white/70">
          Free to try. No credit card required to generate your first sets.
        </p>
        <Link href="/login" className="inline-block rounded-md bg-white px-7 py-3.5 text-sm font-medium text-navy hover:bg-stone-light">
          Get started
        </Link>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="bg-bg">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
          <Logo size="small" />
          <nav className="flex flex-wrap gap-x-6 gap-y-2 text-[13px] text-stone">
            <a href="#how" className="hover:text-navy">How it works</a>
            <a href="#pricing" className="hover:text-navy">Pricing</a>
            <a href="#faq" className="hover:text-navy">FAQ</a>
            <Link href="/login" className="hover:text-navy">Sign in</Link>
            <Link href="/privacy" className="hover:text-navy">Privacy</Link>
            <Link href="/terms" className="hover:text-navy">Terms</Link>
            <Link href="/dpa" className="hover:text-navy">For districts</Link>
          </nav>
        </div>
        <p className="mt-8 text-[12px] text-stone">
          © {new Date().getFullYear()} StarPrep AI. Built for Texas educators. Student data protected under FERPA and the Texas Student Privacy Act.
        </p>
      </div>
    </footer>
  );
}

function Check() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
      <path d="M2.5 7.5L5.5 10.5L11.5 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
