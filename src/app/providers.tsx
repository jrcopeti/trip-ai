"use client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

import { NextUIProvider } from "@nextui-org/react";
import { useState } from "react";
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
            staleTime: 60 * 1000, // 1 minute
          },
        },
      }),
  );
  return (
    <QueryClientProvider client={queryClient}>
      <FormProvider>
        <ImageProvider>
          <WeatherProvider>
            <TripProvider>
              <NextUIProvider>{children}</NextUIProvider>;
              <ReactQueryDevtools initialIsOpen={false} />
            </TripProvider>
          </WeatherProvider>
        </ImageProvider>
      </FormProvider>
    </QueryClientProvider>
  );
}

export default Providers;
