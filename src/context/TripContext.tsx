"use client";

import { createContext, useState } from "react";
import { generateTrip } from "@/app/api/anthropicApi";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import ErrorToaster from "@/components/ui/ErrorToaster";
import CustomToaster from "@/components/ui/CustomToaster";
import type { TripRequest } from "@/lib/agent/request";
import type { TripContextType } from "@/types";

const defaultContextValue: TripContextType = {
  tripData: null,
  generateResponseAI: async () => {},
  isPendingResponseAI: false,
  errorResponseAI: null,
  resetResponseAI: () => {},
  isTripSaved: false,
  setIsTripSaved: () => {},
};

const TripContext = createContext<TripContextType>(defaultContextValue);

function TripProvider({ children }: { children: React.ReactNode }) {
  const [isTripSaved, setIsTripSaved] = useState(false);
  const router = useRouter();

  const {
    mutate: generateResponseAI,
    data: tripData,
    isPending: isPendingResponseAI,
    error: errorResponseAI,
    reset: resetResponseAI,
  } = useMutation({
    mutationFn: (request: TripRequest) => generateTrip(request),

    // The server wrote the row and chose its url.
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
        tripData: tripData ?? null,
        generateResponseAI,
        isPendingResponseAI,
        errorResponseAI,
        resetResponseAI,
        isTripSaved,
        setIsTripSaved,
      }}
    >
      {children}
    </TripContext.Provider>
  );
}

export { TripProvider, TripContext };
