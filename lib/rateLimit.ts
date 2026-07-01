/**
 * lib/rateLimit.ts
 *
 * Per-user token bucket rate limiter, plus daily counters to cap total spend.
 *
 * The Anthropic-backed endpoints are the costly ones, so they get strict
 * caps to protect:
 *   1. Spend - a bot hammering /api/generate runs up your Anthropic bill.
 *   2. Latency - each call is multi-second; bursts hurt other users.
 *   3. The product - legitimate teacher usage is dozens per day, not
 *      thousands.
 *
 * Two layers:
 *   - Token-bucket rate limit (short-term, burst-aware)
 *   - Daily counters (long-term cost ceiling, per-user AND global)
 *
 * Implementation: in-memory Map, sufficient for a single-region Vercel
 * deployment. For multi-region or higher scale, swap the store for Upstash
 * Redis or @vercel/kv. The function signatures stay the same.
 */

interface Bucket {
  tokens: number;
  updatedAt: number;
}

const buckets = new Map<string, Bucket>();

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
}

/**
 * Token bucket: `capacity` tokens that refill at `refillPerSecond`. Each call
 * costs 1 token. If the bucket is empty, the request is denied.
 */
export function rateLimit(
  key: string,
  capacity: number,
  refillPerSecond: number
): RateLimitResult {
  const now = Date.now();
  const existing = buckets.get(key);

  let tokens: number;
  if (!existing) {
    tokens = capacity;
  } else {
    const elapsedSec = (now - existing.updatedAt) / 1000;
    tokens = Math.min(capacity, existing.tokens + elapsedSec * refillPerSecond);
  }

  let allowed = false;
  if (tokens >= 1) {
    tokens -= 1;
    allowed = true;
  }

  buckets.set(key, { tokens, updatedAt: now });

  const resetAt = now + Math.max(0, ((1 - tokens) / refillPerSecond) * 1000);
  return { allowed, remaining: Math.floor(tokens), resetAt };
}

// ---------------------------------------------------------------------------
// Daily counters: hard ceiling on Anthropic spend, independent of bucket refill.
// ---------------------------------------------------------------------------

interface DailyCounter {
  count: number;
  day: string; // YYYY-MM-DD in UTC
}

const dailyCounters = new Map<string, DailyCounter>();

function utcDay(): string {
  return new Date().toISOString().slice(0, 10);
}

/**
 * Increment a daily counter and check if the cap is exceeded.
 * Returns true if the call is allowed, false if the cap is hit.
 * Counters reset at UTC midnight automatically (next call after rollover
 * notices the new day and starts from zero).
 */
export function dailyCap(key: string, cap: number): { allowed: boolean; count: number } {
  const day = utcDay();
  const cur = dailyCounters.get(key);
  if (!cur || cur.day !== day) {
    dailyCounters.set(key, { count: 1, day });
    return { allowed: 1 <= cap, count: 1 };
  }
  if (cur.count >= cap) {
    return { allowed: false, count: cur.count };
  }
  cur.count += 1;
  return { allowed: true, count: cur.count };
}

/** Convenience presets per endpoint class. Tune as real usage emerges. */
export const LIMITS = {
  /** Heavy AI calls: 20 / hour per user, with short bursts allowed. */
  generate: { capacity: 20, refillPerSecond: 20 / 3600 },
  /** Cheaper writes (save / assign / add student): 60 / minute per user. */
  write: { capacity: 60, refillPerSecond: 1 },
  /** Reads: 300 / minute per user. */
  read: { capacity: 300, refillPerSecond: 5 },
};

/**
 * Daily caps on Anthropic usage. These are HARD ceilings that protect the
 * monthly bill. Override via env (DAILY_USER_CAP, DAILY_GLOBAL_CAP) to retune
 * without redeploying code.
 *
 * Defaults:
 *   - 100 generations per user per day (a working teacher rarely exceeds 30)
 *   - 2000 generations across all users per day (early-stage budget guard)
 */
export const DAILY_CAPS = {
  perUser: Number(process.env.DAILY_USER_CAP ?? 100),
  global: Number(process.env.DAILY_GLOBAL_CAP ?? 2000),
};
