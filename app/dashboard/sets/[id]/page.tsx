/**
 * app/dashboard/sets/[id]/page.tsx
 * Read-only detail view for a saved question set. Lists every question with
 * its TEKS tag and explanation, plus actions: export PDF, assign to class.
 */
import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Topbar } from "@/components/Topbar";
import { Tag } from "@/components/ui/Tag";
import { SetDetailActions } from "@/components/SetDetailActions";
import { QUESTION_TYPE_LABELS, type QuestionType } from "@/lib/teks";

export default async function SetDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: set } = await supabase
    .from("question_sets")
    .select("*")
    .eq("id", params.id)
    .eq("user_id", user!.id)
    .single();

  if (!set) notFound();

  return (
    <>
      <Topbar title={set.title} />
      <main className="p-10">
        <div className="mb-8 flex items-start justify-between gap-6">
          <div>
            <div className="mb-3 flex flex-wrap gap-2">
              <Tag tone="navy">{set.grade}</Tag>
              <Tag>{set.subject}</Tag>
              {set.teks && <Tag tone="red">TEKS {set.teks}</Tag>}
              <Tag>{set.questions.length} questions</Tag>
            </div>
            <Link href="/dashboard/sets" className="text-[13px] text-stone hover:text-navy">
              ← Back to all sets
            </Link>
          </div>
          <SetDetailActions setId={set.id} />
        </div>

        <ol className="space-y-4">
          {set.questions.map((q: any, i: number) => (
            <li key={i} className="rounded-lg border border-stone-light bg-surface p-6">
              <div className="mb-3 flex items-center gap-2">
                <span className="font-display text-sm text-stone">{String(i + 1).padStart(2, "0")}</span>
                <Tag>{QUESTION_TYPE_LABELS[q.type as QuestionType] ?? q.type}</Tag>
                <Tag>TEKS {q.teks}</Tag>
              </div>
              <p className="mb-4 text-[15px] leading-relaxed">{q.stem}</p>

              {q.options && q.options.length > 0 && (
                <ul className="mb-3 space-y-1.5">
                  {q.options.map((o: any, j: number) => (
                    <li
                      key={j}
                      className={`flex gap-3 rounded px-3 py-2 text-sm ${
                        o.correct ? "bg-[#EDF7F2] text-success" : "text-navy"
                      }`}
                    >
                      <span className="font-semibold">{o.letter}.</span>
                      <span>{o.text}</span>
                    </li>
                  ))}
                </ul>
              )}

              {q.answer && !q.options && (
                <div className="mb-3 rounded bg-[#EDF7F2] px-3 py-2 text-sm text-success">
                  <span className="font-semibold">Expected:</span> {q.answer}
                </div>
              )}

              <p className="text-[13px] text-stone">
                <span className="font-semibold text-navy">Why:</span> {q.explanation}
              </p>
            </li>
          ))}
        </ol>
      </main>
    </>
  );
}
