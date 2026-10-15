import { steps } from "@/data";
import { FormDataSchema } from "@/lib/schema";
import type { FieldName, Inputs } from "@/types";

/** What `/form` keeps across leaving it: the answers, the step and the weather choice. */
export type FormDraft = {
  values: Inputs;
  step: number;
  isWeatherSelected: boolean;
};

// Bump the version when `Inputs` changes shape, so a tab holding an older build's draft
// drops it instead of restoring values the form can't render.
const FORM_DRAFT_KEY = "trip-ai:form-draft:v1";

// sessionStorage, so the draft goes with the tab. Every access can throw (storage
// blocked, private mode, quota), and a lost draft only means a fresh form.
export function readFormDraft(): FormDraft | null {
  try {
    const raw = window.sessionStorage.getItem(FORM_DRAFT_KEY);
    if (!raw) return null;
    const draft = JSON.parse(raw) as Partial<FormDraft>;
    if (
      typeof draft !== "object" ||
      draft === null ||
      typeof draft.values !== "object" ||
      draft.values === null ||
      typeof draft.step !== "number" ||
      typeof draft.isWeatherSelected !== "boolean"
    ) {
      return null;
    }
    return draft as FormDraft;
  } catch {
    return null;
  }
}

export function writeFormDraft(draft: FormDraft) {
  try {
    window.sessionStorage.setItem(FORM_DRAFT_KEY, JSON.stringify(draft));
  } catch {
    // Nothing to do: the form still works, it just won't survive leaving.
  }
}

export function clearFormDraft() {
  try {
    window.sessionStorage.removeItem(FORM_DRAFT_KEY);
  } catch {
    // As above.
  }
}

/**
 * Where a restored draft reopens: the saved step, or the first step before it whose answers
 * no longer hold (a start date that has passed since), with those fields to flag. Steps
 * after the saved one aren't filled in yet, so they don't count.
 */
export function resumeStep(
  values: Inputs,
  savedStep: number,
): { step: number; invalid: FieldName[] } {
  const step = Math.min(Math.max(Math.trunc(savedStep), 0), steps.length - 1);
  const result = FormDataSchema.safeParse(values);
  if (result.success) return { step, invalid: [] };

  const failing = new Set(result.error.issues.map((issue) => String(issue.path[0])));
  const first = steps.findIndex(
    (s, index) => index < step && s.fields.some((field) => failing.has(field)),
  );
  if (first === -1) return { step, invalid: [] };
  return {
    step: first,
    invalid: (steps[first].fields as FieldName[]).filter((field) => failing.has(field)),
  };
}

export { FORM_DRAFT_KEY };
