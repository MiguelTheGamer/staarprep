/**
 * lib/anthropic.ts
 * ---------------------------------------------------------------------------
 * Server-side question generation. The Anthropic key lives in an environment
 * variable and is NEVER sent to the browser, this is the key difference from
 * the prototype artifact, where the call happened client-side.
 *
 * This module is imported only from API routes (server runtime).
 * ---------------------------------------------------------------------------
 */

import Anthropic from "@anthropic-ai/sdk";
import {
  SYSTEM,
  buildUserPrompt,
  buildRegeneratePrompt,
  GenerationResponseSchema,
  SingleQuestionSchema,
  type GenerateParams,
  type RegenerateParams,
  type GeneratedQuestion,
} from "./prompts";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const MODEL = process.env.ANTHROPIC_MODEL ?? "claude-sonnet-4-20250514";

/** Strip accidental markdown fences and isolate the JSON object. */
function extractJson(raw: string): string {
  let t = raw.trim().replace(/```json/gi, "").replace(/```/g, "").trim();
  const start = t.indexOf("{");
  const end = t.lastIndexOf("}");
  if (start !== -1 && end !== -1) t = t.slice(start, end + 1);
  return t;
}

export async function generateQuestions(
  params: GenerateParams
): Promise<GeneratedQuestion[]> {
  // ~110 tokens of overhead per question is a safe budget.
  const maxTokens = Math.min(8000, 400 + params.count * 320);

  const message = await anthropic.messages.create({
    model: MODEL,
    max_tokens: maxTokens,
    system: SYSTEM,
    messages: [{ role: "user", content: buildUserPrompt(params) }],
  });

  const text = message.content
    .filter((b): b is Anthropic.TextBlock => b.type === "text")
    .map((b) => b.text)
    .join("\n");

  const parsed = GenerationResponseSchema.safeParse(
    JSON.parse(extractJson(text))
  );

  if (!parsed.success) {
    throw new Error("Model returned malformed question data.");
  }
  return parsed.data.questions;
}

/** Regenerate a single flagged question. */
export async function regenerateOne(
  params: RegenerateParams
): Promise<GeneratedQuestion> {
  const message = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 800,
    system: SYSTEM,
    messages: [{ role: "user", content: buildRegeneratePrompt(params) }],
  });

  const text = message.content
    .filter((b): b is Anthropic.TextBlock => b.type === "text")
    .map((b) => b.text)
    .join("\n");

  const parsed = SingleQuestionSchema.safeParse(JSON.parse(extractJson(text)));
  if (!parsed.success) {
    throw new Error("Model returned malformed question data.");
  }
  return parsed.data;
}
