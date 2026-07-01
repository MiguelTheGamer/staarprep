/**
 * app/api/students/route.ts
 * GET  /api/students  → roster for the current teacher
 * POST /api/students  → add a student (or bulk via { students: [...] })
 */
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { assertSameOrigin, isAllowedUser } from "@/lib/security";
import { rateLimit, LIMITS } from "@/lib/rateLimit";

export const runtime = "nodejs";

export async function GET() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

  const { data, error } = await supabase
    .from("students")
    .select("*")
    .eq("teacher_id", user.id)
    .order("display_name");

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ students: data });
}

const StudentSchema = z.object({
  display_name: z.string().min(1).max(120),
  sis_id: z.string().max(60).optional(),
  class_period: z.string().max(40).optional(),
});
const BodySchema = z.union([
  StudentSchema,
  z.object({ students: z.array(StudentSchema).min(1).max(200) }),
]);

export async function POST(req: NextRequest) {
  const originErr = assertSameOrigin(req);
  if (originErr) return originErr;

  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

  let body: z.infer<typeof BodySchema>;
  try { body = BodySchema.parse(await req.json()); }
  catch { return NextResponse.json({ error: "Invalid request." }, { status: 400 }); }

  const rows = ("students" in body ? body.students : [body]).map((s) => ({
    teacher_id: user.id,
    display_name: s.display_name,
    sis_id: s.sis_id ?? null,
    class_period: s.class_period ?? null,
  }));

  const { data, error } = await supabase.from("students").insert(rows).select("id");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ inserted: data.length });
}
