"use client";

import dynamic from "next/dynamic";

const DynamicSavedTripsPageComponent = dynamic(
  () => import("@/components/pages/saved-trips/SavedTripsPageComponent"),
  {
    ssr: false,
  },
);
// import SavedTripsPageComponent from "@/components/SavedTripsPageComponent";

import {
  HydrationBoundary,
  QueryClient,
  dehydrate,
} from "@tanstack/react-query";

function SavedTripsPageId({ params }: { params: { id: number | string } }) {
  const queryClient = new QueryClient();

  return (
    // <HydrationBoundary state={dehydrate(queryClient)}>
    <DynamicSavedTripsPageComponent params={params} />
    // </HydrationBoundary>
  );
}

export default SavedTripsPageId;
