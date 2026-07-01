# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

StarPrep AI: a Next.js 14 (App Router) app that generates TEKS-aligned STAAR
practice questions for Texas teachers using the Anthropic API, backed by
Supabase (auth + Postgres + RLS). See `README.md` for the full product
narrative and `SECURITY.md` for the threat model and hardening checklist —
both are worth reading before touching auth, the generation pipeline, or the
public student-facing routes.

## Commands

```bash
npm run dev        # start dev server (localhost:3000)
npm run build      # production build
npm run start      # run production build
npm run lint       # next lint
npm run db:types   # regenerate lib/database.types.ts from local Supabase schema
```

There is no test suite configured in this repo.

Database schema lives in `supabase/schema.sql`, applied by pasting into the
Supabase SQL editor (or `supabase db push`) — it is not run automatically by
any npm script. `lib/database.types.ts` must be kept in sync with the schema
manually (via `db:types`) whenever the schema changes.

## Architecture

### The generation pipeline

The core flow is: `components/Generator.tsx` (client) → `POST /api/generate`
→ `lib/anthropic.ts` → Claude → validated against a Zod schema → returned to
the browser → teacher edits/saves → `POST /api/sets`.

- `lib/teks.ts` is the Texas domain model (grades, subjects, TEKS codes,
  STAAR question types). `SAMPLE_TEKS` is an illustrative slice only; a real
  deployment seeds this from the official TEA TEKS list.
- `lib/prompts.ts` is where STAAR fidelity actually lives — the system
  prompt, per-question-type generation rules, and the Zod schema
  (`QuestionSchema`) the model's JSON output must satisfy. STAAR is not just
  multiple choice: `QuestionType` covers multiselect, inline_choice,
  equation_entry, hot_spot, drag_and_drop, matching, two_part, and
  constructed_response, each with distinct generation and grading rules.
  Tune prompt quality here, not in the route handler.
- `lib/anthropic.ts` is the only place the Anthropic SDK is invoked. It's
  server-only (imported exclusively from API routes) — the key must never
  reach the browser. It strips markdown fences from model output before
  JSON-parsing and re-validates against the schemas in `lib/prompts.ts`.
- Every generated question is tagged with a `teks` code; this tag is what
  powers grading breakdowns and analytics downstream.

### Grading and analytics

`lib/grading.ts` has two halves:
- `gradeSubmission`: grades one student's answers against a question set.
  Choice-based and equation_entry items auto-grade; `constructed_response`
  always comes back `correct: null` (needs manual teacher review — mirrors
  STAAR's own hybrid scoring).
- `classMastery`: aggregates many students' per-TEKS breakdowns into
  class-wide mastery, sorted weakest-first, which drives the "Generate
  remediation" one-click flow in `app/dashboard/analytics/page.tsx`
  (`REMEDIATION_THRESHOLD = 65`).

### Auth, RLS, and the public/private route split

Two Supabase client constructors, not interchangeable:
- `lib/supabase/client.ts` — browser client, anon key, RLS enforced.
- `lib/supabase/server.ts` — server client for Server Components/Route
  Handlers, reads the session cookie, RLS enforced as the logged-in user.

Every teacher-scoped table (`question_sets`, `students`, `assignments`,
`results`, `generations`, `profiles`) has RLS restricting rows to their
owner (`supabase/schema.sql`). This is the FERPA compliance backbone —
never bypass it by reaching for the service-role key except in the one
place that legitimately needs to: `app/api/take/[id]/route.ts`.

That route (and only that route) uses `createClient` from
`@supabase/supabase-js` directly with `SUPABASE_SERVICE_ROLE_KEY`, because
it's the **public, unauthenticated** student-facing endpoint (students hit
`/take/<assignmentId>` from shared classroom devices, no login). Since RLS
is bypassed there, correctness depends entirely on the handler manually
stripping `correct`, `answer`, `rubric`, and `explanation` before the
response leaves the server, and on IP-based rate limiting
(`clientIp()` + `rateLimit()`) to prevent UUID enumeration. If you touch
this file, preserve both of those invariants explicitly — nothing else in
the type system enforces them.

`middleware.ts` runs on `/dashboard/:path*` and `/api/:path*`: it refreshes
the Supabase session, redirects unauthenticated dashboard access to
`/login`, and — if `ALLOWED_EMAILS` is set — signs out and bounces any user
whose email isn't on the allowlist (the single-tenant "private deploy"
gate). `lib/security.ts` has the same `isAllowedUser` check reimplemented
for use inside route handlers (middleware can't cover every edge), plus
`assertSameOrigin`, the CSRF defense — since sessions are cookie-based,
every state-changing route handler must call `assertSameOrigin(req)` first.
Follow the existing route handlers' pattern when adding a new one: origin
check → auth check → allowlist check → rate limit → Zod-validate body →
do the work.

### Rate limiting and spend caps

`lib/rateLimit.ts` implements an in-memory token bucket (`rateLimit`) plus
UTC-day counters (`dailyCap`) — explicitly scoped to a single-region Vercel
deployment (`vercel.json` pins `regions: ["iad1"]`); switching to
multi-region or higher scale requires swapping the in-memory `Map` store
for something shared (Upstash Redis / `@vercel/kv`), noted in the file's
own comments. `LIMITS` holds per-endpoint-class presets (generate/write/
read); `DAILY_CAPS` (tunable via `DAILY_USER_CAP`/`DAILY_GLOBAL_CAP` env
vars) is the hard ceiling protecting the Anthropic bill, checked
per-user *and* globally in `/api/generate`.

### Response headers and CSP

`next.config.js` applies security headers (HSTS, CSP, X-Frame-Options,
etc.) globally via `headers()`. If you add a third-party script or a new
external API the client calls, you must extend `connect-src`/`script-src`
there or requests will be silently blocked by the browser.

### Data model

See `supabase/schema.sql` for the full picture; the shape worth internalizing:
`question_sets.questions` is a JSONB column storing an array of
`GeneratedQuestion` (the type from `lib/prompts.ts`) — there's no separate
`questions` table. `results.teks_breakdown` is JSONB keyed by TEKS code.
`districts`/`campuses`/`profiles.role` exist for future multi-tenant admin
dashboards (Phase 3, not yet built — see README roadmap) but aren't
enforced anywhere yet.

### Environment variables

Documented in `.env.local.example`. `ANTHROPIC_API_KEY` and
`SUPABASE_SERVICE_ROLE_KEY` are server-only secrets and must never be
referenced outside server-only modules (API routes, `lib/anthropic.ts`,
the admin client in `app/api/take/[id]/route.ts`). `NEXT_PUBLIC_*` vars are
shipped to the browser by Next.js convention — never put a secret behind
that prefix.
