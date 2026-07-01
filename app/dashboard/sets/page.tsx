/**
 * app/dashboard/sets/page.tsx
 * Lists the teacher's saved question sets.
 */
import { createClient } from "@/lib/supabase/server";
import { Topbar } from "@/components/Topbar";
import { SetsList, type SetRow } from "@/components/SetsList";

export default async function SetsPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data } = await supabase
    .from("question_sets")
    .select("id, title, grade, subject, teks, questions, created_at")
    .eq("user_id", user!.id)
    .order("created_at", { ascending: false });

  return (
    <>
      <Topbar title="My Question Sets" />
      <main className="p-10">
        <p className="mb-8 max-w-xl text-stone">
          Saved sets you&apos;ve generated. Export any set as a print-ready PDF
          with answer key, or delete ones you no longer need.
        </p>
        <SetsList initialSets={(data as SetRow[]) ?? []} />
      </main>
    </>
  );
}
