/**
 * app/dashboard/students/page.tsx
 * Roster + per-student performance. Joins students with their results to show
 * average score and weakest TEKS standard.
 */
import { createClient } from "@/lib/supabase/server";
import { Topbar } from "@/components/Topbar";
import { StudentsTable, type StudentRow } from "@/components/StudentsTable";

export default async function StudentsPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: students } = await supabase
    .from("students")
    .select("id, display_name, class_period")
    .eq("teacher_id", user!.id)
    .order("display_name");

  const { data: results } = await supabase
    .from("results")
    .select("student_id, score, teks_breakdown")
    .eq("teacher_id", user!.id);

  // Aggregate results per student.
  const byStudent = new Map<string, { scores: number[]; teks: Record<string, number[]> }>();
  for (const r of results ?? []) {
    const agg = byStudent.get(r.student_id) ?? { scores: [], teks: {} };
    if (r.score !== null) agg.scores.push(r.score);
    for (const [code, prop] of Object.entries(r.teks_breakdown ?? {})) {
      (agg.teks[code] ??= []).push(prop as number);
    }
    byStudent.set(r.student_id, agg);
  }

  const rows: StudentRow[] = (students ?? []).map((s) => {
    const agg = byStudent.get(s.id);
    const avgScore =
      agg && agg.scores.length
        ? Math.round(agg.scores.reduce((a, b) => a + b, 0) / agg.scores.length)
        : null;
    let weakestTeks: string | null = null;
    if (agg) {
      let lowest = Infinity;
      for (const [code, props] of Object.entries(agg.teks)) {
        const m = props.reduce((a, b) => a + b, 0) / props.length;
        if (m < lowest) { lowest = m; weakestTeks = code; }
      }
    }
    return {
      id: s.id,
      display_name: s.display_name,
      class_period: s.class_period,
      avgScore,
      weakestTeks,
    };
  });

  return (
    <>
      <Topbar title="Students" />
      <main className="p-10">
        <p className="mb-8 max-w-xl text-stone">
          Your roster with per-student STAAR performance. Scores populate
          automatically as students complete assigned sets.
        </p>
        <StudentsTable initialStudents={rows} />
      </main>
    </>
  );
}
