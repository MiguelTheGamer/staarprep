/**
 * app/api/sets/[id]/route.ts
 * GET    /api/sets/:id  → fetch one set (RLS-scoped)
 * DELETE /api/sets/:id  → delete a set
 */
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { assertSameOrigin, isAllowedUser } from "@/lib/security";
import { rateLimit, LIMITS } from "@/lib/rateLimit";

export const runtime = "nodejs";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  if (!isAllowedUser(user.email)) {
    return NextResponse.json({ error: "Account not authorized." }, { status: 403 });
  }
  const limit = rateLimit(`read:${user.id}`, LIMITS.read.capacity, LIMITS.read.refillPerSecond);
  if (!limit.allowed) {
    return NextResponse.json(
      { error: "Rate limit exceeded. Try again shortly." },
      { status: 429, headers: { "Retry-After": String(Math.ceil((limit.resetAt - Date.now()) / 1000)) } }
    );
  }

  const { data, error } = await supabase
    .from("question_sets")
    .select("*")
    .eq("id", params.id)
    .eq("user_id", user.id)
    .single();

  if (error) return NextResponse.json({ error: "Not found." }, { status: 404 });
  return NextResponse.json({ set: data });
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const originErr = assertSameOrigin(req);
  if (originErr) return originErr;

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  if (!isAllowedUser(user.email)) {
    return NextResponse.json({ error: "Account not authorized." }, { status: 403 });
  }
  const limit = rateLimit(`read:${user.id}`, LIMITS.read.capacity, LIMITS.read.refillPerSecond);
  if (!limit.allowed) {
    return NextResponse.json(
      { error: "Rate limit exceeded. Try again shortly." },
      { status: 429, headers: { "Retry-After": String(Math.ceil((limit.resetAt - Date.now()) / 1000)) } }
    );
  }

  const { error } = await supabase
    .from("question_sets")
    .delete()
    .eq("id", params.id)
    .eq("user_id", user.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
