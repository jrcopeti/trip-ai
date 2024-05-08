"use client";
import { useEffect, useLayoutEffect } from "react";
import { notFound, useParams, usePathname } from "next/navigation";
import { useWeather } from "@/hooks/useWeather";
import { useSingleSavedTrip } from "@/hooks/useSingleSavedTrip";
import { useLocomotiveScroll } from "@/hooks/useLocomotiveScroll";

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

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useRouter } from "next/navigation";

function SavedTripsPageComponent({
  params,
}: {
  params: { id: number | string };
}) {
  const { trip, isPendingSingleSavedTrip } = useSingleSavedTrip({ params });

  const {
    isPendingWeather,
    weatherData,
    isPendingDailyForecast,
    dailyForecastData,
  } = useWeather();

  useLocomotiveScroll();

  const useIsomorphicLayoutEffect =
    typeof window !== "undefined" ? useLayoutEffect : useEffect;

  useIsomorphicLayoutEffect(() => {
    if (!isPendingSingleSavedTrip) {
      gsap.registerPlugin(ScrollTrigger);
      const context = gsap.context(() => {
        gsap.from(".trip-description", {
          autoAlpha: 0,
          y: 150,
          duration: 1,
          ease: "power1.inOut",
          scrollTrigger: {
            trigger: ".description-section",
            start: "100px bottom",
            end: "center 300px",
            toggleActions: "restart none play none",
          },
        });

        gsap.from(".plane", {
          autoAlpha: 0,
          x: -200,

          scrollTrigger: {
            trigger: ".tours-section",
            start: "300px bottom",
            end: "center -300px",
            scrub: true,
          },
        });

        gsap.from(".title-tours", {
          autoAlpha: 0,
          y: 150,
          duration: 1,
          ease: "power1.inOut",
          scrollTrigger: {
            trigger: ".tours-section",
            start: "100px bottom",
            end: "center 300px",
            toggleActions: "restart none play none",
          },
        });

        ScrollTrigger.batch(".tour-item", {
          start: "top bottom",
          end: "center center",

          onEnter: (elements) => {
            gsap.from(elements, {
              autoAlpha: 0,
              y: 100,
              stagger: 0.5,
            });
          },
        });

        gsap.from(".stamps", {
          autoAlpha: 0,
          duration: 1,
          scrollTrigger: {
            trigger: ".stamps",
            start: "300px bottom",
            end: "center -100px",
            scrub: 1,
          },
        });

        ScrollTrigger.batch(".objects-list", {
          start: "top bottom",
          end: "center center",
          interval: 0.8,
          batchMax: 3,

          onEnter: (elements) => {
            gsap.from(elements, {
              autoAlpha: 0,
              y: 100,
              ease: "power2.inOut",
              duration: 1.2,
            });
          },
        });

        gsap.from(".must-have", {
          autoAlpha: 0,
          y: 150,
          duration: 1,
          ease: "power1.inOut",
          scrollTrigger: {
            trigger: ".musthave-section",
            start: "100px bottom",
            end: "center 300px",
            toggleActions: "restart none play none",
          },
        });

        gsap.from(".form-details", {
          autoAlpha: 0,
          y: 150,
          duration: 1,
          ease: "power1.inOut",
          scrollTrigger: {
            trigger: ".formdetails-section",
            start: "100px bottom",
            end: "center 300px",
            toggleActions: "restart none play none",
          },
        });

        gsap.from(".final-card", {
          autoAlpha: 0,
          y: 150,
          duration: 1,
          ease: "power1.inOut",
          scrollTrigger: {
            trigger: ".final-section",
            start: "100px bottom",
            end: "center 300px",
            toggleActions: "restart none play none",
          },
        });
      });
      return () => context.revert();
    }
  }, [isPendingSingleSavedTrip]);

  useIsomorphicLayoutEffect(() => {
    if (
      !isPendingSingleSavedTrip &&
      !isPendingWeather &&
      !isPendingDailyForecast &&
      weatherData &&
      dailyForecastData
    ) {
      gsap.registerPlugin(ScrollTrigger);
      const context = gsap.context(() => {
        gsap.from(".weather-card", {
          autoAlpha: 0,
          y: 300,
          duration: 1,
          scrollTrigger: {
            trigger: ".weather-section",
            start: "-150px center",
            end: "center 300px",
            toggleActions: "restart none play none",
          },
        }),
          gsap.from(".forecast-card", {
            autoAlpha: 0,
            y: 300,
            duration: 1,
            scrollTrigger: {
              trigger: ".forecast-section",
              start: "-150px center",
              end: "center 300px",
              toggleActions: "restart none play none",
            },
          });
      });
      return () => context.revert();
    }
  }, [
    isPendingSingleSavedTrip,
    isPendingWeather,
    isPendingDailyForecast,
    weatherData,
    dailyForecastData,
  ]);

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
