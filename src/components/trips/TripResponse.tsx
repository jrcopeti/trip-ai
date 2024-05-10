"use client";
import { notFound, useParams, usePathname } from "next/navigation";
import { useTripResponse } from "@/hooks/useTripResponse";
import { useCreateTrip } from "@/hooks/useCreateTrip";
import { useConfirmOnPageExit } from "@/hooks/useConfirmonPageExit";
import { useScrollTrigger } from "@/hooks/useScrollTrigger";

import FormDetailsSection from "./FormDetailsSection";
import TitleSection from "./TitleSection";
import DescriptionSection from "./DescriptionSection";
import ToursSection from "./ToursSection";
import PackReadySection from "./PackReadySection";
import ObjectsSection from "./ObjectsSection";
import MustHaveSection from "./MustHaveSection";
import WeatherSection from "./WeatherSection";
import ForecastSection from "./ForecastSection";
import SaveSection from "./SaveSection";
import GradientBg from "../ui/GradientBg";
import Container from "../ui/Container";
import Loader from "../ui/Loader";
import NotFoundComponent from "../ui/NotFoundComponent";

function TripResponse() {
  const { tripData: trip, isPendingResponseAI } = useTripResponse();
  useScrollTrigger(isPendingResponseAI);
  useConfirmOnPageExit();

  if (isPendingResponseAI) {
    return <Loader />;
  }

  if (trip === null) {
    return (
      <NotFoundComponent
        message="Seems that there's something wrong with the destination provided. Please try again."
        path="/form"
        button="Back to New Trip"
      />
    );
  }

  if (trip === undefined) {
    notFound();
  }

  return (
    <>
      {/* Section 1 */}
      <Container overflow="overflow-hidden">
        <GradientBg from="from-shark-100" to="to-neptune-200" />
        <TitleSection />
      </Container>

      {/* Section 2 */}

      <Container
        overflow="overflow-hidden"
        animationClass="description-section"
      >
        <GradientBg from="from-neptune-200" to="to-shark-100" />
        <DescriptionSection />
      </Container>

      {/* Section 3 */}

      <Container overflow="overflow-hidden" animationClass="tours-section">
        <GradientBg from="from-shark-100" to="to-yellorange-100" />
        <ToursSection />
      </Container>

      {/* Section 4 */}

      <Container overflow="overflow-hidden" animationClass="pack-section">
        <GradientBg from="from-yellorange-100" to="to-shark-100" />
        <PackReadySection />
      </Container>

      {/* Section 5 */}

      <Container overflow="overflow-hidden" animationClass="objects-section">
        <GradientBg from="from-shark-100" to="to-cabaret-100" />
        <ObjectsSection />
      </Container>

      {/* Section 6 */}

      <Container overflow="overflow-hidden" animationClass="musthave-section">
        <GradientBg from="from-cabaret-100" to="to-shark-100" />
        <MustHaveSection />
      </Container>

      {/* Section 7 */}

      <Container overflow="overflow-hidden" animationClass="weather-section">
        <GradientBg from="from-shark-100" to="to-violay-200" />
        <WeatherSection />
      </Container>

      {/* Section 8 */}

      <Container overflow="overflow-hidden" animationClass="forecast-section">
        <GradientBg from="from-violay-200" to="to-shark-100" />
        <ForecastSection />
      </Container>

      {/* Section 9 */}

      <Container
        overflow="overflow-hidden"
        animationClass="formdetails-section"
      >
        <GradientBg from="from-shark-100" to="to-neptune-200" />
        <FormDetailsSection />
      </Container>

      {/* Section 10 */}

      <Container overflow="overflow-hidden" animationClass="final-section">
        <GradientBg from="from-neptune-200" to="to-shark-100" />
        <SaveSection />
      </Container>
    </>
  );
}

export default TripResponse;
