"use client";
import SavedTripsPage from "@/components/SavedTripsPageComponent";

import {
  HydrationBoundary,
  QueryClient,
  dehydrate,
} from "@tanstack/react-query";

function SavedTripsPageId({ params }: { params: { id: number | string } }) {
  const queryClient = new QueryClient();

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <SavedTripsPage params={params} />;
    </HydrationBoundary>
  );
}

export default SavedTripsPageId;
