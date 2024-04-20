"use client";

import { createContext, useEffect, useState } from "react";
import { fetchResponseAI } from "@/api/openaiApi";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import type { TripContextType } from "@/types";

const defaultContextValue: TripContextType = {
  tripData: undefined,
  generateResponseAI: () => {},
  isPendingResponseAI: false,
  errorResponseAI: null,
  isNavigating: false,
};

const TripContext = createContext<TripContextType>(defaultContextValue);

function TripProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const tripId = crypto.randomUUID().slice(0, 5);
  const path = `/trips/${tripId}`;
  const [isNavigating, setIsNavigating] = useState(false);

  useEffect(() => {
    router.prefetch(path);
  }, [path, router]);

  const {
    mutate: generateResponseAI,
    data: tripData,
    isPending: isPendingResponseAI,
    error: errorResponseAI,
  } = useMutation({
    mutationFn: (prompt: string) => fetchResponseAI(prompt),

    onSuccess: () => {
      setIsNavigating(true);
      router.push(path);
      setTimeout(() => {
        setIsNavigating(false);
      }, 2000);
    },
    onError: (error) => {
      console.log(error);
    },
  });

  return (
    <TripContext.Provider
      value={{
        tripData,
        generateResponseAI,
        isPendingResponseAI,
        errorResponseAI,
        isNavigating,
      }}
    >
      {children}
    </TripContext.Provider>
  );
}

export { TripProvider, TripContext };
