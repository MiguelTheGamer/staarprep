/**
 * app/api/stripe/webhook/route.ts
 * POST /api/stripe/webhook, upgrades a user's plan on successful checkout.
 * Uses the service-role key to update the profile (bypasses RLS, server-only).
 */
import { NextRequest, NextResponse } from "next/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { stripe, isStripeConfigured } from "@/lib/stripe";
import type { Database } from "@/lib/database.types";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  if (!isStripeConfigured()) {
    return NextResponse.json({ error: "Stripe not configured." }, { status: 503 });
  }

  const sig = req.headers.get("stripe-signature");
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!sig || !secret) {
    return NextResponse.json({ error: "Missing webhook signature." }, { status: 400 });
  }

  const raw = await req.text();
  let event;
  try {
    event = stripe!.webhooks.constructEvent(raw, sig, secret);
  } catch (err) {
    return NextResponse.json({ error: "Invalid signature." }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as any;
    const userId = session.client_reference_id as string | null;
    if (userId) {
      const admin = createAdminClient<Database>(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      );
      await admin.from("profiles").update({ plan: "teacher" }).eq("id", userId);
    }
  }

  return NextResponse.json({ received: true });
}
