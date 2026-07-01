# StarPrep AI

AI-generated, TEKS-aligned STAAR practice questions for Texas educators.
Generate unlimited STAAR-style items for any grade, subject, and standard in
seconds, including the tech-enhanced item types the real test uses.

Built with Next.js 14 (App Router), Supabase (auth + Postgres + RLS), and the
Anthropic API for generation.

---

## Why this is built the way it is

The prototype generated questions by calling Anthropic directly from the
browser. That is fine for a demo, but a real product needs the API key kept
secret, per-user auth, usage metering, and student-data privacy. So in this
scaffold:

- Generation runs server-side (`app/api/generate/route.ts`). The browser never
  sees the Anthropic key.
- Every table has Row Level Security. A teacher can only ever read their own
  sets, students, and results. This is the backbone of FERPA compliance.
- STAAR fidelity lives in `lib/prompts.ts` and `lib/teks.ts`. STAAR is not all
  multiple choice; since the 2022 redesign it uses multiselect, inline-choice,
  drag-and-drop, equation-entry, hot-spot, two-part, and constructed-response
  items. The generator produces these, and every item is tagged to a TEKS
  code.
- Security is layered. Origin checks block cross-site requests, per-user rate
  limits protect the Anthropic bill, an optional email allowlist locks down
  the deployment to specific accounts, and strict response headers (CSP, HSTS,
  frame-options) ship by default. See `SECURITY.md` for the full hardening
  checklist.


## The classroom loop

This is the end-to-end flow the product was built to support:

1. **Generate** - Teacher picks a TEKS standard and clicks Generate. Claude
   produces a STAAR-aligned set of practice questions in about 30 seconds.
2. **Save** - Teacher reviews, edits any items that need work, hits Save.
3. **Assign** - From the Sets page, teacher clicks "Assign". The app creates
   an assignment and copies a shareable URL (`/take/<id>`) to the clipboard.
   Teacher pastes it into Google Classroom, the projector, or wherever.
4. **Take** - Students go to the URL on their school devices, pick their name
   from the class roster, answer the questions, submit. No login required.
   The answer key is stripped from the payload, so students never see it.
5. **Grade** - The server auto-grades the submission and stores per-TEKS
   mastery for each student.
6. **Analyze** - Teacher opens the Analytics page, sees which TEKS the class
   is weakest on, and clicks "Generate remediation" to spin up a targeted
   practice set for the weakest standard.

---

## Project structure

```
starprep/
├── app/
│   ├── api/
│   │   ├── generate/route.ts        secure, authed Claude generation
│   │   ├── regenerate/route.ts      single-question regeneration
│   │   ├── sets/route.ts            list / save question sets
│   │   ├── sets/[id]/route.ts       fetch / delete one set
│   │   ├── students/route.ts        roster CRUD (single + bulk)
│   │   ├── students/[id]/route.ts   delete a student
│   │   ├── take/[id]/route.ts       PUBLIC student-take API (no auth)
│   │   ├── assignments/route.ts     assign a set to the class
│   │   ├── results/route.ts         record + auto-grade submissions
│   │   ├── export/route.ts          print-ready worksheet HTML, PDF via print
│   │   └── stripe/
│   │       ├── checkout/route.ts    teacher-plan Checkout session
│   │       └── webhook/route.ts     upgrade plan on payment
│   ├── auth/callback/route.ts       magic-link code exchange
│   ├── dashboard/
│   │   ├── layout.tsx               sidebar + toast shell, auth-gated
│   │   ├── page.tsx                 Generate view (+ remediation prefill)
│   │   ├── sets/page.tsx            saved sets list
│   │   ├── sets/[id]/page.tsx       single set detail view
│   │   ├── students/page.tsx        roster + per-student performance
│   │   └── analytics/page.tsx       class TEKS mastery + remediation loop
│   ├── login/page.tsx               magic-link sign-in
│   ├── take/[id]/                   PUBLIC student-facing quiz UI
│   ├── page.tsx                     landing entry
│   ├── layout.tsx
│   └── globals.css
├── components/                      Sidebar, Topbar, Generator, etc.
├── lib/
│   ├── anthropic.ts                 server-only generation service
│   ├── prompts.ts                   STAAR system prompt + Zod schemas
│   ├── teks.ts                      TEKS model + STAAR item types
│   ├── grading.ts                   auto-grading + TEKS mastery math
│   ├── export.ts                    print-ready worksheet builder
│   ├── stripe.ts                    plan catalog + Stripe client
│   ├── security.ts                  CSRF + allowlist helpers
│   ├── rateLimit.ts                 per-user token bucket
│   ├── database.types.ts            typed schema (matches schema.sql)
│   └── supabase/{client,server}.ts
├── supabase/
│   └── schema.sql                   tables + RLS + new-user trigger
├── public/.well-known/security.txt
├── .github/dependabot.yml
├── SECURITY.md
├── vercel.json
├── middleware.ts                    session refresh + dashboard guard + allowlist
└── .env.local.example
```

