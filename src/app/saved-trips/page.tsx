"use client";
import SavedTripsDisplay from "@/components/SavedTripsDisplay";
import Container from "@/components/ui/Container";
import GradientBg from "@/components/ui/GradientBg";
import SavedTripsContainer from "@/components/ui/SavedTripsContainer";
import dynamic from "next/dynamic";

const DynamicSavedTripsDisplay = dynamic(() => import("@/components/SavedTripsDisplay"), {
  ssr: false,
});
function SavedTripsPage() {


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
          <DynamicSavedTripsDisplay />
        </SavedTripsContainer>
      </Container>
    </>
  );
}

export default SavedTripsPage;
