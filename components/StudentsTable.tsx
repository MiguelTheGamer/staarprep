"use client";

/**
 * components/StudentsTable.tsx
 * Roster view with quick add and remove. Scores/status come from joined
 * results when present; otherwise the row shows "No data yet".
 */

import { useState } from "react";
import { Tag } from "./ui/Tag";
import { Button } from "./ui/Button";
import { useToast } from "./ui/Toast";

export interface StudentRow {
  id: string;
  display_name: string;
  class_period: string | null;
  avgScore: number | null;
  weakestTeks: string | null;
}

function statusFor(score: number | null) {
  if (score === null) return <span className="text-stone">No data yet</span>;
  if (score >= 75) return <Tag tone="success">On track</Tag>;
  if (score >= 60) return <Tag tone="amber">Watch</Tag>;
  return <Tag tone="red">Needs support</Tag>;
}

export function StudentsTable({ initialStudents }: { initialStudents: StudentRow[] }) {
  const toast = useToast();
  const [students, setStudents] = useState(initialStudents);
  const [name, setName] = useState("");
  const [period, setPeriod] = useState("");
  const [adding, setAdding] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);

  async function addStudent() {
    if (!name.trim()) return;
    setAdding(true);
    const res = await fetch("/api/students", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        display_name: name.trim(),
        class_period: period.trim() || undefined,
      }),
    });
    setAdding(false);
    if (res.ok) {
      // Reload to get the real id and any server-side defaults
      window.location.reload();
    } else {
      toast("Couldn't add student");
    }
  }

  async function removeStudent(id: string, displayName: string) {
    if (!confirm(`Remove ${displayName} from the roster?`)) return;
    setRemovingId(id);
    const res = await fetch(`/api/students/${id}`, { method: "DELETE" });
    setRemovingId(null);
    if (res.ok) {
      setStudents((s) => s.filter((x) => x.id !== id));
      toast("Student removed");
    } else {
      toast("Could not remove");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end gap-3 rounded-lg border border-stone-light bg-surface p-5">
        <div className="min-w-[180px] flex-1">
          <label className="mb-1.5 block text-[13px] font-medium">Student name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Aaliyah Martinez"
            className="w-full rounded-md border border-stone-light bg-surface p-2.5 text-sm outline-none focus:border-navy focus:ring-2 focus:ring-navy/[0.06]"
          />
        </div>
        <div className="w-32">
          <label className="mb-1.5 block text-[13px] font-medium">Period</label>
          <input
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            placeholder="3"
            className="w-full rounded-md border border-stone-light bg-surface p-2.5 text-sm outline-none focus:border-navy focus:ring-2 focus:ring-navy/[0.06]"
          />
        </div>
        <Button size="sm" onClick={addStudent} disabled={adding || !name.trim()}>
          {adding ? "Adding..." : "Add student"}
        </Button>
      </div>

      {students.length === 0 ? (
        <div className="rounded-lg border border-dashed border-stone-light bg-surface p-16 text-center">
          <h2 className="font-display mb-2 text-2xl font-normal">No students yet</h2>
          <p className="mx-auto max-w-sm text-stone">
            Add students above, or bulk-import a roster via CSV in production.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-stone-light bg-surface">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                {["Student", "Period", "Avg. score", "Weakest TEKS", "Status", ""].map((h) => (
                  <th key={h} className="border-b border-stone-light bg-bg px-6 py-4 text-left text-xs font-medium uppercase tracking-wide text-stone">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {students.map((s) => (
                <tr key={s.id} className="hover:bg-bg">
                  <td className="border-b border-stone-light px-6 py-4 text-sm font-medium">{s.display_name}</td>
                  <td className="border-b border-stone-light px-6 py-4 text-sm text-stone">{s.class_period ?? "-"}</td>
                  <td className="border-b border-stone-light px-6 py-4 text-sm">
                    {s.avgScore === null ? (
                      <span className="text-stone">-</span>
                    ) : (
                      <span
                        className="font-semibold"
                        style={{ color: s.avgScore < 60 ? "#C0392B" : s.avgScore < 75 ? "#B45309" : "#1A7F4B" }}
                      >
                        {s.avgScore}%
                      </span>
                    )}
                  </td>
                  <td className="border-b border-stone-light px-6 py-4 text-sm">
                    {s.weakestTeks ? <Tag>{s.weakestTeks}</Tag> : <span className="text-stone">-</span>}
                  </td>
                  <td className="border-b border-stone-light px-6 py-4 text-sm">{statusFor(s.avgScore)}</td>
                  <td className="border-b border-stone-light px-6 py-4 text-right">
                    <button
                      onClick={() => removeStudent(s.id, s.display_name)}
                      disabled={removingId === s.id}
                      className="text-[13px] text-stone hover:text-red disabled:opacity-50"
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
