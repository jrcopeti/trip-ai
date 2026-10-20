"use client";
import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { useIsMutating, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { generateTripKey, stopGeneration } from "@/hooks/useTripGeneration";
import { useConfirmOnPageExit } from "@/hooks/useConfirmonPageExit";
import { GENERATION_TOAST, PlanningToast } from "./GenerationToasts";

/**
 * Follows a generation off `/form`: while one is pending anywhere else, a persistent toast
 * says so and offers Cancel. On `/form` the loader shows instead. Its arrival and failure
 * replace this toast from `useTripGeneration`. Asks before a reload while one is pending.
 */
function GenerationToast() {
  const queryClient = useQueryClient();
  const pathname = usePathname();
  const isGenerating = useIsMutating({ mutationKey: generateTripKey }) > 0;
  useConfirmOnPageExit(isGenerating);

  // Shown once per generation: re-creating it on each route would re-announce it.
  const isShown = useRef(false);

  useEffect(() => {
    // Not dismissed when it settles: by then the result or cancelled toast has taken over.
    if (!isGenerating) {
      isShown.current = false;
      return;
    }
    if (pathname === "/form") {
      // Removed, not dismissed: a dismissed toast stays clickable for its 1s exit, its Cancel under the loader.
      toast.remove(GENERATION_TOAST);
      isShown.current = false;
      return;
    }
    if (isShown.current) return;
    isShown.current = true;
    toast.custom(<PlanningToast onStop={() => stopGeneration(queryClient)} />, {
      id: GENERATION_TOAST,
      duration: Infinity,
    });
  }, [isGenerating, pathname, queryClient]);

  return null;
}

export default GenerationToast;
