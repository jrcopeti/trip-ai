"use client";

import { useState, createContext } from "react";
import type { FinalDataTypes, FormContextType, Inputs } from "@/types";

const defaultFormData: Inputs = {
  userName: "",
  age: "",
  nationality: "",
  type: "",
  city: "",
  country: "",
  luggageSize: "",
  accommodation: "",
  budget: "",
  transport: "",
  requiredItems: [{ item: "" }],
  interests: [""],
  note: "",
  startDate: new Date().toISOString(),
  endDate: new Date().toISOString(),
  weatherForecast: "",
  agreement: false,
  flagUrl: "",
  tripUrl: crypto.randomUUID().slice(0, 5),
};

function transformInputsToFinalData(inputs: Inputs): FinalDataTypes {
  const transformedRequiredItems =
    inputs.requiredItems?.map((i) => i.item) ?? [];

  return {
    ...inputs,
    requiredItems: transformedRequiredItems,
    weatherForecast: inputs.weatherForecast || "",
  };
}
const initialFinalData = transformInputsToFinalData(defaultFormData);

const defaultContextValue: FormContextType = {
  formData: initialFinalData,
  setFormData: () => {},
};

const FormContext = createContext<FormContextType>(defaultContextValue);

function FormProvider({ children }: { children: React.ReactNode }) {
  const [formData, setFormData] = useState<FinalDataTypes>(initialFinalData);

  return (
    <FormContext.Provider value={{ formData, setFormData }}>
      {children}
    </FormContext.Provider>
  );
}

export { FormProvider, FormContext };
