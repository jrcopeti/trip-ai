"use client";

import { fetchResponse } from "@/api/openaiApi";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState, createContext } from "react";

interface FormContextType {
  formData: any;
  setFormData: (data: any) => void;
}

const defaultContextValue: FormContextType = {
  formData: {},
  setFormData: () => {},
};

const FormContext = createContext<FormContextType>(defaultContextValue);

function FormProvider({ children }: { children: React.ReactNode }) {
  const [formData, setFormData] = useState({});

  return (
    <FormContext.Provider value={{ formData, setFormData }}>
      {children}
    </FormContext.Provider>
  );
}

export { FormProvider, FormContext };
