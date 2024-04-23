"use client";
import { useEffect, useLayoutEffect } from "react";
import { notFound, usePathname } from "next/navigation";

import { useImage } from "@/hooks/useImage";
import { useFormData } from "@/hooks/useFormData";
import { useTripResponse } from "@/hooks/useTripResponse";
import { useWeather } from "@/hooks/useWeather";
import { useCreateTrip } from "@/hooks/useCreateTrip";

import { Prisma } from "@prisma/client";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import FormDetailsSection from "./ui/FormDetailsSection";
import TitleSection from "./ui/TitleSection";
import DescriptionSection from "./ui/DescriptionSection";
import ToursSection from "./ui/ToursSection";
import PackReadySection from "./ui/PackReadySection";
import ObjectsSection from "./ui/ObjectsSection";
import MustHaveSection from "./ui/MustHaveSection";
import WeatherSection from "./ui/WeatherSection";
import SaveSection from "./ui/SaveSection";
import GradientBg from "./ui/GradientBg";
import Container from "./ui/Container";
import Loader from "./ui/Loader";

function TripResponse() {
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

  const { createTrip, isCreatingTrip, createTripError } = useCreateTrip();
  const pathname = usePathname();
  const tripUrl = pathname.replace("/trips/", "");

  const { tripData: trip, isPendingResponseAI } = useTripResponse();
  const { formData } = useFormData();
  const { isPendingWeather, weatherData } = useWeather();
  const { imageData } = useImage();

  const handleYesAnswer = () => {
    const saved = true;
    const finalData = {
      ...trip,
      ...formData,
      startDate: new Date(formData.startDate),
      endDate: new Date(formData.endDate),
      image: imageData?.tripImage ?? null,
      image2: imageData?.tripImage2 ?? null,
      image3: imageData?.tripImage3 ?? null,
      image4: imageData?.tripImage4 ?? null,
      image5: imageData?.tripImage5 ?? null,
      placeholder: imageData?.placeholder ?? null,
      tripUrl,
      saved,
    };

    createTrip(finalData as Prisma.TripCreateInput);
  };

  const handleNoAnswer = () => {
    const finalData = {
      ...trip,
      ...formData,
      startDate: new Date(formData.startDate),
      endDate: new Date(formData.endDate),
      image: imageData?.tripImage ?? null,
      image2: imageData?.tripImage2 ?? null,
      image3: imageData?.tripImage3 ?? null,
      image4: imageData?.tripImage4 ?? null,
      image5: imageData?.tripImage5 ?? null,
      tripUrl,
      saved: false,
    };
    createTrip(finalData as Prisma.TripCreateInput);
  };

  const useIsomorphicLayoutEffect =
    typeof window !== "undefined" ? useLayoutEffect : useEffect;

  useIsomorphicLayoutEffect(() => {
    if (!isPendingResponseAI) {
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
  }, [isPendingResponseAI]);

  useIsomorphicLayoutEffect(() => {
    if (!isPendingResponseAI && !isPendingWeather && weatherData) {
      gsap.registerPlugin(ScrollTrigger);
      const context = gsap.context(() => {
        gsap.from(".weather-card", {
          autoAlpha: 0,
          y: 200,
          duration: 1,
          scrollTrigger: {
            trigger: ".weather-section",
            start: "top center",
            end: "center 300px",
            toggleActions: "restart none play none",
          },
        });
      });
      return () => context.revert();
    }
  }, [isPendingResponseAI, isPendingWeather, weatherData]);

  if (isPendingResponseAI) {
    return <Loader />;
  }
  console.log("trip", trip);
  console.log("imageData", imageData);
  if (!trip) {
    // if (!trip || !trip.city || !trip.country || !trip.userName || !trip.title || !trip.objectsList || !trip.mustHave || !trip.description || !trip.tours || !trip.requiredItems) {
    notFound();
  }

  return (
    <>
      {/* Section 1 */}
      <Container overflow="overflow-x-hidden">
        <GradientBg from="from-gallery-100" to="to-violay-200" />
        {trip && <TitleSection trip={trip} imageData={imageData} />}
      </Container>

      {/* Section 2 */}

      <Container
        overflow="overflow-x-hidden"
        animationClass="description-section"
      >
        <GradientBg from="from-violay-200" to="to-gallery-100" />
        {trip && <DescriptionSection trip={trip} imageData={imageData} />}
      </Container>

      {/* Section 3 */}

      <Container overflow="overflow-x-hidden" animationClass="tours-section">
        <GradientBg from="from-gallery-100" to="to-neptune-200" />
        {trip && <ToursSection trip={trip} />}
      </Container>

      {/* Section 4 */}

      <Container overflow="overflow-x-hidden" animationClass="pack-section">
        <GradientBg from="from-neptune-200" to="to-gallery-100" />
        {trip && <PackReadySection trip={trip} />}
      </Container>

      {/* Section 5 */}

      <Container overflow="overflow-x-hidden" animationClass="objects-section">
        <GradientBg from="from-gallery-100" to="to-cabaret-100" />
        {trip && <ObjectsSection trip={trip} />}
      </Container>

      {/* Section 6 */}

      <Container overflow="overflow-x-hidden" animationClass="musthave-section">
        <GradientBg from="from-cabaret-100" to="to-gallery-100" />
        {trip && <MustHaveSection trip={trip} imageData={imageData} />}
      </Container>

      {/* Section 7 */}
      <Container overflow="overflow-x-hidden" animationClass="weather-section">
        <GradientBg from="from-gallery-100" to="to-yellorange-100" />
        {trip && <WeatherSection trip={trip} />}
      </Container>

      {/* Section 8 */}

      <Container
        overflow="overflow-x-hidden"
        animationClass="formdetails-section"
      >
        <GradientBg from="from-yellorange-100" to="to-gallery-100" />
        {trip && formData && (
          <FormDetailsSection
            trip={trip}
            imageData={imageData}
            formData={formData}
          />
        )}
      </Container>

      {/* Section 9 */}

      <Container overflow="overflow-x-hidden" animationClass="final-section">
        <GradientBg from="from-gallery-100" to="to-deeporange-100" />
        <SaveSection
          handleYesAnswer={handleYesAnswer}
          handleNoAnswer={handleNoAnswer}
          imageData={imageData}
        />
      </Container>
    </>
  );
}

export default TripResponse;
