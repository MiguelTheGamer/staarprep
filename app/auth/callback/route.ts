/**
 * app/auth/callback/route.ts
 *
 * Exchanges the magic-link / OAuth code for a session, then redirects into the
 * app. Required for Supabase email auth to complete.
 *
 * Security: the `next` parameter is attacker-controlled (the magic-link URL is
 * sent over email). We validate that it is a same-origin relative path. This
 * prevents an open-redirect to a phishing site that wears our domain.
 */
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/** Return the value if it's a safe relative path, otherwise the fallback. */
function safeNext(raw: string | null, fallback: string): string {
  if (!raw) return fallback;
  // Must start with exactly one slash, and the next character cannot be
  // another slash or a backslash (which browsers may rewrite as a slash).
  // This rejects "//evil.com", "/\\evil.com", and any absolute URL.
  if (!/^\/[^/\\]/.test(raw)) return fallback;
  // Reject control characters, newlines, and protocol-relative tricks.
  if (/[\x00-\x1f\x7f]/.test(raw)) return fallback;
  return raw;
}

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = safeNext(searchParams.get("next"), "/dashboard");

  if (code) {
    const supabase = createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }
  return NextResponse.redirect(`${origin}/login?error=auth`);
}
