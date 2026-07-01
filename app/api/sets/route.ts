/**
 * app/api/sets/route.ts
 * ---------------------------------------------------------------------------
 * GET  /api/sets   → list the current teacher's saved question sets
 * POST /api/sets   → save a new set (questions stored as JSONB)
 *
 * All access is scoped to the authenticated user by Row Level Security; we
 * also filter explicitly as defense in depth.
 * ---------------------------------------------------------------------------
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { assertSameOrigin, isAllowedUser } from "@/lib/security";
import { rateLimit, LIMITS } from "@/lib/rateLimit";

export const runtime = "nodejs";

export async function GET() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

  const { data, error } = await supabase
    .from("question_sets")
    .select("id, title, grade, subject, teks, questions, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ sets: data });
}

const SaveSchema = z.object({
  title: z.string().min(1).max(200),
  grade: z.string(),
  subject: z.string(),
  teks: z.string(),
  questions: z.array(z.any()).min(1),
});

export async function POST(req: NextRequest) {
  const originErr = assertSameOrigin(req);
  if (originErr) return originErr;

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

  let body: z.infer<typeof SaveSchema>;
  try {
    body = SaveSchema.parse(await req.json());
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("question_sets")
    .insert({
      user_id: user.id,
      title: body.title,
      grade: body.grade,
      subject: body.subject,
      teks: body.teks,
      questions: body.questions,
    })
    .select("id")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ id: data.id });
}
