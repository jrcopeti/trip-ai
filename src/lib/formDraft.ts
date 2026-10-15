import type { Inputs } from "@/types";

/** What `/form` keeps across leaving it: the answers, the step and the weather choice. */
export type FormDraft = {
  values: Inputs;
  step: number;
  isWeatherSelected: boolean;
};

const FORM_DRAFT_KEY = "trip-ai:form-draft";

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

export { FORM_DRAFT_KEY };
