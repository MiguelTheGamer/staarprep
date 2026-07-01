import { LegalShell, LegalSection } from "@/components/LegalShell";

export const metadata = { title: "Terms of Service" };

export default function Terms() {
  return (
    <LegalShell title="Terms of Service" updated="June 29, 2026">
      <p>
        These terms govern your use of StarPrep AI. By creating an account or
        using the service, you agree to them.
      </p>

      <LegalSection heading="The service">
        <p>
          StarPrep AI generates STAAR-aligned practice questions and provides
          tools for assigning, grading, and analyzing them. The questions are
          AI-generated and should be reviewed by a qualified educator before
          classroom use. We make no guarantee that AI-generated content is
          free of errors or perfectly aligned to the TEKS framework; you are
          responsible for verifying suitability for your students.
        </p>
      </LegalSection>

      <LegalSection heading="Accounts">
        <p>
          You must be a teacher, administrator, or other authorized employee
          of a K-12 educational organization to create an account. Keep your
          login credentials confidential. You are responsible for any
          activity that happens under your account.
        </p>
      </LegalSection>

      <LegalSection heading="Acceptable use">
        <p>You agree NOT to:</p>
        <ul className="list-disc space-y-1 pl-6">
          <li>Use the service to generate content that is illegal, harmful, abusive, hateful, or sexually explicit</li>
          <li>Attempt to bypass rate limits, authentication, or any other access control</li>
          <li>Scrape, reverse-engineer, or copy the service for the purpose of building a competing product</li>
          <li>Share your account credentials with anyone outside your school or district</li>
          <li>Upload student data you don&apos;t have the authority to process</li>
          <li>Use the service to make decisions about a student (placement, retention, discipline) without human review</li>
        </ul>
      </LegalSection>

      <LegalSection heading="AI-generated content">
        <p>
          Questions are produced by a large language model. They may contain
          factual errors, alignment mismatches, or culturally insensitive
          phrasing. Always review generated content before showing it to
          students. We are not responsible for inaccurate or unsuitable
          output.
        </p>
      </LegalSection>

      <LegalSection heading="Intellectual property">
        <p>
          You retain ownership of any content you create using the service,
          including edited and saved question sets. You grant us a limited
          license to host and display that content as needed to operate the
          service for you. We retain ownership of the software, design, and
          underlying systems.
        </p>
      </LegalSection>

      <LegalSection heading="Pricing and payment">
        <p>
          Plan pricing is listed at <a className="text-navy hover:underline" href="/#pricing">starprepai.com/#pricing</a>.
          Subscriptions auto-renew unless cancelled. You can cancel at any
          time from your account settings; cancellation takes effect at the
          end of the current billing period.
        </p>
      </LegalSection>

      <LegalSection heading="Termination">
        <p>
          You can close your account at any time. We can suspend or terminate
          your access if you materially breach these terms, with notice where
          reasonable. On termination we delete your data per the schedule in
          our <a className="text-navy hover:underline" href="/privacy">Privacy Policy</a>.
        </p>
      </LegalSection>

      <LegalSection heading="Disclaimer of warranties">
        <p>
          The service is provided &quot;as is&quot; without warranty of any kind. We
          do not guarantee that the service will be uninterrupted, error-free,
          or that AI-generated content will be fit for any particular
          classroom use.
        </p>
      </LegalSection>

      <LegalSection heading="Limitation of liability">
        <p>
          To the maximum extent permitted by law, our total liability for any
          claim arising from these terms or your use of the service is
          limited to the amount you paid us in the twelve months preceding
          the claim. We are not liable for indirect, incidental, or
          consequential damages.
        </p>
      </LegalSection>

      <LegalSection heading="Governing law">
        <p>
          These terms are governed by the laws of the State of Texas, without
          regard to conflict of laws rules. Any dispute will be resolved in
          the state or federal courts located in Texas.
        </p>
      </LegalSection>

      <LegalSection heading="Contact">
        <p>
          Questions about these terms: <a className="text-navy hover:underline" href="mailto:legal@starprepai.com">legal@starprepai.com</a>.
        </p>
      </LegalSection>
    </LegalShell>
  );
}
