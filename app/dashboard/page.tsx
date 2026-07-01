/**
 * app/dashboard/page.tsx
 * The Generate view. Layout/sidebar/auth come from app/dashboard/layout.tsx.
 * Supports ?teks= and ?grade= prefill for the one-click remediation flow from
 * the analytics page.
 */
import { Topbar } from "@/components/Topbar";
import { Generator } from "@/components/Generator";

export default function GeneratePage({
  searchParams,
}: {
  searchParams: { teks?: string; grade?: string; subject?: string };
}) {
  return (
    <>
      <Topbar title="Generate Questions" />
      <main className="p-10">
        <Generator
          initialTeks={searchParams.teks}
          initialGrade={searchParams.grade}
          initialSubject={searchParams.subject}
        />
      </main>
    </>
  );
}
