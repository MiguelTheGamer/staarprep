/**
 * lib/export.ts
 * ---------------------------------------------------------------------------
 * Builds a clean, print-ready HTML worksheet from a question set. The browser
 * (or a headless renderer) turns this into a PDF. Kept framework-agnostic so it
 * can run server-side in the export route or client-side in a print window.
 * ---------------------------------------------------------------------------
 */

import type { GeneratedQuestion } from "./prompts";

const escapeHtml = (s: string) =>
  s.replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!)
  );

export interface WorksheetMeta {
  title: string;
  grade: string;
  subject: string;
  teks?: string | null;
}

export function buildWorksheetHtml(
  meta: WorksheetMeta,
  questions: GeneratedQuestion[],
  opts: { includeAnswerKey?: boolean } = { includeAnswerKey: true }
): string {
  const items = questions
    .map((q, i) => {
      const num = i + 1;
      let body = `<p class="stem"><b>${num}.</b> ${escapeHtml(q.stem)}</p>`;
      if (q.options && q.options.length) {
        body += `<ol class="opts" type="A">${q.options
          .map((o) => `<li>${escapeHtml(o.text)}</li>`)
          .join("")}</ol>`;
      } else if (q.type === "equation_entry") {
        body += `<div class="entry-box">Answer: ____________________</div>`;
      } else if (q.type === "constructed_response") {
        body += `<div class="cr-lines">${"<div class='line'></div>".repeat(5)}</div>`;
      }
      return `<div class="q">${body}<div class="teks">TEKS ${escapeHtml(q.teks)}</div></div>`;
    })
    .join("");

  const key = opts.includeAnswerKey
    ? `<div class="pagebreak"></div>
       <h2>Answer Key</h2>
       <ol class="key" type="1">
         ${questions
           .map((q) => {
             if (q.type === "constructed_response")
               return `<li>See rubric: ${escapeHtml(q.rubric ?? "Teacher-scored")}</li>`;
             if (q.type === "equation_entry")
               return `<li>${escapeHtml(q.answer ?? "-")}</li>`;
             const correct = (q.options ?? [])
               .filter((o) => o.correct)
               .map((o) => o.letter)
               .join(", ");
             return `<li>${escapeHtml(correct || "-")}, ${escapeHtml(q.explanation)}</li>`;
           })
           .join("")}
       </ol>`
    : "";

  return `<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8">
<title>${escapeHtml(meta.title)}</title>
<style>
  @page { margin: 1in; }
  body { font-family: Georgia, "Times New Roman", serif; color: #0D1B2A; max-width: 720px; margin: 32px auto; padding: 0 24px; line-height: 1.6; }
  .head { border-bottom: 2px solid #0D1B2A; padding-bottom: 12px; margin-bottom: 24px; }
  h1 { font-size: 22px; margin: 0 0 4px; }
  .meta { font-size: 13px; color: #6b6259; }
  .name-row { display: flex; justify-content: space-between; font-size: 13px; margin-top: 12px; color: #6b6259; }
  .q { margin: 20px 0; page-break-inside: avoid; }
  .stem { margin: 0 0 8px; }
  .opts { margin: 4px 0 4px 8px; }
  .opts li { margin: 3px 0; }
  .teks { font-size: 11px; color: #8C8279; margin-top: 4px; }
  .entry-box { margin: 8px 0; font-size: 14px; }
  .cr-lines .line { border-bottom: 1px solid #ccc; height: 22px; }
  .pagebreak { page-break-before: always; }
  h2 { font-size: 18px; border-bottom: 1px solid #ccc; padding-bottom: 6px; }
  .key li { margin: 6px 0; font-size: 13px; }
  @media print { body { margin: 0; } .no-print { display: none; } }
</style></head>
<body>
  <div class="head">
    <h1>${escapeHtml(meta.title)}</h1>
    <div class="meta">${escapeHtml(meta.grade)} · ${escapeHtml(meta.subject)}${
    meta.teks ? " · TEKS " + escapeHtml(meta.teks) : ""
  } · STAAR Practice</div>
    <div class="name-row"><span>Name: ______________________________</span><span>Date: ____________</span></div>
  </div>
  ${items}
  ${key}
</body></html>`;
}
