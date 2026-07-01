import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <div className="mb-6 flex items-center gap-2">
        <div
          className="h-7 w-7 bg-navy"
          style={{
            clipPath:
              "polygon(50% 0%,61% 35%,98% 35%,68% 57%,79% 91%,50% 70%,21% 91%,32% 57%,2% 35%,39% 35%)",
          }}
        />
        <span className="font-display text-xl">StarPrep AI</span>
      </div>
      <p className="font-display mb-2 text-6xl font-light text-stone">404</p>
      <h1 className="font-display mb-3 text-3xl font-light">Page not found</h1>
      <p className="mb-8 max-w-sm text-stone">
        The page you&apos;re looking for doesn&apos;t exist. It may have moved, or the link might be incomplete.
      </p>
      <div className="flex gap-3">
        <Link
          href="/"
          className="rounded-md bg-navy px-6 py-2.5 text-sm font-medium text-white hover:bg-[#1a3050]"
        >
          Back to home
        </Link>
        <Link
          href="/dashboard"
          className="rounded-md border border-stone-light bg-surface px-6 py-2.5 text-sm font-medium hover:bg-navy/[0.06]"
        >
          Open dashboard
        </Link>
      </div>
    </div>
  );
}
