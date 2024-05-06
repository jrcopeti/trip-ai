import SavedTripsPageComponent from "@/components/trips/SavedTripsPageComponent";
import {
  HydrationBoundary,
  QueryClient,
  dehydrate,
} from "@tanstack/react-query";

function SavedTripsPageId({ params }: { params: { id: number | string } }) {
  const queryClient = new QueryClient();

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <SavedTripsPageComponent params={params} />
    </HydrationBoundary>
  );
}

export default SavedTripsPageId;
