"use client";
import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Toaster } from "react-hot-toast";
import MotionProvider from "@/components/sorbet/MotionProvider";

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
      {/*
        MotionProvider sits here so `reducedMotion="user"` is in force on every
        route rather than only the landing, and so it stays the single place
        reduced motion is handled — components never branch on
        `useReducedMotion()`. See design-notes, "Motion".
      */}
      <MotionProvider>
        <Toaster
          position="top-center"
          gutter={12}
          toastOptions={{
            duration: 5000,
          }}
        />
        {children}
        {/* <ReactQueryDevtools initialIsOpen={false} /> */}
      </MotionProvider>
    </QueryClientProvider>
  );
}

export default Providers;
