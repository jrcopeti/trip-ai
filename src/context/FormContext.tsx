"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, createContext } from "react";
import { z } from "zod";


import { FormDataSchema } from "@/lib/schema";
import { FinalDataTypes } from "@/types";

type Inputs = z.infer<typeof FormDataSchema>;
interface FormContextType {
  formData: FinalDataTypes;
  setFormData: (data: FinalDataTypes) => void;
}

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

const defaultContextValue: FormContextType = {
  formData: defaultFormData,
  setFormData: () => {},
};

const FormContext = createContext<FormContextType>(defaultContextValue);

function FormProvider({ children }: { children: React.ReactNode }) {
  const [formData, setFormData] = useState<FinalDataTypes>(defaultFormData);

  return (
    <FormContext.Provider value={{ formData, setFormData }}>
      {children}
    </FormContext.Provider>
  );
}

export { FormProvider, FormContext };
