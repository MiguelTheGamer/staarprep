"use client";

/**
 * app/login/page.tsx
 * Email magic-link auth via Supabase. The link lands on /auth/callback which
 * exchanges the code for a session and forwards to /dashboard.
 */
import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginShell />}>
      <LoginForm />
    </Suspense>
  );
}

function LoginShell({ children }: { children?: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <div className="w-full max-w-sm rounded-lg border border-stone-light bg-surface p-8">
        <div className="mb-6 flex items-center gap-2">
          <div
            className="h-7 w-7 bg-navy"
            style={{ clipPath: "polygon(50% 0%,61% 35%,98% 35%,68% 57%,79% 91%,50% 70%,21% 91%,32% 57%,2% 35%,39% 35%)" }}
          />
          <span className="font-display text-xl">StarPrep AI</span>
        </div>
        {children}
      </div>
    </div>
  );
}

function LoginForm() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const search = useSearchParams();
  const errorParam = search.get("error");

  async function signIn() {
    setLoading(true);
    const supabase = createClient();
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? window.location.origin;
    await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${appUrl}/auth/callback?next=/dashboard` },
    });
    setSent(true);
    setLoading(false);
  }

  return (
    <LoginShell>
      {errorParam === "not_authorized" && (
        <div className="mb-4 rounded border border-red/30 bg-[#FDF0EE] p-3 text-[13px] text-red">
          This account is not authorized to access this deployment. Contact the administrator if you believe this is an error.
        </div>
      )}

      {sent ? (
        <p className="text-sm text-stone">
          Check your inbox. We sent a sign-in link to{" "}
          <span className="font-medium text-navy">{email}</span>.
        </p>
      ) : (
        <>
          <h1 className="font-display mb-1 text-2xl font-light">Sign in</h1>
          <p className="mb-6 text-sm text-stone">We&apos;ll email you a secure sign-in link.</p>
          <input
            type="email"
            placeholder="you@yourdistrict.org"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mb-3 w-full rounded-md border border-stone-light bg-surface p-3 text-sm outline-none focus:border-navy focus:ring-2 focus:ring-navy/[0.06]"
          />
          <button
            onClick={signIn}
            disabled={loading || !email}
            className="w-full rounded-md bg-navy py-3 text-sm font-medium text-white transition hover:bg-[#1a3050] disabled:opacity-50"
          >
            {loading ? "Sending..." : "Send sign-in link"}
          </button>
          <p className="mt-4 text-center text-[11px] leading-relaxed text-stone">
            By signing in you agree to the{" "}
            <a href="/terms" className="underline hover:text-navy">Terms</a> and{" "}
            <a href="/privacy" className="underline hover:text-navy">Privacy Policy</a>.
          </p>
        </>
      )}
    </LoginShell>
  );
}
