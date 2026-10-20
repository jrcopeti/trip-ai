"use client";
import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import toast from "react-hot-toast";
import { useTripGeneration } from "@/hooks/useTripGeneration";
import { toastsFor } from "@/lib/generation";
import { showToast } from "./ToastCard";
import {
  FailedToast,
  PLANNING_TOAST,
  PlanningToast,
  ReadyToast,
  RESULT_TOAST,
} from "./GenerationToasts";

/**
 * The only code that shows or dismisses the generation's planning and result toasts: it keeps
 * them equal to `toastsFor(state, pathname)`, and shows each only when it changes, so a route
 * change doesn't re-announce it. Toasts are dismissed, never removed (see the comment below).
 */
function GenerationToast() {
  const { state, cancel, clearResult } = useTripGeneration();
  const pathname = usePathname();
  const { planning, result } = toastsFor(state, pathname);
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
