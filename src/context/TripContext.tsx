"use client";

import { fetchResponseAI } from "@/api/openaiApi";
import { useFormData } from "@/hooks/useFormData";
import { useMutation} from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { createContext } from "react";
import { Trip } from "@prisma/client"

interface TripContextType {
  tripData: Trip | undefined;
  generateResponseAI: (prompt: string) => void;
  isPendingResponseAI: boolean;
  errorResponseAI: unknown;
}

const defaultContextValue: TripContextType = {
  tripData: undefined,
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
    mutationFn: (prompt: string) => fetchResponseAI(prompt),

    onSuccess: () => {
      console.log("success trip");
      router.push(`/trips/${formData.tripUrl}`);
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
