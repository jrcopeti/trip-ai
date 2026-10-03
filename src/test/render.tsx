import type { ReactElement, ReactNode } from "react";
import { render, type RenderOptions } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import MotionProvider from "@/components/sorbet/MotionProvider";

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
      mutations: { retry: false },
    },
  });
}

function Providers({
  children,
  queryClient,
}: {
  children: ReactNode;
  queryClient: QueryClient;
}) {
  return (
    <QueryClientProvider client={queryClient}>
      <MotionProvider>{children}</MotionProvider>
    </QueryClientProvider>
  );
}

/**
 * Renders inside the providers every client component in this app assumes:
 * TanStack Query (retries off, so error paths resolve on the first failure) and
 * MotionProvider (`reducedMotion="user"`).
 */
export function renderWithProviders(
  ui: ReactElement,
  options: Omit<RenderOptions, "wrapper"> & { queryClient?: QueryClient } = {},
) {
  const { queryClient = makeQueryClient(), ...renderOptions } = options;

  return {
    queryClient,
    ...render(ui, {
      wrapper: ({ children }) => (
        <Providers queryClient={queryClient}>{children}</Providers>
      ),
      ...renderOptions,
    }),
  };
}

export { makeQueryClient };
export * from "@testing-library/react";
