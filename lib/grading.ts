/**
 * lib/grading.ts
 * ---------------------------------------------------------------------------
 * Auto-grading + TEKS mastery computation. Choice-based items grade
 * automatically; constructed-response items are flagged for teacher review
 * (hybrid scoring, mirroring how STAAR itself scores constructed responses).
 * ---------------------------------------------------------------------------
 */

import type { GeneratedQuestion } from "./prompts";

export interface StudentAnswer {
  /** Index of the question within the set. */
  questionIndex: number;
  /** Selected option letters (one for MC, several for multiselect), or raw text. */
  selected: string[];
}

export interface GradedItem {
  questionIndex: number;
  teks: string;
  correct: boolean | null; // null = needs manual review (constructed response)
  autoGraded: boolean;
}

export interface GradeResult {
  /** 0-100, computed over auto-gradable items only. */
  score: number;
  items: GradedItem[];
  /** Per-TEKS proportion correct, e.g. { "8.8(C)": 0.5 }. */
  teksBreakdown: Record<string, number>;
  /** Items requiring teacher review. */
  needsReview: number;
}

const norm = (s: string) => s.trim().toUpperCase();

/** Grade one item against a student's answer. */
function gradeItem(q: GeneratedQuestion, answer: StudentAnswer | undefined): GradedItem {
  // Constructed response and equation entry are not auto-graded here.
  if (q.type === "constructed_response") {
    return { questionIndex: answer?.questionIndex ?? -1, teks: q.teks, correct: null, autoGraded: false };
  }

  const selected = (answer?.selected ?? []).map(norm);

  // Equation/text entry: compare against expected answer.
  if (q.type === "equation_entry") {
    const expected = norm(q.answer ?? "");
    const correct = selected.length === 1 && selected[0] === expected;
    return { questionIndex: answer?.questionIndex ?? -1, teks: q.teks, correct, autoGraded: true };
  }

  // Choice-based: the correct set must match exactly (handles MC + multiselect).
  const correctLetters = (q.options ?? [])
    .filter((o) => o.correct)
    .map((o) => norm(o.letter))
    .sort();
  const chosen = [...selected].sort();
  const correct =
    correctLetters.length === chosen.length &&
    correctLetters.every((l, i) => l === chosen[i]);

  return { questionIndex: answer?.questionIndex ?? -1, teks: q.teks, correct, autoGraded: true };
}

export function gradeSubmission(
  questions: GeneratedQuestion[],
  answers: StudentAnswer[]
): GradeResult {
  const byIndex = new Map(answers.map((a) => [a.questionIndex, a]));
  const items = questions.map((q, i) => {
    const graded = gradeItem(q, byIndex.get(i));
    graded.questionIndex = i;
    return graded;
  });

  const auto = items.filter((it) => it.autoGraded);
  const correctCount = auto.filter((it) => it.correct).length;
  const score = auto.length === 0 ? 0 : Math.round((correctCount / auto.length) * 100);

  // TEKS breakdown: proportion correct per standard (auto-graded items only).
  const tally: Record<string, { correct: number; total: number }> = {};
  for (const it of auto) {
    tally[it.teks] ??= { correct: 0, total: 0 };
    tally[it.teks].total += 1;
    if (it.correct) tally[it.teks].correct += 1;
  }
  const teksBreakdown: Record<string, number> = {};
  for (const [teks, { correct, total }] of Object.entries(tally)) {
    teksBreakdown[teks] = total === 0 ? 0 : Number((correct / total).toFixed(2));
  }

  return {
    score,
    items,
    teksBreakdown,
    needsReview: items.filter((it) => it.correct === null).length,
  };
}

/**
 * Aggregate many results into class-level mastery per TEKS standard.
 * Returns mastery as a 0-100 percentage, sorted weakest-first so the UI can
 * surface remediation candidates.
 */
export interface TeksMastery {
  teks: string;
  mastery: number; // 0-100
  sampleSize: number;
}

export function classMastery(
  breakdowns: Record<string, number>[]
): TeksMastery[] {
  const tally: Record<string, { sum: number; n: number }> = {};
  for (const b of breakdowns) {
    for (const [teks, prop] of Object.entries(b)) {
      tally[teks] ??= { sum: 0, n: 0 };
      tally[teks].sum += prop;
      tally[teks].n += 1;
    }
  }
  return Object.entries(tally)
    .map(([teks, { sum, n }]) => ({
      teks,
      mastery: Math.round((sum / n) * 100),
      sampleSize: n,
    }))
    .sort((a, b) => a.mastery - b.mastery);
}

/** A standard is a remediation candidate below this mastery threshold. */
export const REMEDIATION_THRESHOLD = 65;
