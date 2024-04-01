"use client";

import { fetchResponse } from "@/api/openai";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState, createContext } from "react";

interface TripContextType {
  tripData: any;
  generateResponse: (prompt: string) => void;
  isPending: boolean;
  error: any;
}

const defaultContextValue: TripContextType = {
  tripData: null, // Default to null or an appropriate initial value
  generateResponse: () => {},
  isPending: false,
  error: null,
};

const TripContext = createContext<TripContextType>(defaultContextValue);

function TripProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  const {
    mutate: generateResponse,
    data: tripData,
    isPending,
    error,
  } = useMutation({
    mutationKey: ["trip"],
    mutationFn: (prompt: string) => fetchResponse(prompt),

    onSuccess: (responseData) => {
      console.log("success ");
      // router.push("/trip");
    },
    onError: (error) => {
      console.log(error);
    },
  });

  return (
    <TripContext.Provider
      value={{ tripData, generateResponse, isPending, error }}
    >
      {children}
    </TripContext.Provider>
  );
}

export { TripProvider, TripContext };
