"use client";
import SavedTripsDisplay from "@/components/SavedTripsDisplay";
import Container from "@/components/ui/Container";
import GradientBg from "@/components/ui/GradientBg";
import SavedTripsContainer from "@/components/ui/SavedTripsContainer";
import {
  HydrationBoundary,
  dehydrate,
  useQueryClient,
} from "@tanstack/react-query";

function SavedTripsPage() {
  const queryClient = useQueryClient();

  return (
    <>
      <Container height="h-full">
        <GradientBg
          position="fixed"
          from="from-neptune-300"
          to="to-yellorange-200"
          blur="blur-[190px]"
        />
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
