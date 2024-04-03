'use client'
import SavedTripsComponent from "@/components/SavedTripsComponent";
import {
  HydrationBoundary,
  dehydrate,
  useQueryClient,
} from "@tanstack/react-query";


function SavedTripsPage
() {
  const queryClient = useQueryClient();
  return (
    <HydrationBoundary  state={dehydrate(queryClient)}>
      <SavedTripsComponent />
    </HydrationBoundary>
  );
}

export default SavedTripsPage
;
