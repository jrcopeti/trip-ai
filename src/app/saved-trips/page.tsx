"use client";
import SavedTripsDisplay from "@/components/pages/saved-trips/SavedTripsDisplay";
import {
  HydrationBoundary,
  dehydrate,
  useQueryClient,
} from "@tanstack/react-query";

function SavedTripsPage() {
  const queryClient = useQueryClient();
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <SavedTripsDisplay />
    </HydrationBoundary>
  );
}

export default SavedTripsPage;
