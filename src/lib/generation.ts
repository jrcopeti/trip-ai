/**
 * The trip generation as one state, the one in flight and the last result: `transition` changes
 * it and returns the effects to run, `isLoading` and `toastsFor` say what it shows on a route.
 * As tables, each row asserted: CLAUDE.md, "The generation's state, as tables".
 */

export type GenerationResult =
  /** Landed off `/form`: offered by a toast until its page is reached. */
  | { kind: "ready"; tripUrl: string }
  /** Landed on `/form`: the traveller is being sent to it, and the loader stays till they arrive. */
  | { kind: "opening"; tripUrl: string }
  /** `seenOnForm` once the failure panel on `/form` has shown it; its toast doesn't come back. */
  | { kind: "failed"; seenOnForm: boolean };

export type GenerationState = {
  /** The token of the generation in flight; null when none is. */
  pending: object | null;
  result: GenerationResult | null;
};

export type GenerationAction =
  | { type: "start"; token: object }
  | { type: "land"; token: object; tripUrl: string; pathname: string }
  | { type: "fail"; token: object; pathname: string }
  | { type: "cancel" }
  | { type: "route"; pathname: string }
  | { type: "clearResult" };

export type GenerationEffect =
  | { type: "clearDraft" }
  | { type: "open"; tripUrl: string }
  | { type: "failedOnForm" }
  | { type: "cancelled" };

export const idleGeneration: GenerationState = { pending: null, result: null };

export const FORM_PATH = "/form";
export const tripPath = (tripUrl: string) => `/trips/${tripUrl}`;

type Transition = { state: GenerationState; effects: GenerationEffect[] };
const same = (state: GenerationState): Transition => ({ state, effects: [] });

/**
 * The next state for `action`, and the effects it calls for, in order. Returns the same state
 * object and no effects when nothing changes. A landing or failure whose token isn't the one
 * in flight is ignored; `pathname` is where the traveller is when it arrives.
 */
export function transition(state: GenerationState, action: GenerationAction): Transition {
  switch (action.type) {
    case "start":
      // A new attempt supersedes a failure; a ready trip keeps its toast until the next lands.
      return {
        state: {
          pending: action.token,
          result: state.result?.kind === "failed" ? null : state.result,
        },
        effects: [],
      };

    case "land": {
      if (action.token !== state.pending) return same(state);
      const { tripUrl } = action;
      if (action.pathname === FORM_PATH) {
        return {
          state: { pending: null, result: { kind: "opening", tripUrl } },
          effects: [{ type: "clearDraft" }, { type: "open", tripUrl }],
        };
      }
      return {
        state: { pending: null, result: { kind: "ready", tripUrl } },
        effects: [{ type: "clearDraft" }],
      };
    }

    case "fail": {
      if (action.token !== state.pending) return same(state);
      const onForm = action.pathname === FORM_PATH;
      return {
        state: { pending: null, result: { kind: "failed", seenOnForm: onForm } },
        effects: onForm ? [{ type: "failedOnForm" }] : [],
      };
    }

    case "cancel":
      if (state.pending === null) return same(state);
      return { state: { ...state, pending: null }, effects: [{ type: "cancelled" }] };

    case "route": {
      const { result } = state;
      const { pathname } = action;
      if (!result) return same(state);
      if (result.kind === "failed") {
        if (result.seenOnForm || pathname !== FORM_PATH) return same(state);
        return { state: { ...state, result: { ...result, seenOnForm: true } }, effects: [] };
      }
      if (pathname === tripPath(result.tripUrl)) return { state: { ...state, result: null }, effects: [] };
      // Left before the redirect arrived (Back, a link): the trip is offered instead.
      if (result.kind === "opening" && pathname !== FORM_PATH) {
        return { state: { ...state, result: { kind: "ready", tripUrl: result.tripUrl } }, effects: [] };
      }
      return same(state);
    }

    case "clearResult":
      if (!state.result) return same(state);
      return { state: { ...state, result: null }, effects: [] };
  }
}

/** Whether `/form` shows the loader: a generation in flight, or its trip on the way. */
export const isLoading = (state: GenerationState) =>
  state.pending !== null || state.result?.kind === "opening";

export type GenerationToasts = {
  planning: boolean;
  result: { kind: "ready"; tripUrl: string } | { kind: "failed" } | null;
};

/**
 * The generation's toasts on `pathname`: planning while one is pending off `/form`, where the
 * loader shows it; a ready trip except on its own page; a failure off `/form` until the
 * failure panel there has shown it.
 */
export function toastsFor(state: GenerationState, pathname: string): GenerationToasts {
  const planning = state.pending !== null && pathname !== FORM_PATH;
  const { result } = state;
  if (result?.kind === "ready" && pathname !== tripPath(result.tripUrl)) {
    return { planning, result: { kind: "ready", tripUrl: result.tripUrl } };
  }
  if (result?.kind === "failed" && !result.seenOnForm && pathname !== FORM_PATH) {
    return { planning, result: { kind: "failed" } };
  }
  return { planning, result: null };
}
