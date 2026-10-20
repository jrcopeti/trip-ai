"use client";
import { createContext, useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { createStore, useStore, type StoreApi } from "zustand";
import GenerationToast from "@/components/ui/GenerationToast";
import { CancelledToast, NOTICE_TOAST, ReadyToast } from "@/components/ui/GenerationToasts";
import ErrorToaster from "@/components/ui/ErrorToaster";
import { showToast } from "@/components/ui/ToastCard";
import { failure } from "@/components/form/content";
import { useConfirmOnPageExit } from "@/hooks/useConfirmonPageExit";
import {
  asksBeforeReload,
  idleGeneration,
  transition,
  tripPath,
  type GenerationAction,
  type GenerationEffect,
  type GenerationState,
} from "@/lib/generation";
import { clearFormDraft } from "@/lib/formDraft";
import { requestTrip } from "@/lib/requestTrip";
import type { TripRequest } from "@/lib/agent/request";

export type GenerationActions = {
  /** Sends the request; a generation already in flight is superseded and lands to nothing. */
  generateTrip: (request: TripRequest) => void;
  /** Aborts the one in flight, if any; its trip lands to nothing. */
  cancel: () => void;
  /** Drops the last failure: its toast, or the form's failure panel ("Try again"). */
  clearFailure: () => void;
};

/** Stable for the provider's life: readers subscribe to the store through selectors. */
export const GenerationContext = createContext<{
  store: StoreApi<GenerationState>;
  actions: GenerationActions;
} | null>(null);

const NOTICE = { id: NOTICE_TOAST, duration: 5000 };

/**
 * Owns the trip generation for the app, from the root providers, so it outlives `/form`: it makes
 * the call, keeps the state in a zustand store, runs each transition's effects and asks before a
 * reload while one is in flight. The server still finishes an aborted call and writes its row.
 */
export function GenerationProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  // Read when a call settles, from a promise callback: the router's path as of the last commit.
  const latest = useRef({ router, pathname });
  useEffect(() => {
    latest.current = { router, pathname };
  });

  const [{ context, dispatch }] = useState(() => {
    // One store per provider, not per module: a module-level store would be shared by every
    // request on the server, and carried from one test to the next.
    const store = createStore<GenerationState>()(() => idleGeneration);
    const controllers = new Map<object, AbortController>();

    const run = (effect: GenerationEffect) => {
      switch (effect.type) {
        case "abort":
          return controllers.get(effect.token)?.abort();
        case "clearDraft":
          return clearFormDraft();
        case "open":
          showToast(<ReadyToast />, NOTICE);
          return latest.current.router.replace(tripPath(effect.tripUrl));
        case "failedOnForm":
          return showToast(<ErrorToaster message={failure.message} />, NOTICE);
        case "cancelled":
          return showToast(<CancelledToast />, NOTICE);
      }
    };

    const dispatch = (action: GenerationAction) => {
      const { state, effects } = transition(store.getState(), action);
      // Replaced, not merged; zustand notifies only when `state` is a new object.
      store.setState(state, true);
      effects.forEach(run);
    };

    const actions: GenerationActions = {
      generateTrip: (request) => {
        const token = {};
        const controller = new AbortController();
        controllers.set(token, controller);
        dispatch({ type: "start", token });
        requestTrip(request, controller.signal)
          .then(
            (trip) =>
              dispatch({ type: "land", token, tripUrl: trip.tripUrl, pathname: latest.current.pathname }),
            (error) => {
              // An aborted (cancelled or superseded) call's failure is nobody's concern.
              if (store.getState().pending === token) console.error(error);
              dispatch({ type: "fail", token, pathname: latest.current.pathname });
            },
          )
          .finally(() => controllers.delete(token));
      },
      cancel: () => dispatch({ type: "cancel" }),
      clearFailure: () => dispatch({ type: "clearFailure" }),
    };

    // Only the actions go out: `dispatch` would let a reader set any route or state it liked.
    return { context: { store, actions }, dispatch };
  });

  useConfirmOnPageExit(useStore(context.store, asksBeforeReload));

  useEffect(() => {
    dispatch({ type: "route", pathname });
  }, [dispatch, pathname]);

  return (
    <GenerationContext.Provider value={context}>
      {children}
      <GenerationToast />
    </GenerationContext.Provider>
  );
}
