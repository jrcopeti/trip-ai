"use client";

import { generateTrip } from "@/app/api/anthropicApi";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import ErrorToaster from "@/components/ui/ErrorToaster";
import CustomToaster from "@/components/ui/CustomToaster";
import type { TripRequest } from "@/lib/agent/request";

// Keyed so `Form` can see a generation that outlived the provider: one left running
// when the traveller left /form still redirects when it lands.
const generateTripKey = ["generateTrip"];

/** Sends the trip request; `FormProvider` runs it once and hands `Form` its error. */
function useTripGeneration() {
  const router = useRouter();

  const { mutate, isPending, error, reset } = useMutation({
    mutationKey: generateTripKey,
    mutationFn: (request: TripRequest) => generateTrip(request),

    // The server wrote the row and chose its url; the trip page reads it from there.
    onSuccess: (trip) => {
      toast.custom(<CustomToaster message="Your trip has been generated!" />);
      router.replace(`/trips/${trip.tripUrl}`);
    },

    onError: (error) => {
      console.error(error);
      toast.custom(
        <ErrorToaster message="There was an error generating your trip. Please try again." />,
      );
    },
  });

  return { generateTrip: mutate, isPending, error, reset };
}

export { useTripGeneration, generateTripKey };
