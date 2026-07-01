/**
 * app/api/results/route.ts
 * GET  /api/results  → all results for this teacher (powers analytics)
 * POST /api/results  → record a graded submission for a student
 *
 * Grading happens server-side via lib/grading so the answer key is never
 * shipped to the student's browser.
 */
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { gradeSubmission, type StudentAnswer } from "@/lib/grading";
import { assertSameOrigin, isAllowedUser } from "@/lib/security";
import { rateLimit, LIMITS } from "@/lib/rateLimit";

export const runtime = "nodejs";

export async function GET() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

  const { data, error } = await supabase
    .from("results")
    .select("id, student_id, score, teks_breakdown, submitted_at")
    .eq("teacher_id", user.id)
    .order("submitted_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ results: data });
}

const BodySchema = z.object({
  assignment_id: z.string().uuid(),
  student_id: z.string().uuid(),
  answers: z.array(z.object({
    questionIndex: z.number().int(),
    selected: z.array(z.string()),
  })),
});

export async function POST(req: NextRequest) {
  const originErr = assertSameOrigin(req);
  if (originErr) return originErr;

  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

  let body: z.infer<typeof BodySchema>;
  try { body = BodySchema.parse(await req.json()); }
  catch { return NextResponse.json({ error: "Invalid request." }, { status: 400 }); }

  // Load the assignment's set (with the answer key), server-side only.
  const { data: assignment } = await supabase
    .from("assignments").select("set_id").eq("id", body.assignment_id).eq("teacher_id", user.id).single();
  if (!assignment) return NextResponse.json({ error: "Assignment not found." }, { status: 404 });

  const { data: set } = await supabase
    .from("question_sets").select("questions").eq("id", assignment.set_id).single();
  if (!set) return NextResponse.json({ error: "Set not found." }, { status: 404 });

  const graded = gradeSubmission(set.questions, body.answers as StudentAnswer[]);

  const { error } = await supabase.from("results").insert({
    assignment_id: body.assignment_id,
    student_id: body.student_id,
    teacher_id: user.id,
    score: graded.score,
    teks_breakdown: graded.teksBreakdown,
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ score: graded.score, needsReview: graded.needsReview });
}
