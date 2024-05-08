import SavedTripsPageComponent from "@/components/trips/SavedTripsPageComponent";
import {
  HydrationBoundary,
  QueryClient,
  dehydrate,
} from "@tanstack/react-query";

function SavedTripsPageId() {
  const queryClient = new QueryClient();

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <SavedTripsPageComponent />
    </HydrationBoundary>
  );
}

export default SavedTripsPageId;