Dependency versions are pinned to a known-good set (`next@14.2.33`,
`@supabase/supabase-js@2.45.4`, `@supabase/ssr@0.5.2`).

---

## Local setup

### 1. Prerequisites
- Node.js 18.17+ and npm
- A free [Supabase](https://supabase.com) project
- An [Anthropic API key](https://console.anthropic.com)

### 2. Install
```bash
npm install
```

### 3. Configure environment
```bash
cp .env.local.example .env.local
```
Fill in:
- `ANTHROPIC_API_KEY`, from the Anthropic console
- `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`, from Supabase
  Project Settings, API
- `SUPABASE_SERVICE_ROLE_KEY`, same page, keep secret
- `ALLOWED_EMAILS`, optional. Leave blank for open access, or set to your own
  email to lock the deploy down to just you (see "Private deploy" below).

### 4. Set up the database
In the Supabase dashboard, open the SQL Editor, paste the contents of
`supabase/schema.sql`, and run it. This creates all tables, RLS policies, and
the trigger that auto-creates a profile on signup.

### 5. Configure auth
Supabase, Authentication, Providers, Email: enable email and use the
magic-link flow as-is.

### 6. Run
```bash
npm run dev
```
Open <http://localhost:3000>, click Sign in, enter your email, follow the
magic link. You land on /dashboard. Configure a standard and generate.

---

## Deploying privately (just for you)

Follow these steps once and you have a live URL only you can access.

### 1. Push to GitHub
Create a private repository, then push:
```bash
git init && git add . && git commit -m "initial"
git branch -M main
git remote add origin git@github.com:yourname/starprep.git
git push -u origin main
```

### 2. Import to Vercel
Go to <https://vercel.com/new>, import the repo, and accept the defaults
(Next.js framework is auto-detected).

### 3. Set environment variables in Vercel
In Project Settings, Environment Variables, add the same values you put in
`.env.local`, PLUS these for the private gate:

```
ALLOWED_EMAILS=your@email.com
NEXT_PUBLIC_APP_URL=https://your-project.vercel.app
```

Set them for all three environments (Production, Preview, Development).

### 4. Update Supabase redirect URLs
Supabase, Authentication, URL Configuration. Add your Vercel domain to:
- Site URL: `https://your-project.vercel.app`
- Redirect URLs: `https://your-project.vercel.app/auth/callback`

### 5. Deploy
Click Deploy. First build takes 90 seconds or so. After that, every push to
main deploys automatically.

### 6. Verify the gate
Try signing in with an email that is NOT in `ALLOWED_EMAILS`. You should get
bounced back to the login page with an "account not authorized" message.
Sign in with your allowed email. You should land on `/dashboard`.

If you ever need to grant access to another person (a teacher reviewing your
samples, for example), add their email to `ALLOWED_EMAILS` in Vercel and
redeploy.

---

## Security at a glance

The full checklist lives in `SECURITY.md`. Summary:

- Anthropic API key server-side only
- RLS on every table
- Per-user rate limits on Anthropic-backed endpoints
- Same-origin enforcement on every state-changing request
- HSTS, X-Frame-Options DENY, strict CSP, no X-Powered-By
- Server-side Zod validation on every request body
- Server-side HTML escaping on the worksheet export
- Email allowlist gate for private deploys
- Dependabot watching for vulnerable packages

---

## Roadmap

Phase 1, MVP, complete.

Phase 2, implemented in this scaffold:
- [x] Student roster with quick add and remove
- [x] Assignment flow (assign a saved set to the class)
- [x] Server-side auto-grading to per-TEKS mastery breakdown
- [x] Class mastery analytics with one-click "generate remediation"
- [x] Print-ready PDF export (worksheet + answer key)
- [x] Stripe billing scaffold (teacher-tier checkout + webhook)
- [x] Saved-set detail view
- [x] Layered security: rate limit, origin/CSRF, allowlist, CSP, HSTS

Phase 3, district sales:
- [ ] Campus/district admin dashboards (roles already in schema)
- [ ] SSO / Clever / Canvas roster sync
- [ ] BuyBoard co-op vendor onboarding
- [x] Student-facing assignment-taking UI (`/take/[id]`, public, shareable link)

---

## A note on quality

Before charging anyone, have a Texas teacher review around 50 generated items
per subject to confirm TEKS alignment and STAAR fidelity. The official
[STAAR released test questions](https://tea.texas.gov/student-assessment/staar/staar-released-test-questions)
are the gold standard to benchmark against. Tune the system prompt in
`lib/prompts.ts` based on that review. That feedback loop is what separates a
trustworthy product from a generic quiz generator.

---

© 2026 StarPrep AI. Built for Texas educators.
