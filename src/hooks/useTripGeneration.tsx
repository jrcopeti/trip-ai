"use client";
import { useContext } from "react";
import { useStore } from "zustand";
import { GenerationContext, type GenerationActions } from "@/context/GenerationContext";
import type { GenerationState } from "@/lib/generation";

function useGenerationContext() {
  const value = useContext(GenerationContext);
  if (!value) throw new Error("The trip generation needs GenerationProvider (the root providers)");
  return value;
}

/** The calls that change the app's trip generation; stable, so reading them re-renders nothing. */
export function useTripGeneration(): GenerationActions {
  return useGenerationContext().actions;
}

/**
 * The part of the generation's state `selector` picks; re-renders only when that changes.
 * `selector` returns a primitive or a piece of the state, never a new object.
 */
export function useGenerationState<T>(selector: (state: GenerationState) => T): T {
  return useStore(useGenerationContext().store, selector);
}
