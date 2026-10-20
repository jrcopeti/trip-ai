"use client";
import { createContext, useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { createStore, useStore, type StoreApi } from "zustand";
import { generateTrip as requestTrip } from "@/app/api/anthropicApi";
import GenerationToast from "@/components/ui/GenerationToast";
import { CancelledToast, NOTICE_TOAST, ReadyToast } from "@/components/ui/GenerationToasts";
import ErrorToaster from "@/components/ui/ErrorToaster";
import { showToast } from "@/components/ui/ToastCard";
import { failure } from "@/components/form/content";
import { useConfirmOnPageExit } from "@/hooks/useConfirmonPageExit";
import {
  idleGeneration,
  transition,
  tripPath,
  type GenerationAction,
  type GenerationEffect,
  type GenerationState,
} from "@/lib/generation";
import { clearFormDraft } from "@/lib/formDraft";
import type { TripRequest } from "@/lib/agent/request";

export type GenerationActions = {
  /** Sends the request; a generation already in flight is superseded and lands to nothing. */
  generateTrip: (request: TripRequest) => void;
  /** Stops waiting for the one in flight, if any; its trip lands to nothing. */
  cancel: () => void;
  /** Drops the last result: its toast, or the form's failure panel. */
  clearResult: () => void;
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
 * reload while one is pending. A cancelled call still writes an unsaved row (2g stops that).
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

    const run = (effect: GenerationEffect) => {
      switch (effect.type) {
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
        dispatch({ type: "start", token });
        requestTrip(request).then(
          (trip) =>
            dispatch({ type: "land", token, tripUrl: trip.tripUrl, pathname: latest.current.pathname }),
          (error) => {
            // A cancelled or superseded call's failure is nobody's concern.
            if (store.getState().pending === token) console.error(error);
            dispatch({ type: "fail", token, pathname: latest.current.pathname });
          },
        );
      },
      cancel: () => dispatch({ type: "cancel" }),
      clearResult: () => dispatch({ type: "clearResult" }),
    };

    // Only the actions go out: `dispatch` would let a reader set any route or state it liked.
    return { context: { store, actions }, dispatch };
  });

  useConfirmOnPageExit(useStore(context.store, (state) => state.pending !== null));

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
