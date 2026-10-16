"use client";

import { generateTrip } from "@/app/api/anthropicApi";
import { useMutation, type QueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import ErrorToaster from "@/components/ui/ErrorToaster";
import {
  CancelledToast,
  FailedToast,
  GENERATION_TOAST,
  ReadyToast,
} from "@/components/ui/GenerationToasts";
import type { TripRequest } from "@/lib/agent/request";
import { clearFormDraft } from "@/lib/formDraft";

// Keyed so `Form` and `GenerationToast` can see a generation that outlived the provider.
const generateTripKey = ["generateTrip"];

/** Requests the traveller stopped; their landing is ignored. Keyed by the request object. */
const stoppedRequests = new WeakSet<object>();

// The provider that started the call may be long unmounted, so this reads the live
// location; its `usePathname` would still say /form.
const isOnForm = () => window.location.pathname === "/form";

/**
 * Stops waiting for the pending generation: it leaves the mutation cache, its landing does
 * nothing, and a toast says it was cancelled. The server still finishes the call and writes
 * an unsaved row (2g stops that).
 */
function stopGeneration(queryClient: QueryClient) {
  const cache = queryClient.getMutationCache();
  for (const mutation of cache.findAll({ mutationKey: generateTripKey, status: "pending" })) {
    const request = mutation.state.variables;
    if (typeof request === "object" && request) stoppedRequests.add(request);
    cache.remove(mutation);
  }
  // Replaces the persistent planning toast in place, so its `Infinity` duration must be overridden.
  toast.custom(<CancelledToast />, { id: GENERATION_TOAST, duration: 5000 });
}

/**
 * Sends the trip request; `FormProvider` runs it once and hands `Form` its error. On `/form`
 * a trip that comes back opens; anywhere else the traveller gets a toast to open it, and a
 * failure a toast back to the form.
 */
function useTripGeneration() {
  const router = useRouter();

  const { mutate, isPending, error, reset } = useMutation({
    mutationKey: generateTripKey,
    mutationFn: (request: TripRequest) => generateTrip(request),

    // The server wrote the row and chose its url; the trip page reads it from there.
    // The answers are spent, so the draft goes; a failure keeps it for another try.
    onSuccess: (trip, request) => {
      if (stoppedRequests.has(request)) return;
      clearFormDraft();
      if (!isOnForm()) {
        toast.custom(<ReadyToast tripUrl={trip.tripUrl} />, {
          id: GENERATION_TOAST,
          duration: Infinity,
        });
        return;
      }
      toast.custom(<ReadyToast tripUrl={trip.tripUrl} opensItself />);
      router.replace(`/trips/${trip.tripUrl}`);
    },

    onError: (error, request) => {
      if (stoppedRequests.has(request)) return;
      console.error(error);
      if (!isOnForm()) {
        toast.custom(<FailedToast />, { id: GENERATION_TOAST, duration: Infinity });
        return;
      }
      toast.custom(
        <ErrorToaster message="There was an error generating your trip. Please try again." />,
      );
    },
  });

  return { generateTrip: mutate, isPending, error, reset };
}

export { useTripGeneration, generateTripKey, stopGeneration };
