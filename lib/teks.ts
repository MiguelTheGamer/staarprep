/**
 * lib/teks.ts
 * ---------------------------------------------------------------------------
 * Texas-specific domain model. STAAR questions are ALWAYS aligned to a TEKS
 * standard for the tested grade/subject, so alignment is a first-class concept
 * here, not an afterthought.
 *
 * STAAR is administered in Mathematics, Reading Language Arts (RLA), Science,
 * and Social Studies for grades 3-8, plus high-school End-of-Course (EOC)
 * exams. Spanish versions exist for grades 3-5.
 * ---------------------------------------------------------------------------
 */

export type Subject = "Mathematics" | "Reading Language Arts" | "Science" | "Social Studies";

export type Grade =
  | "Grade 3" | "Grade 4" | "Grade 5" | "Grade 6" | "Grade 7" | "Grade 8"
  | "Algebra I" | "Biology" | "English I" | "English II" | "U.S. History";

export type Language = "English" | "Spanish";

/**
 * STAAR performance levels reported to the state. We tag generated questions
 * to a target level so teachers can build sets aimed at moving students from,
 * e.g., "Approaches" to "Meets".
 */
export type PerformanceLevel =
  | "Did Not Meet"
  | "Approaches"
  | "Meets"
  | "Masters";

/**
 * STAAR question types. Since the 2022 redesign, STAAR is NOT just multiple
 * choice, it uses a range of tech-enhanced item (TEI) types plus
 * constructed-response items that are hybrid-scored (human + automated).
 * Generating only A/B/C/D items would produce practice that doesn't match the
 * real test. Each type below maps to a real STAAR item format.
 */
export type QuestionType =
  | "multiple_choice"      // 4 options, one correct
  | "multiselect"          // "select all that apply", 5-8 options, 2+ correct
  | "inline_choice"        // dropdown(s) embedded in a sentence/equation
  | "equation_entry"       // student types a numeric/algebraic answer (gridded)
  | "hot_spot"             // select region(s) on an image/graph/number line
  | "drag_and_drop"        // order or place items into targets
  | "matching"             // table: match/classify items across categories
  | "two_part"             // Part A + Part B, B depends on A
  | "constructed_response"; // short written response, hybrid-scored

export const QUESTION_TYPE_LABELS: Record<QuestionType, string> = {
  multiple_choice: "Multiple Choice",
  multiselect: "Multiselect (select all)",
  inline_choice: "Inline Choice (dropdown)",
  equation_entry: "Equation / Text Entry",
  hot_spot: "Hot Spot",
  drag_and_drop: "Drag and Drop",
  matching: "Matching / Classification",
  two_part: "Two-Part Question",
  constructed_response: "Constructed Response",
};

/** Which TEI types are realistic per subject (rough guidance for the UI). */
export const TYPES_BY_SUBJECT: Record<Subject, QuestionType[]> = {
  Mathematics: [
    "multiple_choice", "multiselect", "inline_choice", "equation_entry",
    "hot_spot", "drag_and_drop", "two_part",
  ],
  "Reading Language Arts": [
    "multiple_choice", "multiselect", "inline_choice", "two_part",
    "constructed_response", "drag_and_drop",
  ],
  Science: [
    "multiple_choice", "multiselect", "inline_choice", "hot_spot",
    "matching", "two_part",
  ],
  "Social Studies": [
    "multiple_choice", "multiselect", "inline_choice", "matching", "two_part",
  ],
};

export const GRADES_BY_SUBJECT: Record<Subject, Grade[]> = {
  Mathematics: ["Grade 3","Grade 4","Grade 5","Grade 6","Grade 7","Grade 8","Algebra I"],
  "Reading Language Arts": ["Grade 3","Grade 4","Grade 5","Grade 6","Grade 7","Grade 8","English I","English II"],
  Science: ["Grade 5","Grade 8","Biology"],
  "Social Studies": ["Grade 8","U.S. History"],
};

/**
 * A small, illustrative slice of the real TEKS reporting categories. In
 * production this table is seeded from the official TEA TEKS for each
 * grade/subject. The structure mirrors the official "reporting category →
 * student expectation" hierarchy.
 */
export interface TeksStandard {
  code: string;            // e.g. "8.8(C)"
  grade: Grade;
  subject: Subject;
  reportingCategory: string;
  description: string;
}

export const SAMPLE_TEKS: TeksStandard[] = [
  { code: "8.2(D)", grade: "Grade 8", subject: "Mathematics", reportingCategory: "Numerical Representations", description: "Order a set of real numbers arising from mathematical and real-world contexts." },
  { code: "8.4(B)", grade: "Grade 8", subject: "Mathematics", reportingCategory: "Proportionality", description: "Graph proportional relationships, interpreting the unit rate as the slope of the line." },
  { code: "8.5(G)", grade: "Grade 8", subject: "Mathematics", reportingCategory: "Proportionality", description: "Identify functions using sets of ordered pairs, tables, mappings, and graphs." },
  { code: "8.7(C)", grade: "Grade 8", subject: "Mathematics", reportingCategory: "Two-Dimensional Shapes", description: "Use the Pythagorean theorem and its converse to solve problems." },
  { code: "8.8(C)", grade: "Grade 8", subject: "Mathematics", reportingCategory: "Expressions, Equations, and Relationships", description: "Model and solve one-variable equations with variables on both sides." },
  { code: "8.10(C)", grade: "Grade 8", subject: "Mathematics", reportingCategory: "Two-Dimensional Shapes", description: "Explain the effect of translations, reflections, and dilations on coordinates." },
  { code: "8.12(D)", grade: "Grade 8", subject: "Mathematics", reportingCategory: "Personal Financial Literacy", description: "Calculate and compare simple and compound interest." },
];

export function teksForGradeSubject(grade: Grade, subject: Subject): TeksStandard[] {
  return SAMPLE_TEKS.filter((t) => t.grade === grade && t.subject === subject);
}
