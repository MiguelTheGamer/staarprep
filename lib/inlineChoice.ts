/**
 * lib/inlineChoice.ts
 * ---------------------------------------------------------------------------
 * Shared parser for inline_choice stems. STAAR embeds dropdown choices
 * directly in the sentence using "[[choice one|choice two|choice three]]"
 * markers (see lib/prompts.ts). Every surface that renders an inline_choice
 * stem (student quiz, teacher editor, read-only set detail view) parses the
 * same marker syntax through this module so all three stay in sync and only
 * differ in how they turn a parsed part into UI.
 * ---------------------------------------------------------------------------
 */

export type InlineStemPart =
  | { kind: "text"; value: string }
  | { kind: "blank"; choices: string[] };

const MARKER = /\[\[(.*?)\]\]/g;

export function parseInlineStem(stem: string): InlineStemPart[] {
  const parts: InlineStemPart[] = [];
  const regex = new RegExp(MARKER);
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(stem)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ kind: "text", value: stem.slice(lastIndex, match.index) });
    }
    const choices = match[1].split("|").map((c) => c.trim()).filter(Boolean);
    parts.push({ kind: "blank", choices });
    lastIndex = regex.lastIndex;
  }
  if (lastIndex < stem.length) {
    parts.push({ kind: "text", value: stem.slice(lastIndex) });
  }
  return parts;
}

export function countInlineBlanks(stem: string): number {
  return parseInlineStem(stem).filter((p) => p.kind === "blank").length;
}
