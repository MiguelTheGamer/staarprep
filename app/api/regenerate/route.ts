/**
 * app/api/regenerate/route.ts
 * POST /api/regenerate, regenerate a single flagged question.
 */
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { regenerateOne } from "@/lib/anthropic";
import { assertSameOrigin, isAllowedUser } from "@/lib/security";
import { rateLimit, LIMITS, dailyCap, DAILY_CAPS } from "@/lib/rateLimit";

export const runtime = "nodejs";
export const maxDuration = 30;

const BodySchema = z.object({
  grade: z.string(),
  subject: z.enum(["Mathematics", "Reading Language Arts", "Science", "Social Studies"]),
  teks: z.string().min(1).max(200),
  questionType: z.string(),
  targetLevel: z.enum(["Did Not Meet", "Approaches", "Meets", "Masters"]).default("Meets"),
  avoid: z.string().optional(),
});

export async function POST(req: NextRequest) {
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

  const limit = rateLimit(`generate:${user.id}`, LIMITS.generate.capacity, LIMITS.generate.refillPerSecond);
  if (!limit.allowed) {
    return NextResponse.json(
      { error: "Rate limit exceeded. Try again shortly." },
      { status: 429, headers: { "Retry-After": String(Math.ceil((limit.resetAt - Date.now()) / 1000)) } }
    );
  }
  const perUser = dailyCap(`gen-user:${user.id}`, DAILY_CAPS.perUser);
  if (!perUser.allowed) {
    return NextResponse.json(
      { error: "Daily generation limit reached for this account. Resets at 00:00 UTC." },
      { status: 429 }
    );
  }
  const global = dailyCap("gen-global", DAILY_CAPS.global);
  if (!global.allowed) {
    return NextResponse.json(
      { error: "Service capacity reached for today. Please try again tomorrow." },
      { status: 503 }
    );
  }

  let body: z.infer<typeof BodySchema>;
  try {
    body = BodySchema.parse(await req.json());
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  try {
    const question = await regenerateOne({
      grade: body.grade as any,
      subject: body.subject,
      teks: body.teks,
      questionType: body.questionType as any,
      targetLevel: body.targetLevel,
      avoid: body.avoid,
    });
    return NextResponse.json({ question });
  } catch (err) {
    console.error("regenerate error:", err);
    return NextResponse.json({ error: "Regeneration failed." }, { status: 502 });
  }
}
