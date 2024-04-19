import SavedTripsDisplay from "@/components/SavedTripsDisplay";
import Container from "@/components/ui/Container";
import Gradient1 from "@/components/ui/Gradient1";
import GradientBg from "@/components/ui/GradientBg";
import GridContainer from "@/components/ui/GridContainer";
import {
  HydrationBoundary,
  dehydrate,
  useQueryClient,
} from "@tanstack/react-query";

function SavedTripsPage() {
  return (
    <Container overflow="overflow-hidden">
      <GradientBg
        from="from-neptune-300"
        to="to-yellorange-200"
        blur="blur-[190px]"
      />
      <GridContainer bg="bg-gallery-100/50">
        <SavedTripsDisplay />
      </GridContainer>
    </Container>
  );
}

export default SavedTripsPage;
