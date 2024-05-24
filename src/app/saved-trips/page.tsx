import {
  HydrationBoundary,
  QueryClient,
  dehydrate,
} from "@tanstack/react-query";
import SavedTripsDisplay from "@/components/trips/SavedTripsDisplay";
import Container from "@/components/ui/Container";
import GradientBg from "@/components/ui/GradientBg";
import SavedTripsContainer from "@/components/trips/SavedTripsContainer";

function SavedTripsPage() {
  const queryClient = new QueryClient();

  return (
    <>
      <Container height="h-full">
        <GradientBg position="fixed" />
        <SavedTripsContainer>
          <HydrationBoundary state={dehydrate(queryClient)}>
            <SavedTripsDisplay />
          </HydrationBoundary>
        </SavedTripsContainer>
      </Container>
    </>
  );
}

export default SavedTripsPage;
