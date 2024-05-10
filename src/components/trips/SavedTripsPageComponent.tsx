"use client";
import { notFound, useParams } from "next/navigation";
import { useSingleSavedTrip } from "@/hooks/useSingleSavedTrip";
import { useLocomotiveScroll } from "@/hooks/useLocomotiveScroll";
import { useScrollTrigger } from "@/hooks/useScrollTrigger";

import WeatherSection from "./WeatherSection";
import ObjectsSection from "./ObjectsSection";
import ToursSection from "./ToursSection";
import DescriptionSection from "./DescriptionSection";
import TitleSection from "./TitleSection";
import PackReadySection from "./PackReadySection";
import MustHaveSection from "./MustHaveSection";
import ForecastSection from "./ForecastSection";
import FormDetailsSection from "./FormDetailsSection";
import FinalSection from "./FinalSection";
import GradientBg from "../ui/GradientBg";
import Container from "../ui/Container";
import Loader from "../ui/Loader";
import ButtonBackOutlined from "../ui/ButtonBackOutlined";

function SavedTripsPageComponent() {
  const params = useParams();
  const { trip, isPendingSingleSavedTrip } = useSingleSavedTrip({ params });

  useScrollTrigger();

  if (isPendingSingleSavedTrip) {
    return <Loader />;
  }

  if (!trip) {
    notFound();
  }

  return (
    <>
      {/* Section 1 */}

      <Container overflow="overflow-hidden">
        <GradientBg from="from-shark-100" to="to-neptune-200" />
        <ButtonBackOutlined position="absolute -top-1 -left-2 xs:top-0 xs:left-0 lg:top-2 lg:left-10" />
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
        <FinalSection />
      </Container>
    </>
  );
}

export default SavedTripsPageComponent;
