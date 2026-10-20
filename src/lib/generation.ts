/**
 * The trip generation as one state: the generation in flight, by its token, and the last
 * one's result. `transition` is the only way it changes, and returns at most one effect for
 * `GenerationProvider` to run; `toastsFor` says which toasts the state shows on a route.
 */

export type GenerationResult =
  // `fresh` until the root has seen the route the result landed on (`route` settles it).
  | { kind: "ready"; tripUrl: string; fresh: boolean }
  | { kind: "failed"; fresh: boolean };

export type GenerationState = {
  /** The token of the generation in flight; null when none is. */
  pending: object | null;
  result: GenerationResult | null;
};

export type GenerationAction =
  | { type: "start"; token: object }
  | { type: "land"; token: object; tripUrl: string }
  | { type: "fail"; token: object }
  | { type: "cancel" }
  | { type: "route"; pathname: string }
  | { type: "clearResult" };

export type GenerationEffect =
  | { type: "clearDraft" }
  | { type: "open"; tripUrl: string }
  | { type: "failedOnForm" }
  | { type: "cancelled" };

export const idleGeneration: GenerationState = { pending: null, result: null };

const FORM = "/form";
export const tripPath = (tripUrl: string) => `/trips/${tripUrl}`;

/**
 * The next state for `action`, and the effect it calls for. Returns the same state object
 * when nothing changes. A landing or failure whose token isn't the one in flight is ignored.
 */
export function transition(
  state: GenerationState,
  action: GenerationAction,
): { state: GenerationState; effect?: GenerationEffect } {
  switch (action.type) {
    case "start":
      // A new attempt supersedes a failure; a ready trip keeps its toast until the next lands.
      return {
        state: {
          pending: action.token,
          result: state.result?.kind === "failed" ? null : state.result,
        },
      };

    case "land":
      if (action.token !== state.pending) return { state };
      return {
        state: { pending: null, result: { kind: "ready", tripUrl: action.tripUrl, fresh: true } },
        effect: { type: "clearDraft" },
      };

    case "fail":
      if (action.token !== state.pending) return { state };
      return { state: { pending: null, result: { kind: "failed", fresh: true } } };

    case "cancel":
      if (state.pending === null) return { state };
      return { state: { ...state, pending: null }, effect: { type: "cancelled" } };

    case "route": {
      const { result } = state;
      if (!result) return { state };
      if (result.kind === "ready") {
        if (result.fresh) {
          // Landed while the traveller waited on the loader: they're sent to the trip.
          if (action.pathname === FORM) {
            return { state: { ...state, result: null }, effect: { type: "open", tripUrl: result.tripUrl } };
          }
          return { state: { ...state, result: { ...result, fresh: false } } };
        }
        if (action.pathname === tripPath(result.tripUrl)) return { state: { ...state, result: null } };
        return { state };
      }
      if (!result.fresh) return { state };
      return {
        state: { ...state, result: { ...result, fresh: false } },
        effect: action.pathname === FORM ? { type: "failedOnForm" } : undefined,
      };
    }

    case "clearResult":
      if (!state.result) return { state };
      return { state: { ...state, result: null } };
  }
}

export type GenerationToasts = {
  planning: boolean;
  result: { kind: "ready"; tripUrl: string } | { kind: "failed" } | null;
};

/**
 * The generation's toasts on `pathname`: planning while one is pending off `/form`, where the
 * loader shows it; a ready trip except on its own page; a failure off `/form`, where the
 * failure panel shows it. A fresh result shows nothing until `route` settles it.
 */
export function toastsFor(state: GenerationState, pathname: string): GenerationToasts {
  const planning = state.pending !== null && pathname !== FORM;
  const { result } = state;
  if (!result || result.fresh) return { planning, result: null };
  if (result.kind === "ready") {
    return {
      planning,
      result: pathname === tripPath(result.tripUrl) ? null : { kind: "ready", tripUrl: result.tripUrl },
    };
  }
  return { planning, result: pathname === FORM ? null : { kind: "failed" } };
}
