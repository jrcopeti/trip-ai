import { describe, expect, it } from "vitest";
import {
  asksBeforeReload,
  isLoading,
  toastsFor,
  transition,
  type GenerationAction,
  type GenerationEffect,
  type GenerationFailure,
  type GenerationState,
  type GenerationTrip,
} from "./generation";

// Every action from every state, and every state on every route: the whole behaviour, as tables.

const A = { name: "in flight" };
const B = { name: "another" };
const URL = "a1b2c3d4e5f6";
const NEW_URL = "f6e5d4c3b2a1";
const TRIP = `/trips/${URL}`;
// Another trip's page is "elsewhere": only the trip's own page clears it or hides its toast.
const OTHER_TRIP = `/trips/${NEW_URL}`;

const pendings = { idle: null, pending: A } as const;
const trips = {
  noTrip: null,
  ready: { kind: "ready", tripUrl: URL },
  opening: { kind: "opening", tripUrl: URL },
} satisfies Record<string, GenerationTrip | null>;
const failures = {
  noFailure: null,
  unseen: { seenOnForm: false },
  seen: { seenOnForm: true },
} satisfies Record<string, GenerationFailure | null>;
type P = keyof typeof pendings;
type T = keyof typeof trips;
type F = keyof typeof failures;

const state = (p: P, t: T, f: F): GenerationState => ({
  pending: pendings[p],
  trip: trips[t],
  failure: failures[f],
});

const cases = (Object.keys(pendings) as P[]).flatMap((p) =>
  (Object.keys(trips) as T[]).flatMap((t) =>
    (Object.keys(failures) as F[]).map((f) => [p, t, f] as const),
  ),
);

/** An expectation: the next state, or "same" for the very same object, and the effects. */
type Expected = { next: GenerationState | "same"; effects?: GenerationEffect[] };

function check(action: GenerationAction, expected: (p: P, t: T, f: F) => Expected) {
  it.each(cases)("from %s, %s, %s", (p, t, f) => {
    const before = state(p, t, f);
    const { state: after, effects } = transition(before, action);
    const want = expected(p, t, f);
    if (want.next === "same") expect(after).toBe(before);
    else expect(after).toEqual(want.next);
    expect(effects).toEqual(want.effects ?? []);
  });
}

const ready = (tripUrl: string) => ({ kind: "ready", tripUrl }) as const;
const opening = (tripUrl: string) => ({ kind: "opening", tripUrl }) as const;

