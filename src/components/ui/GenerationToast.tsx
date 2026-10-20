"use client";
import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import toast from "react-hot-toast";
import { useGenerationState, useTripGeneration } from "@/hooks/useTripGeneration";
import { toastsFor } from "@/lib/generation";
import { showToast } from "./ToastCard";
import {
  FailedToast,
  PLANNING_TOAST,
  PlanningToast,
  ReadyToast,
  RESULT_TOAST,
} from "./GenerationToasts";

// `toastsFor` only asks whether one is in flight, not which.
const PENDING = {};

/**
 * The only code that shows or dismisses the generation's planning and result toasts: it keeps
 * them equal to `toastsFor(state, pathname)`, and shows each only when it changes, so a route
 * change doesn't re-announce it. Toasts are dismissed, never removed (see the comment below).
 */
function GenerationToast() {
  const { cancel, clearResult } = useTripGeneration();
  // Each a primitive or the state's own `result`, so a transition re-renders this only when
  // the toasts it shows can change.
  const pending = useGenerationState((state) => state.pending !== null);
  const lastResult = useGenerationState((state) => state.result);
  const pathname = usePathname();
  const { planning, result } = toastsFor(
    { pending: pending ? PENDING : null, result: lastResult },
    pathname,
  );
  const resultKey = result && (result.kind === "ready" ? `ready:${result.tripUrl}` : "failed");

  const shown = useRef({ planning: false, resultKey: null as string | null });

  // Dismissed, not removed: a toast removed under the cursor gets no mouseleave, and the
  // Toaster's hover pause then holds every later toast on screen for good.
  useEffect(() => {
    if (planning === shown.current.planning) return;
    shown.current.planning = planning;
    if (planning) {
      showToast(<PlanningToast onCancel={cancel} />, { id: PLANNING_TOAST, duration: Infinity });
    } else {
      toast.dismiss(PLANNING_TOAST);
    }
  }, [planning, cancel]);

  useEffect(() => {
    if (resultKey === shown.current.resultKey) return;
    shown.current.resultKey = resultKey;
    if (!result) {
      toast.dismiss(RESULT_TOAST);
      return;
    }
    const card =
      result.kind === "ready" ? (
        <ReadyToast tripUrl={result.tripUrl} />
      ) : (
        <FailedToast onDismiss={clearResult} />
      );
    showToast(card, { id: RESULT_TOAST, duration: Infinity });
  }, [resultKey, result, clearResult]);

  return null;
}

export default GenerationToast;
