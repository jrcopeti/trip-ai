"use client";
import { TripProvider } from "@/context/TripContext";
import { WeatherProvider } from "@/context/WeatherContext";
import { FormProvider } from "@/context/FormContext";

// Only /form reads these; mounted here, the form's state goes when the traveller leaves.
function FormProviders({ children }: { children: React.ReactNode }) {
  return (
    <WeatherProvider>
      <TripProvider>
        <FormProvider>{children}</FormProvider>
      </TripProvider>
    </WeatherProvider>
  );
}

export default FormProviders;
