"use client";

/**
 * components/QuestionCard.tsx
 * Renders a single generated question across all STAAR item types and lets the
 * teacher edit the stem/options inline, flag, or regenerate it.
 */

import { useState } from "react";
import type { GeneratedQuestion } from "@/lib/prompts";
import { QUESTION_TYPE_LABELS } from "@/lib/teks";
import { parseInlineStem } from "@/lib/inlineChoice";

export function QuestionCard({
  index,
  question,
  onChange,
  onRegenerate,
}: {
  index: number;
  question: GeneratedQuestion;
  onChange: (q: GeneratedQuestion) => void;
  onRegenerate?: () => void | Promise<void>;
}) {
  const [flagged, setFlagged] = useState(false);
  const [busy, setBusy] = useState(false);

  const updateStem = (stem: string) => onChange({ ...question, stem });
  const updateOption = (i: number, text: string) => {
    const options = [...(question.options ?? [])];
    options[i] = { ...options[i], text };
    onChange({ ...question, options });
  };
  const updateAnswer = (answer: string) => onChange({ ...question, answer });

  async function regen() {
    if (!onRegenerate) return;
    setBusy(true);
    await onRegenerate();
    setBusy(false);
    setFlagged(false);
  }

  return (
    <div
      className={`mb-4 overflow-hidden rounded-md border bg-surface transition ${
        flagged ? "border-amber bg-[#FEF6E7]" : "border-stone-light hover:shadow-sm"
      }`}
    >
      <div className="flex items-start justify-between gap-4 p-5">
        <span className="font-display pt-0.5 text-sm text-stone">
          {String(index + 1).padStart(2, "0")}
        </span>

        <div className="flex-1">
          <span className="mb-2 inline-block rounded bg-stone-light px-2 py-1 text-[11px] font-medium text-stone">
            {QUESTION_TYPE_LABELS[question.type]} · TEKS {question.teks}
          </span>
          <div
            contentEditable
            suppressContentEditableWarning
            spellCheck={false}
            onBlur={(e) => updateStem(e.currentTarget.textContent ?? "")}
            className="text-[15px] leading-relaxed text-navy outline-none focus:rounded focus:bg-bg focus:ring-2 focus:ring-navy/10"
          >
            {question.stem}
          </div>

          {question.type === "inline_choice" && (
            <p className="mt-2 text-[13px] leading-relaxed text-stone">
              <span className="font-semibold text-navy">Preview: </span>
              {parseInlineStem(question.stem).map((part, i) =>
                part.kind === "text" ? (
                  <span key={i}>{part.value}</span>
                ) : (
                  <select
                    key={i}
                    disabled
                    defaultValue={
                      part.choices.find((c) =>
                        question.options?.some(
                          (o) => o.correct && o.text.trim().toLowerCase() === c.toLowerCase()
                        )
                      ) ?? ""
                    }
                    className="mx-1 inline-block rounded border border-navy/40 bg-[#EDF2FA] px-2 py-0.5 text-[13px] font-medium text-navy"
                  >
                    {part.choices.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                )
              )}
            </p>
          )}
        </div>

        <div className="flex shrink-0 gap-1">
          <button
            onClick={() => setFlagged((f) => !f)}
            title="Flag for replacement"
            className={`flex h-[30px] w-[30px] items-center justify-center rounded-md transition ${
              flagged ? "bg-[#FEF6E7] text-amber" : "text-stone hover:bg-navy/[0.06] hover:text-navy"
            }`}
          >
            ⚑
          </button>
          {onRegenerate && (
            <button
              onClick={regen}
              disabled={busy}
              title="Regenerate this question"
              className="flex h-[30px] w-[30px] items-center justify-center rounded-md text-stone transition hover:bg-navy/[0.06] hover:text-navy disabled:opacity-50"
            >
              {busy ? (
                <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-stone-light border-t-navy" />
              ) : (
                "↻"
              )}
            </button>
          )}
        </div>
      </div>

      {question.options && question.options.length > 0 && (
        <div className="px-5 pb-4 pl-12">
          {question.options.map((opt, i) => (
            <div
              key={i}
              className={`mb-1.5 flex items-start gap-3 rounded-md px-3 py-2.5 text-sm ${
                opt.correct ? "bg-[#EDF7F2]" : "hover:bg-bg"
              }`}
            >
              <span
                className={`flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded text-[11px] font-semibold ${
                  opt.correct
                    ? "border border-success bg-success text-white"
                    : "border border-stone-light bg-surface text-stone"
                }`}
              >
                {opt.letter}
              </span>
              <span
                contentEditable
                suppressContentEditableWarning
                spellCheck={false}
                onBlur={(e) => updateOption(i, e.currentTarget.textContent ?? "")}
                className="flex-1 outline-none focus:rounded focus:bg-bg focus:ring-2 focus:ring-navy/10"
              >
                {opt.text}
              </span>
            </div>
          ))}
        </div>
      )}

      {question.type === "constructed_response" ? (
        <div className="px-5 pb-4">
          <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-stone">
            Model answer
          </label>
          <textarea
            value={question.answer ?? ""}
            onChange={(e) => updateAnswer(e.target.value)}
            rows={3}
            placeholder="No model answer provided — add one for grading reference."
            className="w-full rounded-md border border-stone-light bg-surface p-3 text-sm outline-none focus:border-navy focus:ring-2 focus:ring-navy/[0.06]"
          />
        </div>
      ) : (
        !question.options &&
        question.answer && (
          <div className="mx-5 mb-4 rounded-md bg-[#EDF7F2] px-3 py-2.5 text-sm text-success">
            <span className="font-semibold">Expected answer:</span> {question.answer}
          </div>
        )
      )}

      <div className="border-t border-stone-light bg-bg px-5 py-4 text-[13px] leading-relaxed text-stone">
        <span className="font-semibold text-navy">Why:</span> {question.explanation}
        {question.rubric && (
          <div className="mt-1">
            <span className="font-semibold text-navy">Rubric:</span> {question.rubric}
          </div>
        )}
        <span className="ml-1"> · {question.performanceLevel}</span>
      </div>
    </div>
  );
}
