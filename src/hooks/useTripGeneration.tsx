"use client";
import { useContext } from "react";
import { GenerationContext, type GenerationContextValue } from "@/context/GenerationContext";

/** The app's trip generation: its state, and the calls that change it (`GenerationProvider`). */
export function useTripGeneration(): GenerationContextValue {
  const value = useContext(GenerationContext);
  if (!value) throw new Error("useTripGeneration needs GenerationProvider (the root providers)");
  return value;
}
