/**
 * lib/security.ts
 * ---------------------------------------------------------------------------
 * Security helpers shared by every API route.
 *
 * 1. assertSameOrigin: blocks CSRF. Supabase SSR uses cookie-based sessions,
 *    so any state-changing request must come from our own origin. Browsers
 *    always set Origin (or Sec-Fetch-Site) on cross-origin POSTs, so checking
 *    those is sufficient. Server-to-server and curl calls (which set no
 *    Origin) can still use a Bearer token if we add one later, but cookies
 *    alone won't work cross-origin.
 *
 * 2. isAllowedUser: enforces the single-tenant allowlist for private deploys.
 *    Set ALLOWED_EMAILS in your environment to a comma separated list of the
 *    only emails that may sign in. Leave it unset for an open deploy.
 * ---------------------------------------------------------------------------
 */

import { NextRequest, NextResponse } from "next/server";

/** Allow requests only from our own origin. Returns null on success, a 403 NextResponse on failure. */
export function assertSameOrigin(req: NextRequest): NextResponse | null {
  const method = req.method.toUpperCase();
  // Safe methods are exempt.
  if (method === "GET" || method === "HEAD" || method === "OPTIONS") return null;

  const origin = req.headers.get("origin");
  const host = req.headers.get("host");
  if (!origin || !host) {
    return NextResponse.json({ error: "Missing origin." }, { status: 403 });
  }

  let originHost: string;
  try {
    originHost = new URL(origin).host;
  } catch {
    return NextResponse.json({ error: "Invalid origin." }, { status: 403 });
  }

  if (originHost !== host) {
    return NextResponse.json({ error: "Cross-origin request blocked." }, { status: 403 });
  }
  return null;
}

/**
 * If ALLOWED_EMAILS is set, the user's email must be on the list.
 * Empty / unset means open access (multi-tenant mode).
 */
export function isAllowedUser(email: string | null | undefined): boolean {
  const raw = process.env.ALLOWED_EMAILS;
  if (!raw || !raw.trim()) return true;
  if (!email) return false;
  const allow = raw
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  return allow.includes(email.toLowerCase());
}
