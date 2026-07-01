/**
 * app/api/generate/route.ts
 * ---------------------------------------------------------------------------
 * POST /api/generate
 * Authenticated, rate-limited, CSRF-protected. The Anthropic key stays on the
 * server and the call is logged to the `generations` table for usage metering.
 * ---------------------------------------------------------------------------
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { generateQuestions } from "@/lib/anthropic";
import { assertSameOrigin, isAllowedUser } from "@/lib/security";
import { rateLimit, LIMITS, dailyCap, DAILY_CAPS } from "@/lib/rateLimit";

export const runtime = "nodejs";
export const maxDuration = 60;

const BodySchema = z.object({
  grade: z.string().min(1).max(60),
  subject: z.enum(["Mathematics", "Reading Language Arts", "Science", "Social Studies"]),
  teks: z.string().min(1).max(200),
  count: z.number().int().min(3).max(10),
  language: z.enum(["English", "Spanish"]).default("English"),
  questionTypes: z.array(z.string().max(40)).min(1).max(9),
  targetLevel: z.enum(["Did Not Meet", "Approaches", "Meets", "Masters"]).default("Meets"),
});

export async function POST(req: NextRequest) {
  const originErr = assertSameOrigin(req);
  if (originErr) return originErr;

  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }
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

  // Daily ceilings: hard caps that protect the Anthropic bill regardless of
  // burst patterns. Per-user cap is a per-account safety; global cap is a
  // platform-wide budget guard.
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
    const questions = await generateQuestions({
      grade: body.grade as any,
      subject: body.subject,
      teks: body.teks,
      count: body.count,
      language: body.language,
      questionTypes: body.questionTypes as any,
      targetLevel: body.targetLevel,
    });

    await supabase.from("generations").insert({
      user_id: user.id,
      grade: body.grade,
      subject: body.subject,
      teks: body.teks,
      count: questions.length,
    });

    return NextResponse.json({ questions });
  } catch (err) {
    console.error("generate error:", err);
    return NextResponse.json(
      { error: "Generation failed. Please try again." },
      { status: 502 }
    );
  }
}
