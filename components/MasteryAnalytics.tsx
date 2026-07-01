"use client";

/**
 * components/MasteryAnalytics.tsx
 * Class TEKS mastery table. Weak standards (< threshold) get a "Generate
 * remediation" button that routes to the generator pre-filled with that
 * standard, the closing-the-loop feature that differentiates the product.
 */

import { useRouter } from "next/navigation";
import { REMEDIATION_THRESHOLD, type TeksMastery } from "@/lib/grading";
import { SAMPLE_TEKS } from "@/lib/teks";
import { Tag } from "./ui/Tag";
import { Button } from "./ui/Button";

function color(m: number) {
  return m < 60 ? "#C0392B" : m < 75 ? "#B45309" : "#1A7F4B";
}

function describe(code: string): string {
  return SAMPLE_TEKS.find((t) => t.code === code)?.description ?? "-";
}

export function MasteryAnalytics({
  mastery,
  grade,
  subject,
}: {
  mastery: TeksMastery[];
  grade: string;
  subject: string;
}) {
  const router = useRouter();
  const weak = mastery.filter((m) => m.mastery < REMEDIATION_THRESHOLD);

  function remediate(code: string) {
    const params = new URLSearchParams({
      teks: `${code} ${describe(code)}`,
      grade,
      subject,
    });
    router.push(`/dashboard?${params.toString()}`);
  }

  if (mastery.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-stone-light bg-surface p-16 text-center">
        <h2 className="font-display mb-2 text-2xl font-normal">No mastery data yet</h2>
        <p className="mx-auto max-w-md text-stone">
          Assign question sets to your students. As results come in, this view
          shows class performance per TEKS standard and flags weak areas for
          targeted remediation.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {weak.length > 0 && (
        <div className="flex items-center gap-2 rounded-md border border-[#F5D9A8] bg-[#FEF6E7] px-4 py-3 text-[13px] text-amber">
          <span aria-hidden>⚠</span>
          {weak.length} standard{weak.length > 1 ? "s are" : " is"} below{" "}
          {REMEDIATION_THRESHOLD}% mastery. Targeted practice recommended before
          the spring administration.
        </div>
      )}

      <div className="overflow-hidden rounded-lg border border-stone-light bg-surface">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              {["TEKS", "Standard", "Mastery", ""].map((h) => (
                <th key={h} className="border-b border-stone-light bg-bg px-6 py-4 text-left text-xs font-medium uppercase tracking-wide text-stone">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {mastery.map((m) => (
              <tr key={m.teks} className="hover:bg-bg">
                <td className="border-b border-stone-light px-6 py-4"><Tag tone="navy">{m.teks}</Tag></td>
                <td className="border-b border-stone-light px-6 py-4 text-sm">{describe(m.teks)}</td>
                <td className="border-b border-stone-light px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="h-1.5 w-32 max-w-[120px] overflow-hidden rounded-full bg-stone-light">
                      <div className="h-full rounded-full" style={{ width: `${m.mastery}%`, background: color(m.mastery) }} />
                    </div>
                    <span className="min-w-[36px] text-[13px] font-semibold tabular-nums" style={{ color: color(m.mastery) }}>
                      {m.mastery}%
                    </span>
                  </div>
                </td>
                <td className="border-b border-stone-light px-6 py-4 text-right">
                  {m.mastery < REMEDIATION_THRESHOLD && (
                    <Button size="sm" variant="secondary" onClick={() => remediate(m.teks)}>
                      Generate remediation
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
