"use client";

import { createContext } from "react";
import { generateTrip } from "@/app/api/anthropicApi";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import ErrorToaster from "@/components/ui/ErrorToaster";
import CustomToaster from "@/components/ui/CustomToaster";
import type { TripRequest } from "@/lib/agent/request";
import type { TripContextType } from "@/types";

const defaultContextValue: TripContextType = {
  generateResponseAI: async () => {},
  isPendingResponseAI: false,
  errorResponseAI: null,
  resetResponseAI: () => {},
};

const TripContext = createContext<TripContextType>(defaultContextValue);

function TripProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  const {
    mutate: generateResponseAI,
    isPending: isPendingResponseAI,
    error: errorResponseAI,
    reset: resetResponseAI,
  } = useMutation({
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

  return (
    <TripContext.Provider
      value={{
        generateResponseAI,
        isPendingResponseAI,
        errorResponseAI,
        resetResponseAI,
      }}
    >
      {children}
    </TripContext.Provider>
  );
}

export { TripProvider, TripContext };
