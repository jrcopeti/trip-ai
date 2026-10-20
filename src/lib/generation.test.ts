import { describe, expect, it } from "vitest";
import {
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
const OTHER_URL = "f6e5d4c3b2a1";

const results = {
  none: null,
  readyFresh: { kind: "ready", tripUrl: URL, fresh: true },
  readySettled: { kind: "ready", tripUrl: URL, fresh: false },
  failedFresh: { kind: "failed", fresh: true },
  failedSettled: { kind: "failed", fresh: false },
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

/** An expectation: the next state, or "same" for the very same object, and the effect. */
type Expected = { next: GenerationState | "same"; effect?: GenerationEffect };

function check(action: GenerationAction, expected: (p: PendingName, r: ResultName) => Expected) {
  it.each(cases)("from %s with %s", (p, r) => {
    const before = state(p, r);
    const { state: after, effect } = transition(before, action);
    const want = expected(p, r);
    if (want.next === "same") expect(after).toBe(before);
    else expect(after).toEqual(want.next);
    expect(effect).toEqual(want.effect);
  });
}

describe("transition", () => {
  describe("start", () => {
    check({ type: "start", token: B }, (_p, r) => ({
      // A new attempt supersedes a failure; a ready trip's toast stays until the next lands.
      next: { pending: B, result: r.startsWith("failed") ? null : results[r] },
    }));
  });

  describe("land, for the generation in flight", () => {
    check({ type: "land", token: A, tripUrl: OTHER_URL }, (p) =>
      p === "pending"
        ? {
            next: { pending: null, result: { kind: "ready", tripUrl: OTHER_URL, fresh: true } },
            effect: { type: "clearDraft" },
          }
        : { next: "same" },
    );
  });

  describe("land, for any other generation (cancelled, or replaced)", () => {
    check({ type: "land", token: B, tripUrl: OTHER_URL }, () => ({ next: "same" }));
  });

  describe("fail, for the generation in flight", () => {
    check({ type: "fail", token: A }, (p) =>
      p === "pending"
        ? { next: { pending: null, result: { kind: "failed", fresh: true } } }
        : { next: "same" },
    );
  });

  describe("fail, for any other generation", () => {
    check({ type: "fail", token: B }, () => ({ next: "same" }));
  });

  describe("cancel", () => {
    check({ type: "cancel" }, (p, r) =>
      p === "pending"
        ? { next: { pending: null, result: results[r] }, effect: { type: "cancelled" } }
        : { next: "same" },
    );
  });

  describe("route to /form", () => {
    check({ type: "route", pathname: "/form" }, (p, r) => {
      const pending = pendings[p];
      switch (r) {
        case "readyFresh":
          return { next: { pending, result: null }, effect: { type: "open", tripUrl: URL } };
        case "failedFresh":
          return { next: { pending, result: results.failedSettled }, effect: { type: "failedOnForm" } };
        default:
          return { next: "same" };
      }
    });
  });

  describe("route to the ready trip's page", () => {
    check({ type: "route", pathname: `/trips/${URL}` }, (p, r) => {
      const pending = pendings[p];
      switch (r) {
        case "readyFresh":
          return { next: { pending, result: results.readySettled } };
        case "readySettled":
          return { next: { pending, result: null } };
        case "failedFresh":
          return { next: { pending, result: results.failedSettled } };
        default:
          return { next: "same" };
      }
    });
  });

  describe("route anywhere else", () => {
    check({ type: "route", pathname: "/saved-trips" }, (p, r) => {
      const pending = pendings[p];
      switch (r) {
        case "readyFresh":
          return { next: { pending, result: results.readySettled } };
        case "failedFresh":
          return { next: { pending, result: results.failedSettled } };
        default:
          return { next: "same" };
      }
    });
  });

  describe("clearResult", () => {
    check({ type: "clearResult" }, (p, r) =>
      r === "none" ? { next: "same" } : { next: { pending: pendings[p], result: null } },
    );
  });
});

describe("toastsFor", () => {
  const routes = ["/form", `/trips/${URL}`, "/saved-trips"] as const;
  const ready = { kind: "ready", tripUrl: URL } as const;
  const failed = { kind: "failed" } as const;

  /** What each result shows on each route; a fresh one shows nothing until it settles. */
  const resultToast: Record<ResultName, Record<(typeof routes)[number], unknown>> = {
    none: { "/form": null, [`/trips/${URL}`]: null, "/saved-trips": null },
    readyFresh: { "/form": null, [`/trips/${URL}`]: null, "/saved-trips": null },
    readySettled: { "/form": ready, [`/trips/${URL}`]: null, "/saved-trips": ready },
    failedFresh: { "/form": null, [`/trips/${URL}`]: null, "/saved-trips": null },
    failedSettled: { "/form": null, [`/trips/${URL}`]: failed, "/saved-trips": failed },
  };

  const rows = cases.flatMap(([p, r]) => routes.map((route) => [p, r, route] as const));

  it.each(rows)("%s with %s on %s", (p, r, route) => {
    expect(toastsFor(state(p, r), route)).toEqual({
      planning: p === "pending" && route !== "/form",
      result: resultToast[r][route],
    });
  });
});
