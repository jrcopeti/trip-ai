import { useContext } from "react";
import {
  CityCheckContext,
  FormFieldsContext,
  FormStepsContext,
} from "@/context/FormContext";
import type { FormContextType } from "@/types";

/** The step: its number, slide direction, progress, and Next/Back. */
export function useFormSteps() {
  return useContext(FormStepsContext);
}

/** RHF's control, errors and field array, the submit, and the weather choice. */
export function useFormFields() {
  return useContext(FormFieldsContext);
}

/** The destination's check; changes with every keystroke in the city. */
export function useCityCheck() {
  return useContext(CityCheckContext);
}

// All three at once, so it re-renders on any change: for tests and probes, not components.
export function useFormData(): FormContextType {
  return { ...useFormSteps(), ...useFormFields(), ...useCityCheck() };
}
