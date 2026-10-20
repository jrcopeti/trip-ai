/**
 * The trip generation as one state, the one in flight and the last trip and failure: `transition`
 * changes it and returns the effects to run; `isLoading`, `asksBeforeReload` and `toastsFor` follow.
 * As tables, each row asserted: CLAUDE.md, "The generation's state, as tables".
 */

export type GenerationTrip =
  /** Landed off `/form`: offered by a toast until its page is reached. */
  | { kind: "ready"; tripUrl: string }
  /** Landed on `/form`: the traveller is being sent to it, and the loader stays till they arrive. */
  | { kind: "opening"; tripUrl: string };

/** `seenOnForm` once the failure panel on `/form` has shown it; its toast doesn't come back. */
export type GenerationFailure = { seenOnForm: boolean };

export type GenerationState = {
  /** The token of the generation in flight; null when none is. */
  pending: object | null;
  /** The last trip that landed, until its page is reached. A failure never displaces it. */
  trip: GenerationTrip | null;
  failure: GenerationFailure | null;
};

export type GenerationAction =
  | { type: "start"; token: object }
  | { type: "land"; token: object; tripUrl: string; pathname: string }
  | { type: "fail"; token: object; pathname: string }
  | { type: "cancel" }
  | { type: "route"; pathname: string }
  | { type: "clearFailure" };

export type GenerationEffect =
  | { type: "abort"; token: object }
  | { type: "clearDraft" }
  | { type: "open"; tripUrl: string }
  | { type: "failedOnForm" }
  | { type: "cancelled" };

export const idleGeneration: GenerationState = { pending: null, trip: null, failure: null };

export const FORM_PATH = "/form";
export const tripPath = (tripUrl: string) => `/trips/${tripUrl}`;

type Transition = { state: GenerationState; effects: GenerationEffect[] };
const same = (state: GenerationState): Transition => ({ state, effects: [] });

/** The trip and failure as `pathname` leaves them; the very same objects when unchanged. */
function routed(state: GenerationState, pathname: string): GenerationState {
  let { trip, failure } = state;
  if (trip && pathname === tripPath(trip.tripUrl)) trip = null;
  // Left before the redirect arrived (Back, a link): the trip is offered instead.
  else if (trip?.kind === "opening" && pathname !== FORM_PATH) {
    trip = { kind: "ready", tripUrl: trip.tripUrl };
  }
  if (failure && pathname === FORM_PATH && !failure.seenOnForm) failure = { seenOnForm: true };
  // Seen, then left without "Try again": the draft still holds the answers.
  else if (failure?.seenOnForm && pathname !== FORM_PATH) failure = null;
  if (trip === state.trip && failure === state.failure) return state;
  return { ...state, trip, failure };
}

/**
 * The next state for `action`, and the effects it calls for, in order. Returns the same state
 * object and no effects when nothing changes. A landing or failure whose token isn't the one
 * in flight is ignored; `pathname` is where the traveller is when it arrives.
 */
export function transition(state: GenerationState, action: GenerationAction): Transition {
  switch (action.type) {
    case "start":
      // A new attempt supersedes the one in flight and a failure; the last trip keeps its toast.
      return {
        state: { ...state, pending: action.token, failure: null },
        effects: state.pending ? [{ type: "abort", token: state.pending }] : [],
      };

    case "land": {
      if (action.token !== state.pending) return same(state);
      const { tripUrl } = action;
      if (action.pathname === FORM_PATH) {
        return {
          state: { ...state, pending: null, trip: { kind: "opening", tripUrl } },
          effects: [{ type: "clearDraft" }, { type: "open", tripUrl }],
        };
      }
      return {
        state: { ...state, pending: null, trip: { kind: "ready", tripUrl } },
        effects: [{ type: "clearDraft" }],
      };
    }

    case "fail": {
      if (action.token !== state.pending) return same(state);
      const onForm = action.pathname === FORM_PATH;
      return {
        state: { ...state, pending: null, failure: { seenOnForm: onForm } },
        effects: onForm ? [{ type: "failedOnForm" }] : [],
      };
    }

    case "cancel":
      if (state.pending === null) return same(state);
      return {
        state: { ...state, pending: null },
        effects: [{ type: "abort", token: state.pending }, { type: "cancelled" }],
      };

    case "route":
      return same(routed(state, action.pathname));

    case "clearFailure":
      if (!state.failure) return same(state);
      return { state: { ...state, failure: null }, effects: [] };
  }
}

/** Whether `/form` shows the loader: a generation in flight, or its trip on the way. */
export const isLoading = (state: GenerationState) =>
  state.pending !== null || state.trip?.kind === "opening";

/**
 * Whether a reload or a closed tab asks first: only while one is in flight. A prompt can't tell
 * a reload from the redirect to a landed trip falling back to a full page load.
 */
export const asksBeforeReload = (state: GenerationState) => state.pending !== null;

export type GenerationToasts = {
  planning: boolean;
  /** The ready trip's url, for its toast. */
  trip: string | null;
  failure: boolean;
};

/**
 * The generation's toasts on `pathname`: planning while one is pending off `/form`, where the
 * loader shows it; a ready trip except on its own page; a failure off `/form` until the
 * failure panel there has shown it.
 */
export function toastsFor(state: GenerationState, pathname: string): GenerationToasts {
  const { pending, trip, failure } = state;
  return {
    planning: pending !== null && pathname !== FORM_PATH,
    trip: trip?.kind === "ready" && pathname !== tripPath(trip.tripUrl) ? trip.tripUrl : null,
    failure: failure !== null && !failure.seenOnForm && pathname !== FORM_PATH,
  };
}
