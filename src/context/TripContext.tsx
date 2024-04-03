"use client";

import { fetchResponseAI } from "@/api/openaiApi";
import { useFormData } from "@/hooks/useFormData";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState, createContext } from "react";

interface TripContextType {
  tripData: any;
  generateResponseAI: (prompt: string) => void;
  isPendingResponseAI: boolean;
  errorResponseAI: any;
}

const defaultContextValue: TripContextType = {
  tripData: null,
  generateResponseAI: () => {},
  isPendingResponseAI: false,
  errorResponseAI: null,
};

const TripContext = createContext<TripContextType>(defaultContextValue);

function TripProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const {formData} = useFormData()

  const {
    mutate: generateResponseAI,
    data: tripData,
    isPending: isPendingResponseAI,
    error: errorResponseAI,
  } = useMutation({
    mutationKey: ["trip"],
    mutationFn: (prompt: string) => fetchResponseAI(prompt),

    onSuccess: (responseData) => {
      console.log("success ");
      router.push(`/trip/${formData.tripUrl}`);
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
      }}
    >
      {children}
    </TripContext.Provider>
  );
}

export { TripProvider, TripContext };
