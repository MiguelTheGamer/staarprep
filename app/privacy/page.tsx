import { LegalShell, LegalSection } from "@/components/LegalShell";

export const metadata = { title: "Privacy Policy" };

export default function Privacy() {
  return (
    <LegalShell title="Privacy Policy" updated="June 29, 2026">
      <p>
        StarPrep AI is built for K-12 teachers and the data we handle includes
        student records covered by federal and state student privacy laws.
        This policy describes what we collect, why, how we protect it, and
        what rights you have over it.
      </p>

      <LegalSection heading="Who we are">
        <p>
          StarPrep AI provides AI-generated STAAR practice questions to Texas
          educators. We are the data controller for teacher account data and
          the data processor (under FERPA and the Texas Student Privacy Act)
          for student data entered by teachers using our service.
        </p>
      </LegalSection>

      <LegalSection heading="What we collect">
        <p>
          <strong className="text-navy">From teachers (account holders):</strong> email
          address (used for sign-in), any name you choose to display, and
          activity logs (which API endpoints you called, when, and how many
          generations you ran).
        </p>
        <p>
          <strong className="text-navy">From schools / students:</strong> we collect only
          the minimum needed to run practice assignments: student display name
          (often a first name or initial), an optional class period label, and
          an optional SIS identifier you choose to enter. We collect no
          contact information, no demographic data, no sensitive personal
          information, and no biometrics about students.
        </p>
        <p>
          <strong className="text-navy">Practice results:</strong> the questions a student
          answered on an assignment, their selected responses, the computed
          score, and a per-TEKS mastery breakdown.
        </p>
      </LegalSection>

      <LegalSection heading="What we do NOT collect">
        <p>
          We do not collect student email addresses, phone numbers, photos,
          biometric data, location data, behavioral advertising data, or any
          information not necessary to administer practice assignments. We do
          not require student accounts. We do not show ads to anyone. We do
          not sell or rent personal information to anyone, ever.
        </p>
      </LegalSection>

      <LegalSection heading="How we use it">
        <p>
          Teacher account data is used to authenticate you, render the
          dashboard, and meter your usage. Student data is used only to
          present practice assignments to that teacher&apos;s class, auto-grade
          submissions, and surface mastery analytics back to the teacher who
          owns the roster. We do not aggregate student data across teachers
          or schools for any purpose.
        </p>
        <p>
          We send the text of generation prompts and edited questions to
          Anthropic&apos;s Claude API to produce new content. We do NOT send any
          student identifying information to Anthropic - student names,
          rosters, and results never leave our database.
        </p>
      </LegalSection>

      <LegalSection heading="How we protect it">
        <p>
          All data is encrypted in transit (TLS 1.2+) and at rest (Supabase
          managed Postgres uses AES-256). Every database table that holds
          user-scoped data has Row Level Security enabled, which means a
          teacher account can only read or modify their own students, sets,
          and results - the database enforces this regardless of what the
          application code does. Anthropic API keys live in server-side
          environment variables and are never exposed to the browser.
        </p>
        <p>
          We rate-limit every endpoint, enforce same-origin checks on
          state-changing requests, ship strict response headers (HSTS, CSP,
          X-Frame-Options: DENY), and run dependency vulnerability scans
          weekly. The full hardening checklist is in our public SECURITY.md.
        </p>
      </LegalSection>

      <LegalSection heading="FERPA, COPPA, and state laws">
        <p>
          Student data entered into StarPrep AI is treated as a FERPA-covered
          education record. We act as a &quot;school official&quot; under the FERPA
          school-official exception when contracted by a district, using
          student information only to perform institutional services that the
          school would otherwise perform itself.
        </p>
        <p>
          We comply with the Children&apos;s Online Privacy Protection Act (COPPA)
          by collecting no personal information from any student directly.
          Rosters are entered by the teacher. Students access assignments via
          a classroom link and submit answers using the name their teacher
          assigned. We do not require students to provide email, phone,
          location, or any other identifier.
        </p>
        <p>
          We comply with the Texas Student Privacy Act (HB 1842). We sign
          Texas Student Data Privacy Agreements (TX-NDPA) with districts on
          request.
        </p>
      </LegalSection>

      <LegalSection heading="Retention and deletion">
        <p>
          Active accounts keep their data as long as the account is open.
          When an account is closed, we delete all teacher and student data
          within 30 days unless we are legally required to retain it. A
          teacher or district administrator can request immediate export
          (in JSON) and deletion at any time by emailing{" "}
          <a className="text-navy hover:underline" href="mailto:privacy@starprepai.com">privacy@starprepai.com</a>.
        </p>
      </LegalSection>

      <LegalSection heading="Your rights">
        <p>
          You have the right to access, correct, export, and delete the
          personal data we hold about you or your students. Submit any
          request to{" "}
          <a className="text-navy hover:underline" href="mailto:privacy@starprepai.com">privacy@starprepai.com</a>{" "}
          and we will respond within 30 days.
        </p>
      </LegalSection>

      <LegalSection heading="Subprocessors">
        <p>
          We use a small set of subprocessors to operate the service. Each is
          contractually bound to the same data-protection terms we offer you:
        </p>
        <ul className="list-disc space-y-1 pl-6">
          <li>Vercel - application hosting (US-based)</li>
          <li>Supabase - database and authentication (US-based)</li>
          <li>Anthropic - AI question generation (prompts only, no student data)</li>
          <li>Stripe - payment processing (no student data, only billing contact)</li>
        </ul>
      </LegalSection>

      <LegalSection heading="Cookies">
        <p>
          We use a single essential cookie for authentication (the Supabase
          session). It is HttpOnly, Secure, and SameSite=Lax. We use no
          analytics cookies, no advertising cookies, and no third-party
          tracking. If we add any non-essential cookies in the future, we
          will request your consent first.
        </p>
      </LegalSection>

      <LegalSection heading="Changes to this policy">
        <p>
          We will notify account holders by email at least 30 days before
          any material change, and we will keep prior versions available on
          request.
        </p>
      </LegalSection>
    </LegalShell>
  );
}
