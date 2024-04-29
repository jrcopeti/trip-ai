"use client";
import { useEffect, useLayoutEffect, useState } from "react";
import { notFound, usePathname } from "next/navigation";

import { useImage } from "@/hooks/useImage";
import { useFormData } from "@/hooks/useFormData";
import { useTripResponse } from "@/hooks/useTripResponse";
import { useWeather } from "@/hooks/useWeather";
import { useCreateTrip } from "@/hooks/useCreateTrip";
import { useConfirmOnPageExit } from "@/hooks/useConfirmonPageExit";

import { Prisma } from "@prisma/client";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import toast from "react-hot-toast";

import FormDetailsSection from "./FormDetailsSection";
import TitleSection from "./TitleSection";
import DescriptionSection from "./DescriptionSection";
import ToursSection from "./ToursSection";
import PackReadySection from "./PackReadySection";
import ObjectsSection from "./ObjectsSection";
import MustHaveSection from "./MustHaveSection";
import WeatherSection from "./WeatherSection";
import SaveSection from "./SaveSection";
import GradientBg from "../ui/GradientBg";
import Container from "../ui/Container";
import Loader from "../ui/Loader";
import NotFoundComponent from "../ui/NotFoundComponent";
import ErrorToaster from "../ui/ErrorToaster";
import CustomToaster from "../ui/CustomToaster";

function TripResponse() {
  const [isSaved, setIsSaved] = useState(false);

  useConfirmOnPageExit(isSaved);

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
      saved: true,
    };

    createTrip(finalData as Prisma.TripCreateInput, {
      onSuccess: () => {
        setIsSaved(true);
        toast.custom(<CustomToaster message="Your trip was saved" />);
      },
    });
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
    createTrip(finalData as Prisma.TripCreateInput, {
      onSuccess: () => {
        setIsSaved(true);
        toast.custom(<ErrorToaster message="Trip not saved" />);
      },
    });
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
            start: "-150px center",
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
  console.log("formData", formData);
  console.log("title", trip?.title);

  if (trip === null) {
    return (
      <NotFoundComponent
        message="There was an error generating the trip. Please try again."
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
        {trip && <TitleSection trip={trip} imageData={imageData} />}
      </Container>

      {/* Section 2 */}

      <Container
        overflow="overflow-hidden"
        animationClass="description-section"
      >
        <GradientBg from="from-neptune-200" to="to-shark-100" />
        {trip && <DescriptionSection trip={trip} imageData={imageData} />}
      </Container>

      {/* Section 3 */}

      <Container overflow="overflow-hidden" animationClass="tours-section">
        <GradientBg from="from-shark-100" to="to-yellorange-100" />
        {trip && <ToursSection trip={trip} />}
      </Container>

      {/* Section 4 */}

      <Container overflow="overflow-hidden" animationClass="pack-section">
        <GradientBg from="from-yellorange-100" to="to-shark-100" />
        {trip && <PackReadySection trip={trip} formData={formData} />}
      </Container>

      {/* Section 5 */}

      <Container overflow="overflow-hidden" animationClass="objects-section">
        <GradientBg from="from-shark-100" to="to-cabaret-100" />
        {trip && <ObjectsSection trip={trip} />}
      </Container>

      {/* Section 6 */}

      <Container overflow="overflow-hidden" animationClass="musthave-section">
        <GradientBg from="from-cabaret-100" to="to-shark-100" />
        {trip && <MustHaveSection trip={trip} imageData={imageData} />}
      </Container>

      {/* Section 7 */}
      <Container overflow="overflow-hidden" animationClass="weather-section">
        <GradientBg from="from-shark-100" to="to-violay-200" />
        {trip && <WeatherSection trip={trip} formData={formData} />}
      </Container>

      {/* Section 8 */}

      <Container
        overflow="overflow-hidden"
        animationClass="formdetails-section"
      >
        <GradientBg from="from-violay-200" to="to-shark-100" />
        {trip && formData && (
          <FormDetailsSection
            trip={trip}
            imageData={imageData}
            formData={formData}
          />
        )}
      </Container>

      {/* Section 9 */}

      <Container overflow="overflow-hidden" animationClass="final-section">
        <GradientBg from="from-shark-100" to="to-neptune-200" />
        {trip && (
          <SaveSection
            handleYesAnswer={handleYesAnswer}
            handleNoAnswer={handleNoAnswer}
            imageData={imageData}
            trip={trip}
            isCreatingTrip={isCreatingTrip}
            isSaved={isSaved}
          />
        )}
      </Container>
    </>
  );
}

export default TripResponse;
