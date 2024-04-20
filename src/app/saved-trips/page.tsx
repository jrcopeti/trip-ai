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
  return (
    <Container overflow="overflow-x-hidden" height="auto">
      <GradientBg
        from="from-neptune-300"
        to="to-yellorange-200"
        blur="blur-[190px]"
      />
      <SavedTripsContainer>
        <SavedTripsDisplay />
      </SavedTripsContainer>
    </Container>
  );
}

export default SavedTripsPage;
