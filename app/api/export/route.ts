/**
 * app/api/export/route.ts
 * GET /api/export?setId=...  → returns a print-ready HTML worksheet.
 * The client opens this in a new tab and triggers print → save as PDF.
 */
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { buildWorksheetHtml } from "@/lib/export";
import { assertSameOrigin, isAllowedUser } from "@/lib/security";
import { rateLimit, LIMITS } from "@/lib/rateLimit";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

  const setId = req.nextUrl.searchParams.get("setId");
  const withKey = req.nextUrl.searchParams.get("key") !== "0";
  if (!setId) return NextResponse.json({ error: "Missing setId." }, { status: 400 });

  const { data: set, error } = await supabase
    .from("question_sets").select("*").eq("id", setId).eq("user_id", user.id).single();
  if (error || !set) return NextResponse.json({ error: "Not found." }, { status: 404 });

  const html = buildWorksheetHtml(
    { title: set.title, grade: set.grade, subject: set.subject, teks: set.teks },
    set.questions,
    { includeAnswerKey: withKey }
  );

  return new NextResponse(html, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
