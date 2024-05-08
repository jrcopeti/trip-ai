"use client";
import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { NextUIProvider } from "@nextui-org/react";
import { Toaster } from "react-hot-toast";
import { TripProvider } from "@/context/TripContext";
import { WeatherProvider } from "@/context/WeatherContext";
import { FormProvider } from "@/context/FormContext";
import { ImageProvider } from "@/context/ImageContext";

interface ProvidersProps {
  children: React.ReactNode;
}

function Providers({ children }: ProvidersProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
          },
        },
      }),
  );
  return (
    <QueryClientProvider client={queryClient}>
      <Toaster
        position="top-center"
        gutter={12}
        toastOptions={{
          duration: 5000,
        }}
      />
      <ImageProvider>
        <WeatherProvider>
          <TripProvider>
            <FormProvider>
              <NextUIProvider>{children}</NextUIProvider>
              {/* <ReactQueryDevtools initialIsOpen={false} /> */}
            </FormProvider>
          </TripProvider>
        </WeatherProvider>
      </ImageProvider>
    </QueryClientProvider>
  );
}

export default Providers;
