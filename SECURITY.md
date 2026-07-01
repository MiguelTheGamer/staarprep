# Security Policy

## Reporting a vulnerability

If you find a security issue in StarPrep AI, please email the maintainer at
security@starprepai.com rather than opening a public GitHub issue. We will
respond within 72 hours and aim to ship a fix or mitigation within 14 days
for critical issues.

## Threat model

This product handles minimally sensitive information by design: student
display name, optional SIS id, and quiz scores. We still treat the whole
dataset as protected under FERPA and the Texas Student Privacy Act.

## Hard guarantees

1. **Anthropic API key never leaves the server.** Every call to Claude goes
   through `/api/generate` or `/api/regenerate`, both of which require an
   authenticated session and live entirely server-side.
2. **Row Level Security on every table.** A teacher account cannot read or
   modify another teacher's data, even with a leaked anon key. Enforced at
   the database level, not the application level.
3. **Short-lived JWT cookies** issued by Supabase. No long-lived API tokens
   for clients. Cookies are HttpOnly, Secure, SameSite=Lax.
4. **Same-origin enforcement** on every state-changing request (POST, PUT,
   PATCH, DELETE) via the `Origin` header. CSRF is structurally blocked.
5. **Per-user and global rate limits** on Anthropic-backed endpoints.
6. **Daily hard caps** on Anthropic spend (100 generations per user per day,
   2000 globally per day, both tunable via env). This is the credit-drain
   protection: even if an account is compromised, the bill is bounded.
7. **Open-redirect prevention** in the auth callback. Only same-origin,
   single-slash relative paths are accepted as redirect targets.
8. **Public student-take endpoint is air-gapped.** It uses the service-role
   key on the server but strips `correct`, `answer`, `rubric`, and
   `explanation` from every payload. Students never see the answer key.
   IP-based rate limits (60 reads, 20 submissions per minute) prevent
   enumeration of UUIDv4 assignment IDs.
9. **Stripe webhook signature verification** is required on every event.
   Unsigned or mismatched payloads are rejected with 400.
10. **Email allowlist** (`ALLOWED_EMAILS`) for private deploys. The
    middleware signs out and bounces any account whose email isn't on the
    list, on both dashboard routes and API routes.

## Response headers

Applied to every route via `next.config.js`:

- `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`
- `Content-Security-Policy` - tight default-src, scoped script/style/font/connect
- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: camera=(), microphone=(), geolocation=(), interest-cohort=()`
- No `X-Powered-By` header (Next.js fingerprint removed)

## Input validation

Every API route validates its body with Zod. All string fields have explicit
max-length constraints. Server-side HTML escaping is applied wherever model
output is rendered to HTML (`lib/export.ts`).

## Dependency hygiene

Dependabot runs weekly and groups production / development minor and patch
updates into a single PR. Security advisories are applied as soon as they
appear. Production dependencies are pinned to known-good versions:

- `next@14.2.33`
- `@supabase/supabase-js@2.45.4` (exact)
- `@supabase/ssr@0.5.2`

## What is intentionally NOT in scope yet

- DDoS protection beyond per-IP rate limits. Use Cloudflare in front of the
  Vercel domain if you expect attacks.
- Workload isolation per district. The schema supports multi-tenant by user
  scope; for district-level isolation in a paid deployment, partition by
  `campus_id` and add policies that join through `profiles`.
- CAPTCHA on sign-in. Supabase Auth supports hCaptcha and Cloudflare
  Turnstile out of the box. Enable it in the Supabase dashboard if you
  start seeing bot signups.

## Reporting timeline

| Severity | First response | Patch target |
|----------|---------------|--------------|
| Critical | 24 hours | 7 days |
| High | 72 hours | 14 days |
| Medium | 7 days | 30 days |
| Low | 14 days | Next release |
