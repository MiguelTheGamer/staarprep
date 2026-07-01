/**
 * app/api/students/[id]/route.ts
 * DELETE /api/students/:id  - remove a student from the roster.
 */
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { assertSameOrigin, isAllowedUser } from "@/lib/security";
import { rateLimit, LIMITS } from "@/lib/rateLimit";

export const runtime = "nodejs";

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const originErr = assertSameOrigin(req);
  if (originErr) return originErr;

  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  if (!isAllowedUser(user.email)) {
    return NextResponse.json({ error: "Account not authorized." }, { status: 403 });
  }
  const limit = rateLimit(`write:${user.id}`, LIMITS.write.capacity, LIMITS.write.refillPerSecond);
  if (!limit.allowed) {
    return NextResponse.json(
      { error: "Rate limit exceeded. Try again shortly." },
      { status: 429, headers: { "Retry-After": String(Math.ceil((limit.resetAt - Date.now()) / 1000)) } }
    );
  }

  const { error } = await supabase
    .from("students")
    .delete()
    .eq("id", params.id)
    .eq("teacher_id", user.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
