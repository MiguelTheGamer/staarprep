/**
 * app/api/assignments/route.ts
 * POST /api/assignments, assign a saved set to the class.
 */
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { assertSameOrigin, isAllowedUser } from "@/lib/security";
import { rateLimit, LIMITS } from "@/lib/rateLimit";

export const runtime = "nodejs";

const BodySchema = z.object({
  set_id: z.string().uuid(),
  due_at: z.string().datetime().optional(),
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

  // Verify the set belongs to this teacher (defense in depth on top of RLS).
  const { data: set } = await supabase
    .from("question_sets").select("id").eq("id", body.set_id).eq("user_id", user.id).single();
  if (!set) return NextResponse.json({ error: "Set not found." }, { status: 404 });

  const { data, error } = await supabase
    .from("assignments")
    .insert({ set_id: body.set_id, teacher_id: user.id, due_at: body.due_at ?? null })
    .select("id")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ id: data.id });
}
