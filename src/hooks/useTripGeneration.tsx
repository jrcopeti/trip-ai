"use client";

import { generateTrip } from "@/app/api/anthropicApi";
import { useCallback } from "react";
import { useMutation, type QueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import ErrorToaster from "@/components/ui/ErrorToaster";
import {
  CancelledToast,
  FailedToast,
  GENERATION_TOAST,
  ReadyToast,
  RESULT_TOAST,
} from "@/components/ui/GenerationToasts";
import { failure } from "@/components/form/content";
import type { TripRequest } from "@/lib/agent/request";
import { clearFormDraft } from "@/lib/formDraft";

// Keyed so `Form` and `GenerationToast` can see a generation that outlived the provider.
const generateTripKey = ["generateTrip"];

/** Generations the traveller stopped, by the token each is sent with; their landing is ignored. */
const stoppedGenerations = new WeakSet<object>();

// The token travels in the variables, which TanStack stores the moment the call starts,
// so a stop at any point after `mutate` finds it.
type Generation = { request: TripRequest; token: object };

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
    const generation = mutation.state.variables as Generation | undefined;
    if (generation) stoppedGenerations.add(generation.token);
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
    mutationFn: ({ request }: Generation) => generateTrip(request),

    // The server wrote the row and chose its url; the trip page reads it from there.
    // The answers are spent, so the draft goes; a failure keeps it for another try.
    onSuccess: (trip, { token }) => {
      if (stoppedGenerations.has(token)) return;
      clearFormDraft();
      if (!isOnForm()) {
        // Removed, not dismissed: a dismissed card lingers through its exit, a second View beside this one.
        toast.remove(GENERATION_TOAST);
        toast.custom(<ReadyToast tripUrl={trip.tripUrl} />, { id: RESULT_TOAST, duration: Infinity });
        return;
      }
      // An earlier result may hold this id with an `Infinity` duration, which an update keeps.
      toast.custom(<ReadyToast tripUrl={trip.tripUrl} opensItself />, {
        id: RESULT_TOAST,
        duration: 5000,
      });
      router.replace(`/trips/${trip.tripUrl}`);
    },

    onError: (error, { token }) => {
      if (stoppedGenerations.has(token)) return;
      console.error(error);
      if (!isOnForm()) {
        toast.remove(GENERATION_TOAST);
        toast.custom(<FailedToast />, { id: RESULT_TOAST, duration: Infinity });
        return;
      }
      toast.custom(<ErrorToaster message={failure.message} />);
    },
  });

  // A fresh token per call, so a stop marks this generation and no other.
  const start = useCallback((request: TripRequest) => mutate({ request, token: {} }), [mutate]);

  return { generateTrip: start, isPending, error, reset };
}

export { useTripGeneration, generateTripKey, stopGeneration };
