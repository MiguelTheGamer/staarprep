/**
 * app/api/stripe/checkout/route.ts
 * POST /api/stripe/checkout, start a Checkout session for the teacher plan.
 * Returns { url } to redirect the user to. No-ops cleanly if Stripe isn't set.
 */
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { stripe, isStripeConfigured, getPlan } from "@/lib/stripe";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  if (!isStripeConfigured()) {
    return NextResponse.json(
      { error: "Billing is not configured yet. Set STRIPE_SECRET_KEY to enable." },
      { status: 503 }
    );
  }

  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

  const teacher = getPlan("teacher");
  if (!teacher?.priceId) {
    return NextResponse.json({ error: "Teacher price not configured." }, { status: 503 });
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const session = await stripe!.checkout.sessions.create({
    mode: "subscription",
    line_items: [{ price: teacher.priceId, quantity: 1 }],
    customer_email: user.email ?? undefined,
    client_reference_id: user.id,
    success_url: `${appUrl}/dashboard?billing=success`,
    cancel_url: `${appUrl}/dashboard?billing=cancelled`,
  });

  return NextResponse.json({ url: session.url });
}