describe("transition", () => {
  describe("start", () => {
    // Supersedes the one in flight (aborted) and a failure; the last trip keeps its toast.
    check({ type: "start", token: B }, (p, t) => ({
      next: { pending: B, trip: trips[t], failure: null },
      effects: p === "pending" ? [{ type: "abort", token: A }] : [],
    }));
  });

  describe("land on /form, for the generation in flight", () => {
    check({ type: "land", token: A, tripUrl: NEW_URL, pathname: "/form" }, (p, _t, f) =>
      p === "pending"
        ? {
            next: { pending: null, trip: opening(NEW_URL), failure: failures[f] },
            effects: [{ type: "clearDraft" }, { type: "open", tripUrl: NEW_URL }],
          }
        : { next: "same" },
    );
  });

  describe("land elsewhere, for the generation in flight", () => {
    check({ type: "land", token: A, tripUrl: NEW_URL, pathname: "/saved-trips" }, (p, _t, f) =>
      p === "pending"
        ? {
            next: { pending: null, trip: ready(NEW_URL), failure: failures[f] },
            effects: [{ type: "clearDraft" }],
          }
        : { next: "same" },
    );
  });

  describe("land, for any other generation (cancelled, or superseded)", () => {
    check({ type: "land", token: B, tripUrl: NEW_URL, pathname: "/form" }, () => ({ next: "same" }));
  });

  describe("fail on /form, for the generation in flight", () => {
    // The last trip stays: a failure never displaces it.
    check({ type: "fail", token: A, pathname: "/form" }, (p, t) =>
      p === "pending"
        ? {
            next: { pending: null, trip: trips[t], failure: { seenOnForm: true } },
            effects: [{ type: "failedOnForm" }],
          }
        : { next: "same" },
    );
  });

  describe("fail elsewhere, for the generation in flight", () => {
    check({ type: "fail", token: A, pathname: "/about" }, (p, t) =>
      p === "pending"
        ? { next: { pending: null, trip: trips[t], failure: { seenOnForm: false } } }
        : { next: "same" },
    );
  });

  describe("fail, for any other generation", () => {
    check({ type: "fail", token: B, pathname: "/form" }, () => ({ next: "same" }));
  });

  describe("cancel", () => {
    check({ type: "cancel" }, (p, t, f) =>
      p === "pending"
        ? {
            next: { pending: null, trip: trips[t], failure: failures[f] },
            effects: [{ type: "abort", token: A }, { type: "cancelled" }],
          }
        : { next: "same" },
    );
  });

  describe("route to /form", () => {
    check({ type: "route", pathname: "/form" }, (p, t, f) =>
      f === "unseen"
        ? { next: { pending: pendings[p], trip: trips[t], failure: { seenOnForm: true } } }
        : { next: "same" },
    );
  });

  describe("route to the trip's page", () => {
    // The trip is reached; a seen failure is left behind with /form.
    check({ type: "route", pathname: TRIP }, (p, t, f) =>
      t === "noTrip" && f !== "seen"
        ? { next: "same" }
        : { next: { pending: pendings[p], trip: null, failure: f === "seen" ? null : failures[f] } },
    );
  });

  describe.each(["/saved-trips", OTHER_TRIP])("route anywhere else: %s", (pathname) => {
    // Left before the redirect arrived: the trip is offered instead. A seen failure is left behind.
    check({ type: "route", pathname }, (p, t, f) =>
      t !== "opening" && f !== "seen"
        ? { next: "same" }
        : {
            next: {
              pending: pendings[p],
              trip: t === "opening" ? ready(URL) : trips[t],
              failure: f === "seen" ? null : failures[f],
            },
          },
    );
  });

  describe("clearFailure", () => {
    check({ type: "clearFailure" }, (p, t, f) =>
      f === "noFailure" ? { next: "same" } : { next: { pending: pendings[p], trip: trips[t], failure: null } },
    );
  });
});

describe("isLoading", () => {
  it.each(cases)("%s, %s, %s", (p, t, f) => {
    expect(isLoading(state(p, t, f))).toBe(p === "pending" || t === "opening");
  });
});

describe("asksBeforeReload", () => {
  // Only in flight: a prompt can't tell a reload from the redirect falling back to a full load.
  it.each(cases)("%s, %s, %s", (p, t, f) => {
    expect(asksBeforeReload(state(p, t, f))).toBe(p === "pending");
  });
});

describe("toastsFor", () => {
  const routes = ["/form", TRIP, OTHER_TRIP, "/saved-trips"] as const;
  type Route = (typeof routes)[number];

  /** The trip toast's url for each trip on each route. */
  const tripToast: Record<T, Record<Route, string | null>> = {
    noTrip: { "/form": null, [TRIP]: null, [OTHER_TRIP]: null, "/saved-trips": null },
    ready: { "/form": URL, [TRIP]: null, [OTHER_TRIP]: URL, "/saved-trips": URL },
    opening: { "/form": null, [TRIP]: null, [OTHER_TRIP]: null, "/saved-trips": null },
  };
  /** Whether each failure shows its toast on each route. */
  const failureToast: Record<F, Record<Route, boolean>> = {
    noFailure: { "/form": false, [TRIP]: false, [OTHER_TRIP]: false, "/saved-trips": false },
    unseen: { "/form": false, [TRIP]: true, [OTHER_TRIP]: true, "/saved-trips": true },
    seen: { "/form": false, [TRIP]: false, [OTHER_TRIP]: false, "/saved-trips": false },
  };

  const rows = cases.flatMap(([p, t, f]) => routes.map((route) => [p, t, f, route] as const));

  it.each(rows)("%s, %s, %s on %s", (p, t, f, route) => {
    expect(toastsFor(state(p, t, f), route)).toEqual({
      planning: p === "pending" && route !== "/form",
      trip: tripToast[t][route],
      failure: failureToast[f][route],
    });
  });
});
