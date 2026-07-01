/**
 * lib/stripe.ts
 * ---------------------------------------------------------------------------
 * Stripe billing config. Phase 2, self-serve billing for the teacher tier.
 * Campus/district plans are sold via contract (BuyBoard co-op), so only the
 * teacher tier needs self-serve checkout.
 *
 * Set STRIPE_SECRET_KEY in env to activate. Until then the checkout route
 * returns a clear "billing not configured" message rather than crashing.
 * ---------------------------------------------------------------------------
 */

import Stripe from "stripe";
import type { Plan } from "./database.types";

export const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2024-06-20" })
  : null;

export const isStripeConfigured = () => stripe !== null;

/** Plan catalog. priceId values come from the Stripe dashboard. */
export interface PlanDef {
  id: Plan;
  name: string;
  priceUsd: number | null; // null = contract / custom
  interval: "month" | "year" | null;
  priceId: string | null;  // Stripe price id (env-driven in prod)
  selfServe: boolean;
  features: string[];
}

export const PLANS: PlanDef[] = [
  {
    id: "teacher",
    name: "Teacher",
    priceUsd: 29,
    interval: "month",
    priceId: process.env.STRIPE_TEACHER_PRICE_ID ?? null,
    selfServe: true,
    features: [
      "Unlimited question generation",
      "All TEKS standards, all subjects",
      "PDF and Google Forms export",
      "Up to 40 students",
      "TEKS mastery tracking",
    ],
  },
  {
    id: "campus",
    name: "Campus",
    priceUsd: 2400,
    interval: "year",
    priceId: null,
    selfServe: false,
    features: [
      "Unlimited teachers and students",
      "Admin dashboard and analytics",
      "Campus-wide TEKS gap reports",
      "Priority support and onboarding",
      "Data agreement included",
    ],
  },
  {
    id: "district",
    name: "District",
    priceUsd: null,
    interval: null,
    priceId: null,
    selfServe: false,
    features: [
      "All campuses, single contract",
      "District-wide analytics",
      "SSO, Clever, and Canvas integration",
      "Dedicated customer success",
      "BuyBoard co-op eligible",
    ],
  },
];

export const getPlan = (id: Plan) => PLANS.find((p) => p.id === id);
