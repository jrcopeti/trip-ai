import { describe, expect, it } from "vitest";
import {
  isLoading,
  toastsFor,
  transition,
  type GenerationAction,
  type GenerationEffect,
  type GenerationResult,
  type GenerationState,
} from "./generation";

// Every action from every state, and every state on every route: the whole behaviour, as tables.

const A = { name: "in flight" };
const B = { name: "another" };
const URL = "a1b2c3d4e5f6";
const NEW_URL = "f6e5d4c3b2a1";
const TRIP = `/trips/${URL}`;
// Another trip's page is "elsewhere": only the result's own page clears it or hides its toast.
const OTHER_TRIP = `/trips/${NEW_URL}`;

const results = {
  none: null,
  ready: { kind: "ready", tripUrl: URL },
  opening: { kind: "opening", tripUrl: URL },
  failedUnseen: { kind: "failed", seenOnForm: false },
  failedSeen: { kind: "failed", seenOnForm: true },
} satisfies Record<string, GenerationResult | null>;
type ResultName = keyof typeof results;
const resultNames = Object.keys(results) as ResultName[];

const pendings = { idle: null, pending: A } as const;
type PendingName = keyof typeof pendings;

const state = (p: PendingName, r: ResultName): GenerationState => ({
  pending: pendings[p],
  result: results[r],
});

const cases = (["idle", "pending"] as PendingName[]).flatMap((p) =>
  resultNames.map((r) => [p, r] as const),
);

/** An expectation: the next state, or "same" for the very same object, and the effects. */
type Expected = { next: GenerationState | "same"; effects?: GenerationEffect[] };

function check(action: GenerationAction, expected: (p: PendingName, r: ResultName) => Expected) {
  it.each(cases)("from %s with %s", (p, r) => {
    const before = state(p, r);
    const { state: after, effects } = transition(before, action);
    const want = expected(p, r);
    if (want.next === "same") expect(after).toBe(before);
    else expect(after).toEqual(want.next);
    expect(effects).toEqual(want.effects ?? []);
  });
}

describe("transition", () => {
  describe("start", () => {
    check({ type: "start", token: B }, (_p, r) => ({
      // A new attempt supersedes a failure; a ready trip's toast stays until the next lands.
      next: { pending: B, result: r.startsWith("failed") ? null : results[r] },
    }));
  });

  describe("land on /form, for the generation in flight", () => {
    check({ type: "land", token: A, tripUrl: NEW_URL, pathname: "/form" }, (p) =>
      p === "pending"
        ? {
            next: { pending: null, result: { kind: "opening", tripUrl: NEW_URL } },
            effects: [{ type: "clearDraft" }, { type: "open", tripUrl: NEW_URL }],
          }
        : { next: "same" },
    );
  });

  describe("land elsewhere, for the generation in flight", () => {
    check({ type: "land", token: A, tripUrl: NEW_URL, pathname: "/saved-trips" }, (p) =>
      p === "pending"
        ? {
            next: { pending: null, result: { kind: "ready", tripUrl: NEW_URL } },
            effects: [{ type: "clearDraft" }],
          }
        : { next: "same" },
    );
  });

  describe("land, for any other generation (cancelled, or superseded)", () => {
    check({ type: "land", token: B, tripUrl: NEW_URL, pathname: "/form" }, () => ({ next: "same" }));
  });

  describe("fail on /form, for the generation in flight", () => {
    check({ type: "fail", token: A, pathname: "/form" }, (p) =>
      p === "pending"
        ? {
            next: { pending: null, result: results.failedSeen },
            effects: [{ type: "failedOnForm" }],
          }
        : { next: "same" },
    );
  });

  describe("fail elsewhere, for the generation in flight", () => {
    check({ type: "fail", token: A, pathname: "/about" }, (p) =>
      p === "pending" ? { next: { pending: null, result: results.failedUnseen } } : { next: "same" },
    );
  });

  describe("fail, for any other generation", () => {
    check({ type: "fail", token: B, pathname: "/form" }, () => ({ next: "same" }));
  });

  describe("cancel", () => {
    check({ type: "cancel" }, (p, r) =>
      p === "pending"
        ? { next: { pending: null, result: results[r] }, effects: [{ type: "cancelled" }] }
        : { next: "same" },
    );
  });

  describe("route to /form", () => {
    check({ type: "route", pathname: "/form" }, (p, r) =>
      r === "failedUnseen"
        ? { next: { pending: pendings[p], result: results.failedSeen } }
        : { next: "same" },
    );
  });

  describe("route to the result's trip page", () => {
    check({ type: "route", pathname: TRIP }, (p, r) =>
      r === "ready" || r === "opening"
        ? { next: { pending: pendings[p], result: null } }
        : { next: "same" },
    );
  });

  describe.each(["/saved-trips", OTHER_TRIP])("route anywhere else: %s", (pathname) => {
    check({ type: "route", pathname }, (p, r) =>
      // Left before the redirect arrived: the trip is offered instead.
      r === "opening"
        ? { next: { pending: pendings[p], result: results.ready } }
        : { next: "same" },
    );
  });

  describe("clearResult", () => {
    check({ type: "clearResult" }, (p, r) =>
      r === "none" ? { next: "same" } : { next: { pending: pendings[p], result: null } },
    );
  });
});

describe("isLoading", () => {
  it.each(cases)("%s with %s", (p, r) => {
    expect(isLoading(state(p, r))).toBe(p === "pending" || r === "opening");
  });
});

describe("toastsFor", () => {
  const routes = ["/form", TRIP, OTHER_TRIP, "/saved-trips"] as const;
  type Route = (typeof routes)[number];
  const ready = { kind: "ready", tripUrl: URL } as const;
  const failed = { kind: "failed" } as const;

  /** The result toast each result shows on each route. */
  const resultToast: Record<ResultName, Record<Route, unknown>> = {
    none: { "/form": null, [TRIP]: null, [OTHER_TRIP]: null, "/saved-trips": null },
    ready: { "/form": ready, [TRIP]: null, [OTHER_TRIP]: ready, "/saved-trips": ready },
    opening: { "/form": null, [TRIP]: null, [OTHER_TRIP]: null, "/saved-trips": null },
    failedUnseen: { "/form": null, [TRIP]: failed, [OTHER_TRIP]: failed, "/saved-trips": failed },
    failedSeen: { "/form": null, [TRIP]: null, [OTHER_TRIP]: null, "/saved-trips": null },
  };

  const rows = cases.flatMap(([p, r]) => routes.map((route) => [p, r, route] as const));

  it.each(rows)("%s with %s on %s", (p, r, route) => {
    expect(toastsFor(state(p, r), route)).toEqual({
      planning: p === "pending" && route !== "/form",
      result: resultToast[r][route],
    });
  });
});
