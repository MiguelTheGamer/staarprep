"use client";

/**
 * components/SetsList.tsx
 * Lists saved question sets. Each card supports: view detail, assign to class,
 * export PDF with answer key, delete.
 */

import { useState } from "react";
import Link from "next/link";
import type { GeneratedQuestion } from "@/lib/prompts";
import { Tag } from "./ui/Tag";
import { Button } from "./ui/Button";
import { useToast } from "./ui/Toast";

export interface SetRow {
  id: string;
  title: string;
  grade: string;
  subject: string;
  teks: string | null;
  questions: GeneratedQuestion[];
  created_at: string;
}

export function SetsList({ initialSets }: { initialSets: SetRow[] }) {
  const toast = useToast();
  const [sets, setSets] = useState(initialSets);
  const [busy, setBusy] = useState<string | null>(null);

  async function remove(id: string) {
    if (!confirm("Delete this question set? This cannot be undone.")) return;
    setBusy(id);
    const res = await fetch(`/api/sets/${id}`, { method: "DELETE" });
    setBusy(null);
    if (res.ok) {
      setSets((s) => s.filter((x) => x.id !== id));
      toast("Set deleted");
    } else {
      toast("Could not delete");
    }
  }

  async function assign(id: string) {
    setBusy(id);
    const res = await fetch("/api/assignments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ set_id: id }),
    });
    setBusy(null);
    if (!res.ok) {
      toast("Could not assign");
      return;
    }
    const { id: assignmentId } = await res.json();
    const url = `${window.location.origin}/take/${assignmentId}`;
    try {
      await navigator.clipboard.writeText(url);
      toast("Assigned, link copied to clipboard");
    } catch {
      // Clipboard API blocked (insecure context, etc). Fall back to a prompt.
      window.prompt("Share this link with your students:", url);
      toast("Assigned");
    }
  }

  function exportSet(id: string) {
    window.open(`/api/export?setId=${id}`, "_blank");
  }

  if (sets.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-stone-light bg-surface p-16 text-center">
        <h2 className="font-display mb-2 text-2xl font-normal">No saved sets yet</h2>
        <p className="mx-auto max-w-sm text-stone">
          Generate a set of questions and hit &ldquo;Save&rdquo; to keep it here.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {sets.map((s) => (
        <div key={s.id} className="flex flex-col rounded-lg border border-stone-light bg-surface p-6">
          <div className="mb-4 flex items-start justify-between">
            <div className="min-w-0">
              <Link
                href={`/dashboard/sets/${s.id}`}
                className="font-display block truncate text-lg font-normal hover:text-red"
              >
                {s.title}
              </Link>
              <p className="text-[13px] text-stone">
                {s.grade} &middot; {s.subject}
                {s.teks ? ` · TEKS ${s.teks}` : ""}
              </p>
            </div>
            <Tag>{s.questions.length} Q</Tag>
          </div>

          <div className="mt-auto flex flex-wrap items-center gap-2 border-t border-stone-light pt-4">
            <Link
              href={`/dashboard/sets/${s.id}`}
              className="rounded border border-stone-light px-3 py-1.5 text-[13px] font-medium text-navy hover:bg-navy/[0.06]"
            >
              View
            </Link>
            <Button size="sm" variant="secondary" onClick={() => exportSet(s.id)} disabled={busy === s.id}>
              Export
            </Button>
            <Button size="sm" onClick={() => assign(s.id)} disabled={busy === s.id}>
              Assign
            </Button>
            <button
              onClick={() => remove(s.id)}
              disabled={busy === s.id}
              className="ml-auto text-[13px] text-stone transition hover:text-red disabled:opacity-50"
            >
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
