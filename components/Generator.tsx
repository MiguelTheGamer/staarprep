"use client";

/**
 * components/Generator.tsx
 * Teacher-facing generation panel. Calls the authed server routes
 * (/api/generate, /api/regenerate, /api/sets), never the Anthropic key.
 */

import { useState } from "react";
import type { GeneratedQuestion } from "@/lib/prompts";
import {
  GRADES_BY_SUBJECT,
  TYPES_BY_SUBJECT,
  QUESTION_TYPE_LABELS,
  type Subject,
  type QuestionType,
  type PerformanceLevel,
} from "@/lib/teks";
import { QuestionCard } from "./QuestionCard";
import { Button } from "./ui/Button";
import { Tag } from "./ui/Tag";
import { useToast } from "./ui/Toast";

const SUBJECTS: Subject[] = ["Mathematics", "Reading Language Arts", "Science", "Social Studies"];
const LEVELS: PerformanceLevel[] = ["Approaches", "Meets", "Masters"];

export function Generator({
  initialTeks,
  initialGrade,
  initialSubject,
}: {
  initialTeks?: string;
  initialGrade?: string;
  initialSubject?: string;
}) {
  const toast = useToast();
  const [subject, setSubject] = useState<Subject>(
    (initialSubject as Subject) || "Mathematics"
  );
  const [grade, setGrade] = useState<string>(initialGrade || "Grade 8");
  const [teks, setTeks] = useState(initialTeks || "8.8(C) Linear equations");
  const [count, setCount] = useState(5);
  const [level, setLevel] = useState<PerformanceLevel>("Meets");
  const [types, setTypes] = useState<QuestionType[]>([
    "multiple_choice",
    "multiselect",
    "two_part",
  ]);

  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState<GeneratedQuestion[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const availableTypes = TYPES_BY_SUBJECT[subject];

  const toggleType = (t: QuestionType) =>
    setTypes((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]));

  async function generate() {
    setLoading(true);
    setError(null);
    setSaved(false);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          grade, subject, teks, count,
          language: "English", questionTypes: types, targetLevel: level,
        }),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? "Failed");
      const data = await res.json();
      setQuestions(data.questions);
      toast(`${data.questions.length} questions generated`);
    } catch (e: any) {
      setError(e.message ?? "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  async function regenerate(index: number) {
    const q = questions[index];
    try {
      const res = await fetch("/api/regenerate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          grade, subject, teks,
          questionType: q.type, targetLevel: level, avoid: q.stem,
        }),
      });
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      setQuestions((prev) => prev.map((p, i) => (i === index ? data.question : p)));
      toast("Question regenerated");
    } catch {
      toast("Couldn't regenerate, try again");
    }
  }

  async function save() {
    if (saved) return;
    const res = await fetch("/api/sets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: `${teks}, ${grade}`, grade, subject, teks, questions }),
    });
    if (res.ok) {
      setSaved(true);
      toast("Saved. Open My Question Sets to assign it.");
    } else {
      toast("Save failed");
    }
  }

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-[320px_1fr]">
      {/* Config */}
      <div className="h-fit rounded-lg border border-stone-light bg-surface p-6 lg:sticky lg:top-[88px]">
        <h2 className="mb-6 text-[13px] font-semibold">Configuration</h2>

        <Field label="Subject">
          <Select
            value={subject}
            onChange={(v) => {
              const s = v as Subject;
              setSubject(s);
              setGrade(GRADES_BY_SUBJECT[s][0]);
              setTypes(TYPES_BY_SUBJECT[s].slice(0, 3));
            }}
            options={SUBJECTS}
          />
        </Field>

        <Field label="Grade / Course">
          <Select value={grade} onChange={setGrade} options={GRADES_BY_SUBJECT[subject]} />
        </Field>

        <Field label="TEKS standard / topic" hint="Enter a TEKS code or describe the topic.">
          <input
            value={teks}
            onChange={(e) => setTeks(e.target.value)}
            className="w-full rounded-md border border-stone-light bg-surface p-3 text-sm outline-none focus:border-navy focus:ring-2 focus:ring-navy/[0.06]"
          />
        </Field>

        <Field label="STAAR item types">
          <div className="flex flex-wrap gap-2">
            {availableTypes.map((t) => (
              <button
                key={t}
                onClick={() => toggleType(t)}
                className={`rounded border px-2.5 py-1.5 text-xs font-medium transition ${
                  types.includes(t)
                    ? "border-navy bg-navy text-white"
                    : "border-stone-light text-stone hover:border-navy/20"
                }`}
              >
                {QUESTION_TYPE_LABELS[t]}
              </button>
            ))}
          </div>
        </Field>

        <Field label="Target performance level">
          <div className="flex gap-1 rounded-md border border-stone-light bg-bg p-1">
            {LEVELS.map((l) => (
              <button
                key={l}
                onClick={() => setLevel(l)}
                className={`flex-1 rounded px-2 py-2 text-[13px] font-medium transition ${
                  level === l ? "bg-surface text-navy shadow-sm" : "text-stone"
                }`}
              >
                {l}
              </button>
            ))}
          </div>
        </Field>

        <Field label="Number of questions">
          <div className="flex items-center gap-3">
            <Stepper onClick={() => setCount((c) => Math.max(3, c - 1))}>−</Stepper>
            <span className="flex-1 text-center text-base font-semibold tabular-nums">{count}</span>
            <Stepper onClick={() => setCount((c) => Math.min(10, c + 1))}>+</Stepper>
          </div>
        </Field>

        <Button onClick={generate} disabled={loading || types.length === 0} className="mt-2 w-full">
          {loading ? "Generating…" : "Generate questions"}
        </Button>
        <p className="mt-3 text-center text-xs text-stone">Powered by Claude · TEKS-aligned</p>
      </div>

      {/* Results */}
      <div>
        {error && (
          <div className="mb-4 rounded-md border border-red/30 bg-[#FDF0EE] p-4 text-sm text-red">
            {error}
          </div>
        )}

        {questions.length > 0 && (
          <div className="mb-6 flex items-center justify-between">
            <div className="flex gap-2">
              <Tag tone="navy">{grade}</Tag>
              <Tag>{subject}</Tag>
              <Tag tone="red">AI Generated</Tag>
            </div>
            <Button size="sm" onClick={save} disabled={saved}>{saved ? "Saved ✓" : "Save to My Sets"}</Button>
          </div>
        )}

        {loading && <Skeletons n={count} />}

        {!loading && questions.length === 0 && !error && (
          <div className="rounded-lg border border-dashed border-stone-light bg-surface p-16 text-center">
            <h2 className="font-display mb-2 text-2xl font-normal">Ready to generate</h2>
            <p className="mx-auto max-w-sm text-stone">
              Configure the standard on the left, then generate a full set of
              STAAR-aligned practice items in seconds.
            </p>
          </div>
        )}

        {!loading &&
          questions.map((q, i) => (
            <QuestionCard
              key={i}
              index={i}
              question={q}
              onChange={(updated) =>
                setQuestions((prev) => prev.map((p, idx) => (idx === i ? updated : p)))
              }
              onRegenerate={() => regenerate(i)}
            />
          ))}
      </div>
    </div>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="mb-5">
      <label className="mb-2 block text-[13px] font-medium text-navy">{label}</label>
      {children}
      {hint && <p className="mt-1 text-xs text-stone">{hint}</p>}
    </div>
  );
}

function Select({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: readonly string[] }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-md border border-stone-light bg-surface p-3 text-sm outline-none focus:border-navy focus:ring-2 focus:ring-navy/[0.06]"
    >
      {options.map((o) => <option key={o}>{o}</option>)}
    </select>
  );
}

function Stepper({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex h-9 w-9 items-center justify-center rounded-md border border-stone-light text-lg hover:bg-navy/[0.06]"
    >
      {children}
    </button>
  );
}

function Skeletons({ n }: { n: number }) {
  return (
    <>
      {Array.from({ length: n }).map((_, i) => (
        <div key={i} className="mb-4 rounded-lg border border-stone-light bg-surface p-5">
          <div className="mb-3 h-3.5 w-3/4 animate-pulse rounded bg-stone-light" />
          <div className="mb-3 h-3.5 w-1/2 animate-pulse rounded bg-stone-light" />
          <div className="mt-5 h-3.5 w-1/3 animate-pulse rounded bg-stone-light" />
        </div>
      ))}
    </>
  );
}
