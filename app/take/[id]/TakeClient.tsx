"use client";

/**
 * app/take/[id]/TakeClient.tsx
 *
 * Three-screen flow:
 *   1. Loading state.
 *   2. Name picker (student selects their name from the roster).
 *   3. Quiz screen (one card per question; multiselect supported).
 *   4. Done screen (score shown, no answer key, single submission only).
 */
import { useEffect, useState } from "react";

type Option = { letter: string; text: string };
type Question = {
  type: string;
  teks: string;
  stem: string;
  options?: Option[];
};
type Student = { id: string; display_name: string; class_period: string | null };
type LoadedData = {
  set: { title: string; grade: string; subject: string; teks: string | null };
  questions: Question[];
  students: Student[];
};

export function TakeClient({ assignmentId }: { assignmentId: string }) {
  const [data, setData] = useState<LoadedData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [studentId, setStudentId] = useState("");
  const [answers, setAnswers] = useState<Record<number, string[]>>({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ score: number } | null>(null);

  useEffect(() => {
    fetch(`/api/take/${assignmentId}`)
      .then(async (r) => {
        if (!r.ok) {
          const body = await r.json().catch(() => ({}));
          throw new Error(body.error ?? "Could not load assignment.");
        }
        return r.json();
      })
      .then(setData)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, [assignmentId]);

  function toggleAnswer(qi: number, letter: string, multi: boolean) {
    setAnswers((prev) => {
      const cur = prev[qi] ?? [];
      if (multi) {
        return {
          ...prev,
          [qi]: cur.includes(letter) ? cur.filter((l) => l !== letter) : [...cur, letter],
        };
      }
      return { ...prev, [qi]: [letter] };
    });
  }

  async function submit() {
    if (!studentId || !data) return;
    setSubmitting(true);
    setError(null);
    const body = {
      student_id: studentId,
      answers: data.questions.map((_, i) => ({
        questionIndex: i,
        selected: answers[i] ?? [],
      })),
    };
    const res = await fetch(`/api/take/${assignmentId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setSubmitting(false);
    if (res.ok) {
      setResult(await res.json());
    } else {
      const e = await res.json().catch(() => ({}));
      setError(e.error ?? "Could not submit.");
    }
  }

  if (loading) {
    return <Centered><p className="text-stone">Loading assignment&hellip;</p></Centered>;
  }
  if (error && !data) {
    return (
      <Centered>
        <h1 className="font-display mb-2 text-3xl">Can&apos;t open this assignment</h1>
        <p className="text-stone">{error}</p>
        <p className="mt-4 text-[13px] text-stone">
          Ask your teacher to share the link again, or check that it was copied completely.
        </p>
      </Centered>
    );
  }
  if (!data) return null;

  // Done screen
  if (result) {
    return (
      <Centered>
        <div className="mb-6 flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#EDF7F2]">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden>
              <path
                d="M8 16l6 6 12-14"
                stroke="#1A7F4B"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>
        <h1 className="font-display mb-2 text-4xl font-light">Nice work.</h1>
        <p className="mb-8 text-stone">Your responses are in. You can close this tab.</p>
        <div className="rounded-lg border border-stone-light bg-surface px-6 py-5 text-left">
          <div className="text-[12px] uppercase tracking-wider text-stone">Your score</div>
          <div className="font-display mt-1 text-5xl font-light text-navy">{result.score}%</div>
        </div>
      </Centered>
    );
  }

  // Name picker
  if (!studentId) {
    return (
      <Centered>
        <h1 className="font-display mb-1 text-3xl font-light">{data.set.title}</h1>
        <p className="mb-8 text-stone">
          {data.set.grade} &middot; {data.set.subject}
          {data.set.teks ? ` · TEKS ${data.set.teks}` : ""}
        </p>
        {data.students.length === 0 ? (
          <p className="text-stone">
            Your teacher hasn&apos;t added the class roster yet. Let them know so they can add you.
          </p>
        ) : (
          <>
            <label className="mb-2 block text-sm font-medium">Pick your name to start:</label>
            <select
              className="w-full rounded-md border border-stone-light bg-surface p-3 text-sm outline-none focus:border-navy focus:ring-2 focus:ring-navy/[0.06]"
              onChange={(e) => setStudentId(e.target.value)}
              defaultValue=""
            >
              <option value="" disabled>
                Choose your name&hellip;
              </option>
              {data.students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.display_name}
                  {s.class_period ? ` (Period ${s.class_period})` : ""}
                </option>
              ))}
            </select>
          </>
        )}
      </Centered>
    );
  }

  // Quiz screen
  const allAnswered = data.questions.every((_, i) => (answers[i] ?? []).length > 0);

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 sm:py-12">
      <header className="mb-8 border-b border-stone-light pb-5">
        <h1 className="font-display text-2xl font-light">{data.set.title}</h1>
        <p className="text-[13px] text-stone">
          {data.set.grade} &middot; {data.set.subject}
          {data.set.teks ? ` · TEKS ${data.set.teks}` : ""}
        </p>
      </header>

      <ol className="space-y-6">
        {data.questions.map((q, qi) => {
          const multi = q.type === "multiselect";
          const selected = answers[qi] ?? [];
          return (
            <li key={qi} className="rounded-lg border border-stone-light bg-surface p-6">
              <div className="mb-2 text-[11px] font-medium uppercase tracking-wider text-stone">
                Question {qi + 1}
                {multi ? " (select all that apply)" : ""}
              </div>
              <p className="mb-4 text-[15px] leading-relaxed">{q.stem}</p>
              <div className="space-y-2">
                {q.options?.map((opt) => {
                  const chosen = selected.includes(opt.letter);
                  return (
                    <button
                      key={opt.letter}
                      onClick={() => toggleAnswer(qi, opt.letter, multi)}
                      className={`flex w-full items-start gap-3 rounded border p-3 text-left text-sm transition ${
                        chosen
                          ? "border-navy bg-navy/[0.04]"
                          : "border-stone-light hover:border-navy/30"
                      }`}
                    >
                      <span
                        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded text-xs font-semibold ${
                          chosen
                            ? "bg-navy text-white"
                            : "border border-stone-light bg-surface text-stone"
                        }`}
                      >
                        {opt.letter}
                      </span>
                      <span className="flex-1">{opt.text}</span>
                    </button>
                  );
                })}
              </div>
            </li>
          );
        })}
      </ol>

      {error && (
        <p className="mt-6 rounded border border-red/30 bg-[#FDF0EE] p-3 text-[13px] text-red">
          {error}
        </p>
      )}

      <div className="sticky bottom-4 mt-8 rounded-lg border border-stone-light bg-surface p-4 shadow-md">
        <button
          onClick={submit}
          disabled={!allAnswered || submitting}
          className="w-full rounded-md bg-navy py-3 font-medium text-white transition hover:bg-[#1a3050] disabled:opacity-50"
        >
          {submitting
            ? "Submitting\u2026"
            : allAnswered
              ? "Submit answers"
              : `Answer all ${data.questions.length} questions to submit`}
        </button>
      </div>
    </div>
  );
}

function Centered({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-md px-6 py-20 text-center">{children}</div>
  );
}
