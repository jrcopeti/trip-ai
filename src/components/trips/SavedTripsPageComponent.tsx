"use client";
import { useEffect, useLayoutEffect } from "react";
import { useWeather } from "@/hooks/useWeather";
import { useSingleSavedTrip } from "@/hooks/useSingleSavedTrip";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import WeatherSection from "./WeatherSection";
import ObjectsSection from "./ObjectsSection";
import ToursSection from "./ToursSection";
import DescriptionSection from "./DescriptionSection";
import TitleSection from "./TitleSection";
import PackReadySection from "./PackReadySection";
import MustHaveSection from "./MustHaveSection";
import FormDetailsSection from "./FormDetailsSection";
import FinalSection from "./FinalSection";
import GradientBg from "../ui/GradientBg";
import Container from "../ui/Container";
import Loader from "../ui/Loader";
import ButtonBackOutlined from "../ui/ButtonBackOutlined";
import { notFound } from "next/navigation";
import NotFoundComponent from "../ui/NotFoundComponent";

function SavedTripsPageComponent({
  params,
}: {
  params: { id: number | string };
}) {
  const { trip, isPendingSingleSavedTrip } = useSingleSavedTrip({ params });

  const { isPendingWeather, weatherData } = useWeather();

  useEffect(() => {
    (async () => {
      const LocomotiveScroll = (await import("locomotive-scroll" as any))
        .default;
      const locomotiveScroll = new LocomotiveScroll({
        lenisOptions: {
          lerp: 0.15,
        },
      });
    })();
  }, []);

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
    if (!isPendingSingleSavedTrip && !isPendingWeather && weatherData) {
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
        });
      });
      return () => context.revert();
    }
  }, [isPendingSingleSavedTrip, isPendingWeather, weatherData]);

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
        {trip && <TitleSection trip={trip} />}
      </Container>

      {/* Section 2 */}

      <Container
        overflow="overflow-hidden"
        animationClass="description-section"
      >
        <GradientBg from="from-neptune-200" to="to-shark-100" />
        {trip && <DescriptionSection trip={trip} />}
      </Container>

      {/* Section 3 */}

      <Container overflow="overflow-hidden" animationClass="tours-section">
        <GradientBg from="from-shark-100" to="to-yellorange-100" />
        {trip && <ToursSection trip={trip} />}
      </Container>

      {/* Section 4 */}

      <Container overflow="overflow-hidden" animationClass="pack-section">
        <GradientBg from="from-yellorange-100" to="to-shark-100" />
        {trip && <PackReadySection trip={trip} />}
      </Container>

      {/* Section 5 */}

      <Container overflow="overflow-hidden" animationClass="objects-section">
        <GradientBg from="from-shark-100" to="to-cabaret-100" />
        {trip && <ObjectsSection trip={trip} />}
      </Container>

      {/* Section 6 */}

      <Container overflow="overflow-hidden" animationClass="musthave-section">
        <GradientBg from="from-cabaret-100" to="to-shark-100" />
        {trip && <MustHaveSection trip={trip} />}
      </Container>

      {/* Section 7 */}

      <Container overflow="overflow-hidden" animationClass="weather-section">
        <GradientBg from="from-shark-100" to="to-violay-200" />
        {trip && <WeatherSection trip={trip} />}
      </Container>

      {/* Section 8 */}

      <Container
        overflow="overflow-hidden"
        animationClass="formdetails-section"
      >
        <GradientBg from="from-violay-200" to="to-shark-100" />
        {trip && <FormDetailsSection trip={trip} />}
      </Container>

      {/* Section 9 */}

      <Container overflow="overflow-hidden" animationClass="final-section">
        <GradientBg from="from-shark-100" to="to-neptune-200" />
        {trip && <FinalSection trip={trip} />}
      </Container>
    </>
  );
}

export default SavedTripsPageComponent;
