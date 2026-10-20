"use client";
import { createContext, useCallback, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { createStore, useStore } from "zustand";
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
  type GenerationState,
} from "@/lib/generation";
import { clearFormDraft } from "@/lib/formDraft";
import type { TripRequest } from "@/lib/agent/request";

export type GenerationContextValue = {
  state: GenerationState;
  /** Sends the request; a generation already in flight is superseded and lands to nothing. */
  generateTrip: (request: TripRequest) => void;
  /** Stops waiting for the one in flight, if any; its trip lands to nothing. */
  cancel: () => void;
  /** Drops the last result: its toast, or the form's failure panel. */
  clearResult: () => void;
};

export const GenerationContext = createContext<GenerationContextValue | null>(null);

const NOTICE = { id: NOTICE_TOAST, duration: 5000 };

// One store per provider, not per module: a module-level store would be shared by every
// request on the server, and carried from one test to the next.
const createGenerationStore = () => createStore<GenerationState>()(() => idleGeneration);

/**
 * Owns the trip generation for the whole app, from the root providers, so it outlives `/form`.
 * It makes the call, keeps the state (`src/lib/generation.ts`), runs each transition's effect,
 * sends a trip that lands on `/form` to its page, and asks before a reload while one is pending.
 * The server still finishes a cancelled call and writes an unsaved row (2g stops that).
 */
export function GenerationProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [store] = useState(createGenerationStore);
  const state = useStore(store);
  useConfirmOnPageExit(state.pending !== null);

  const dispatch = useCallback(
    (action: GenerationAction) => {
      const { state: next, effect } = transition(store.getState(), action);
      // Replaced, not merged; zustand notifies only when `next` is a new object.
      store.setState(next, true);
      switch (effect?.type) {
        case "clearDraft":
          clearFormDraft();
          break;
        case "open":
          showToast(<ReadyToast />, NOTICE);
          router.replace(tripPath(effect.tripUrl));
          break;
        case "failedOnForm":
          showToast(<ErrorToaster message={failure.message} />, NOTICE);
          break;
        case "cancelled":
          showToast(<CancelledToast />, NOTICE);
          break;
      }
    },
    [router, store],
  );

  // A result is settled against the route it lands on, and a ready one cleared on its trip's page.
  useEffect(() => {
    dispatch({ type: "route", pathname });
  }, [dispatch, pathname, state.result]);

  const generateTrip = useCallback(
    (request: TripRequest) => {
      const token = {};
      dispatch({ type: "start", token });
      requestTrip(request).then(
        (trip) => dispatch({ type: "land", token, tripUrl: trip.tripUrl }),
        (error) => {
          // A cancelled or superseded call's failure is nobody's concern.
          if (store.getState().pending === token) console.error(error);
          dispatch({ type: "fail", token });
        },
      );
    },
    [dispatch, store],
  );

  const cancel = useCallback(() => dispatch({ type: "cancel" }), [dispatch]);
  const clearResult = useCallback(() => dispatch({ type: "clearResult" }), [dispatch]);

  const value = useMemo<GenerationContextValue>(
    () => ({ state, generateTrip, cancel, clearResult }),
    [state, generateTrip, cancel, clearResult],
  );

  return (
    <GenerationContext.Provider value={value}>
      {children}
      <GenerationToast />
    </GenerationContext.Provider>
  );
}
