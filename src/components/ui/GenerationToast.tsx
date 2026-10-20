"use client";
import { useEffect, useMemo, useRef, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import toast from "react-hot-toast";
import { useGenerationState, useTripGeneration } from "@/hooks/useTripGeneration";
import { toastsFor } from "@/lib/generation";
import { showToast } from "./ToastCard";
import {
  FAILURE_TOAST,
  FailedToast,
  PLANNING_TOAST,
  PlanningToast,
  ReadyToast,
  TRIP_TOAST,
} from "./GenerationToasts";

/**
 * Keeps toast `id` showing `card` while `key` is non-null, and dismissed while it is null; shows
 * it again only when `key` changes, so a route change doesn't re-announce it. Dismissed, never
 * removed: a toast removed under the cursor leaves the Toaster's hover pause on for good.
 */
function useToast(id: string, key: string | null, card: () => ReactNode) {
  const shown = useRef<string | null>(null);
  useEffect(() => {
    if (key === shown.current) return;
    shown.current = key;
    if (key === null) toast.dismiss(id);
    else showToast(card(), { id, duration: Infinity });
  }, [id, key, card]);
}

/** The only code that shows or dismisses the generation's planning, trip and failure toasts. */
function GenerationToast() {
  const { cancel, clearFailure } = useTripGeneration();
  // The state object changes only on a transition, so this re-renders only then and on a route.
  const state = useGenerationState((generation) => generation);
  const pathname = usePathname();
  const { planning, trip, failure } = useMemo(() => toastsFor(state, pathname), [state, pathname]);

  useToast(PLANNING_TOAST, planning ? "planning" : null, () => <PlanningToast onCancel={cancel} />);
  useToast(TRIP_TOAST, trip, () => <ReadyToast tripUrl={trip ?? undefined} />);
  useToast(FAILURE_TOAST, failure ? "failure" : null, () => <FailedToast onDismiss={clearFailure} />);

  return null;
}

export default GenerationToast;
