/**
 * app/dashboard/analytics/page.tsx
 * Computes class TEKS mastery from all results and renders the analytics table
 * with the one-click remediation loop.
 */
import { createClient } from "@/lib/supabase/server";
import { Topbar } from "@/components/Topbar";
import { MasteryAnalytics } from "@/components/MasteryAnalytics";
import { classMastery } from "@/lib/grading";

export default async function AnalyticsPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: results } = await supabase
    .from("results")
    .select("teks_breakdown")
    .eq("teacher_id", user!.id);

  const breakdowns = (results ?? []).map((r) => r.teks_breakdown ?? {});
  const mastery = classMastery(breakdowns as Record<string, number>[]);

  return (
    <>
      <Topbar title="TEKS Analytics" />
      <main className="p-10">
        <p className="mb-8 max-w-2xl text-stone">
          Class performance by TEKS standard across all assigned practice sets.
          Weak standards are flagged, click “Generate remediation” to build a
          targeted practice set for that standard in two clicks.
        </p>
        <MasteryAnalytics mastery={mastery} grade="Grade 8" subject="Mathematics" />
      </main>
    </>
  );
}
