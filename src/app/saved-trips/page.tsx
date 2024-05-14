import SavedTripsDisplay from "@/components/trips/SavedTripsDisplay";
import {
  HydrationBoundary,
  QueryClient,
  dehydrate,
} from "@tanstack/react-query";

function SavedTripsPage() {
  const queryClient = new QueryClient();

  return (
    <>
      <HydrationBoundary state={dehydrate(queryClient)}>
        <SavedTripsDisplay />
      </HydrationBoundary>
    </>
  );
}

export default SavedTripsPage;
