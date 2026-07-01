/**
 * app/api/take/[id]/route.ts
 *
 * Public student-facing endpoint. NO auth required: students take assignments
 * via a shareable classroom URL on shared school devices. The teacher creates
 * the assignment (which generates a uuidv4 id), copies the link to the
 * classroom projector or Google Doc, and students go to /take/<id>.
 *
 * Security model:
 *  - Uses the service-role key to read assignments (RLS is bypassed). This is
 *    intentional and safe because we strictly control what the response
 *    contains: questions WITHOUT the answer key, plus a roster of student
 *    names belonging to the assignment's teacher.
 *  - Strips `correct`, `answer`, `rubric`, `explanation` before sending.
 *  - Per-IP token-bucket rate limits prevent enumeration of assignment ids
 *    (60 reads/minute, 20 submissions/minute per IP).
 *  - One submission per student per assignment, enforced server-side.
 *  - Assignment id is a uuidv4 = 122 bits of entropy; effectively unguessable
 *    without the link.
 */
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import { gradeSubmission, type StudentAnswer } from "@/lib/grading";
import { rateLimit } from "@/lib/rateLimit";
import type { Database } from "@/lib/database.types";
import type { GeneratedQuestion } from "@/lib/prompts";

export const runtime = "nodejs";

function admin() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

function clientIp(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    req.headers.get("x-real-ip") ||
    "unknown"
  );
}

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const limit = rateLimit(`take-get:${clientIp(req)}`, 60, 1);
  if (!limit.allowed) {
    return NextResponse.json({ error: "Too many requests." }, { status: 429 });
  }

  const supabase = admin();

  const { data: assignment } = await supabase
    .from("assignments")
    .select("id, set_id, teacher_id, due_at")
    .eq("id", params.id)
    .single();
  if (!assignment) {
    return NextResponse.json({ error: "Assignment not found." }, { status: 404 });
  }

  const { data: set } = await supabase
    .from("question_sets")
    .select("title, grade, subject, teks, questions")
    .eq("id", assignment.set_id)
    .single();
  if (!set) {
    return NextResponse.json({ error: "Assignment not found." }, { status: 404 });
  }

  const { data: students } = await supabase
    .from("students")
    .select("id, display_name, class_period")
    .eq("teacher_id", assignment.teacher_id)
    .order("display_name");

  // CRITICAL: strip the answer key before sending to the browser. Students
  // never see `correct`, `answer`, `rubric`, or `explanation`.
  const safeQuestions = (set.questions as GeneratedQuestion[]).map((q) => ({
    type: q.type,
    teks: q.teks,
    stem: q.stem,
    options: q.options?.map((o) => ({ letter: o.letter, text: o.text })),
  }));

  return NextResponse.json({
    assignment: { id: assignment.id, due_at: assignment.due_at },
    set: { title: set.title, grade: set.grade, subject: set.subject, teks: set.teks },
    questions: safeQuestions,
    students: students ?? [],
  });
}

const SubmitSchema = z.object({
  student_id: z.string().uuid(),
  answers: z
    .array(
      z.object({
        questionIndex: z.number().int().min(0),
        selected: z.array(z.string().max(10)).max(10),
      })
    )
    .max(20),
});

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const limit = rateLimit(`take-post:${clientIp(req)}`, 20, 0.1);
  if (!limit.allowed) {
    return NextResponse.json({ error: "Too many submissions." }, { status: 429 });
  }

  let body: z.infer<typeof SubmitSchema>;
  try {
    body = SubmitSchema.parse(await req.json());
  } catch {
    return NextResponse.json({ error: "Invalid submission." }, { status: 400 });
  }

  const supabase = admin();

  const { data: assignment } = await supabase
    .from("assignments")
    .select("set_id, teacher_id")
    .eq("id", params.id)
    .single();
  if (!assignment) {
    return NextResponse.json({ error: "Assignment not found." }, { status: 404 });
  }

  // The student must belong to the same teacher as the assignment.
  const { data: student } = await supabase
    .from("students")
    .select("id, teacher_id")
    .eq("id", body.student_id)
    .single();
  if (!student || student.teacher_id !== assignment.teacher_id) {
    return NextResponse.json({ error: "Invalid student." }, { status: 400 });
  }

  // One submission per student per assignment.
  const { data: existing } = await supabase
    .from("results")
    .select("id")
    .eq("assignment_id", params.id)
    .eq("student_id", body.student_id)
    .maybeSingle();
  if (existing) {
    return NextResponse.json(
      { error: "You have already submitted this assignment." },
      { status: 409 }
    );
  }

  const { data: set } = await supabase
    .from("question_sets")
    .select("questions")
    .eq("id", assignment.set_id)
    .single();
  if (!set) {
    return NextResponse.json({ error: "Assignment not found." }, { status: 404 });
  }

  const graded = gradeSubmission(
    set.questions as GeneratedQuestion[],
    body.answers as StudentAnswer[]
  );

  const { error } = await supabase.from("results").insert({
    assignment_id: params.id,
    student_id: body.student_id,
    teacher_id: assignment.teacher_id,
    score: graded.score,
    teks_breakdown: graded.teksBreakdown,
  });
  if (error) {
    return NextResponse.json({ error: "Could not save submission." }, { status: 500 });
  }

  return NextResponse.json({ score: graded.score, needsReview: graded.needsReview });
}
