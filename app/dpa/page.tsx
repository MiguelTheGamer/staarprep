import { LegalShell, LegalSection } from "@/components/LegalShell";

export const metadata = { title: "Data Processing Agreement" };

export default function DPA() {
  return (
    <LegalShell title="Student Data Processing Agreement" updated="June 29, 2026">
      <p>
        This page summarizes our standard data processing terms for school
        districts. We will execute a fully countersigned Data Processing
        Agreement (DPA) or Texas Student Data Privacy Agreement (TX-NDPA) on
        request before any production use with student data.
      </p>

      <LegalSection heading="Role of parties">
        <p>
          The school district is the data controller of student records. We
          are a data processor acting on the district&apos;s documented
          instructions. We act as a &quot;school official&quot; under the FERPA
          school-official exception when contracted by a district.
        </p>
      </LegalSection>

      <LegalSection heading="Categories of data processed">
        <ul className="list-disc space-y-1 pl-6">
          <li>Student display name (typically a first name or initial)</li>
          <li>Class period label (optional)</li>
          <li>Student information system identifier (optional)</li>
          <li>Question responses and computed scores</li>
        </ul>
        <p>
          We do not process names, addresses, phone numbers, photos,
          biometric data, demographic data, or any other category of student
          information.
        </p>
      </LegalSection>

      <LegalSection heading="Purpose limitation">
        <p>
          We process student data only to administer practice assignments,
          auto-grade submissions, and surface mastery analytics back to the
          teacher who owns the roster. We do not use student data for
          marketing, product development, model training, or any other
          purpose.
        </p>
      </LegalSection>

      <LegalSection heading="Security measures">
        <p>
          Encryption in transit (TLS 1.2+) and at rest (AES-256). Row Level
          Security on every database table that holds user data. Same-origin
          enforcement on all mutating endpoints. Strict response headers
          including HSTS and CSP. Server-side validation of every request.
          Per-user and global rate limits. Weekly dependency vulnerability
          scans. Detailed audit logs of authentication events.
        </p>
      </LegalSection>

      <LegalSection heading="Subprocessors">
        <p>
          We maintain a list of subprocessors and the data each one accesses
          in our <a className="text-navy hover:underline" href="/privacy">Privacy Policy</a>.
          We will give districts 30 days&apos; notice before adding or replacing
          any subprocessor.
        </p>
      </LegalSection>

      <LegalSection heading="Data subject requests">
        <p>
          If a parent or eligible student requests access, correction, or
          deletion of their student record, the district contacts us and we
          will execute the requested operation within 30 days. Districts also
          have a self-service export and delete option in the admin
          dashboard.
        </p>
      </LegalSection>

      <LegalSection heading="Breach notification">
        <p>
          We will notify the district in writing within 72 hours of
          confirming a security incident that affects student data, with the
          details necessary for the district to meet its own notification
          obligations under state and federal law.
        </p>
      </LegalSection>

      <LegalSection heading="Retention and return">
        <p>
          We retain student data only as long as the district&apos;s account is
          active. On termination, we delete all student data within 30 days
          unless legally required to retain it, and we will provide a copy in
          machine-readable format on request before deletion.
        </p>
      </LegalSection>

      <LegalSection heading="No sale, no advertising">
        <p>
          We do not sell student data. We do not use student data for
          targeted advertising. We do not build a personal profile on any
          student.
        </p>
      </LegalSection>

      <LegalSection heading="Request the full DPA">
        <p>
          For the executable Data Processing Agreement, the Texas Student
          Data Privacy Agreement, or any state-specific addendum, email{" "}
          <a className="text-navy hover:underline" href="mailto:privacy@starprepai.com">privacy@starprepai.com</a>{" "}
          with your district name and any required template.
        </p>
      </LegalSection>
    </LegalShell>
  );
}
