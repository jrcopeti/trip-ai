"use client";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useIsMutating, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { generateTripKey, stopGeneration } from "@/hooks/useTripGeneration";
import { useConfirmOnPageExit } from "@/hooks/useConfirmonPageExit";
import { GENERATION_TOAST, PlanningToast } from "./GenerationToasts";

/**
 * Follows a generation off `/form`: while one is pending anywhere else, a persistent toast
 * says so and offers Stop. On `/form` the loader shows instead. Its arrival and failure
 * replace this toast from `useTripGeneration`. Asks before a reload while one is pending.
 */
function GenerationToast() {
  const queryClient = useQueryClient();
  const pathname = usePathname();
  const isGenerating = useIsMutating({ mutationKey: generateTripKey }) > 0;
  useConfirmOnPageExit(isGenerating);

  useEffect(() => {
    // Not dismissed when it settles: by then the ready or failed toast has taken its place.
    if (!isGenerating) return;
    if (pathname === "/form") {
      toast.dismiss(GENERATION_TOAST);
      return;
    }
    toast.custom(<PlanningToast onStop={() => stopGeneration(queryClient)} />, {
      id: GENERATION_TOAST,
      duration: Infinity,
    });
  }, [isGenerating, pathname, queryClient]);

  return null;
}

export default GenerationToast;
