/**
 * lib/prompts.ts
 * ---------------------------------------------------------------------------
 * Builds the system + user prompt for STAAR question generation and defines
 * the strict output schema we validate against. The quality of the whole
 * product lives here: a generic "write me a quiz" prompt produces generic
 * questions. STAAR fidelity comes from encoding the real test's constraints.
 * ---------------------------------------------------------------------------
 */

import { z } from "zod";
import type {
  Grade, Subject, Language, PerformanceLevel, QuestionType,
} from "./teks";

// ── Output schema (what the model must return) ──────────────────────────────

export const OptionSchema = z.object({
  letter: z.string(),          // "A", "B", ... (or "1","2" for matching rows)
  text: z.string(),
  correct: z.boolean(),
});

export const QuestionSchema = z.object({
  type: z.enum([
    "multiple_choice", "multiselect", "inline_choice", "equation_entry",
    "hot_spot", "drag_and_drop", "matching", "two_part", "constructed_response",
  ]),
  teks: z.string(),                     // aligned standard, e.g. "8.8(C)"
  stem: z.string(),                     // the question text
  options: z.array(OptionSchema).optional(),  // omit for equation_entry / CR
  answer: z.string().optional(),        // for equation_entry / constructed
  rubric: z.string().optional(),        // for constructed_response
  explanation: z.string(),              // why the answer is correct
  performanceLevel: z.enum(["Did Not Meet", "Approaches", "Meets", "Masters"]),
});

export const GenerationResponseSchema = z.object({
  questions: z.array(QuestionSchema),
});

export type GeneratedQuestion = z.infer<typeof QuestionSchema>;

// ── Request shape ────────────────────────────────────────────────────────────

export interface GenerateParams {
  grade: Grade;
  subject: Subject;
  teks: string;                 // code or free-text topic
  count: number;                // 3-10
  language: Language;           // English | Spanish (3-5)
  questionTypes: QuestionType[];// which TEI types to include
  targetLevel: PerformanceLevel;// rigor target
}

// ── Prompt construction ──────────────────────────────────────────────────────

const SYSTEM_PROMPT = `You are an expert Texas STAAR assessment item writer employed by a Texas \
school district's curriculum department. You have written hundreds of items that \
mirror official STAAR released test questions in format, rigor, and language.

Non-negotiable rules:
- EVERY item must align to a specific TEKS student expectation for the stated \
grade, subject, and course. STAAR items are always TEKS-aligned; an item that \
isn't is worthless.
- Match authentic STAAR style: real-world contexts, clear unambiguous wording, \
grade-appropriate reading level, and (for math) clean, purposeful numbers.
- Distractors must reflect genuine, common student misconceptions and procedural \
errors, never throwaway wrong answers.
- Match the requested STAAR item types exactly. STAAR is not all multiple choice; \
since the 2022 redesign it includes tech-enhanced items and constructed response.
- Calibrate difficulty to the requested performance level (Did Not Meet, \
Approaches, Meets, Masters).
- Never include offensive, biased, or culturally insensitive content. Contexts \
should reflect Texas students' lived experience where natural.`;

function typeGuidance(types: QuestionType[]): string {
  const lines: Record<QuestionType, string> = {
    multiple_choice: "multiple_choice: exactly 4 options (A-D), exactly one correct.",
    multiselect: "multiselect: 5-8 options, 2 or more correct; stem says how many to select.",
    inline_choice: "inline_choice: embed dropdown choices in the stem using [[A|B|C]] markers; put the full option set in options[] and mark correct ones.",
    equation_entry: "equation_entry: no options[]; provide the exact expected answer in `answer` (numeric or algebraic).",
    hot_spot: "hot_spot: describe the image/graph in the stem; options[] are the selectable regions; mark correct region(s).",
    drag_and_drop: "drag_and_drop: stem describes targets; options[] are draggable items; correct=true for items in correct placement, and explain the intended order/placement.",
    matching: "matching: stem describes two columns/categories; options[] list the pairings; explanation states the full correct matching.",
    two_part: "two_part: stem contains 'Part A:' and 'Part B:'; options[] prefixed with 'A)' and 'B)'; Part B should depend on Part A.",
    constructed_response: "constructed_response: no options[]; provide a model `answer` and a short scoring `rubric` (hybrid-scored).",
  };
  return types.map((t) => "- " + lines[t]).join("\n");
}

export function buildUserPrompt(p: GenerateParams): string {
  const langNote =
    p.language === "Spanish"
      ? "\n- Write ALL items in Spanish (this is a STAAR Spanish assessment, valid for grades 3-5)."
      : "";

  return `Generate exactly ${p.count} STAAR practice items.

Target assessment:
- Grade/Course: ${p.grade}
- Subject: ${p.subject}
- TEKS standard or topic: ${p.teks}
- Target performance level (rigor): ${p.targetLevel}
- Language: ${p.language}${langNote}

Include ONLY these STAAR item types, mixed across the set:
${typeGuidance(p.questionTypes)}

For each item, identify the most specific TEKS code it aligns to (e.g. "8.8(C)").
Include a one- to two-sentence explanation of the correct answer.

Respond with ONLY valid JSON (no markdown fences, no commentary) matching exactly:
{
  "questions": [
    {
      "type": "multiple_choice",
      "teks": "8.8(C)",
      "stem": "string",
      "options": [{ "letter": "A", "text": "string", "correct": false }],
      "answer": "optional string for entry/CR items",
      "rubric": "optional string for constructed_response",
      "explanation": "string",
      "performanceLevel": "Meets"
    }
  ]
}`;
}

/**
 * Prompt for regenerating a SINGLE item, used when a teacher flags one
 * question for replacement. We pass the item to avoid (so the new one differs)
 * and reuse the same constraints.
 */
export interface RegenerateParams {
  grade: Grade;
  subject: Subject;
  teks: string;
  questionType: QuestionType;
  targetLevel: PerformanceLevel;
  avoid?: string; // stem of the question being replaced
}

export const SingleQuestionSchema = QuestionSchema;

export function buildRegeneratePrompt(p: RegenerateParams): string {
  const avoidNote = p.avoid
    ? `\nProduce a DIFFERENT question from this one (different context and numbers):\n"${p.avoid}"`
    : "";
  return `Generate exactly ONE STAAR practice item.

- Grade/Course: ${p.grade}
- Subject: ${p.subject}
- TEKS standard or topic: ${p.teks}
- Item type: ${p.questionType}
- Target performance level: ${p.targetLevel}${avoidNote}

Respond with ONLY valid JSON (no markdown), a single object matching:
{"type":"${p.questionType}","teks":"...","stem":"...","options":[{"letter":"A","text":"...","correct":false}],"answer":"optional","rubric":"optional","explanation":"...","performanceLevel":"${p.targetLevel}"}`;
}

export const SYSTEM = SYSTEM_PROMPT;
