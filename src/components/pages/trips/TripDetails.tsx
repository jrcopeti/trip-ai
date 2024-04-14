"use client";
import { createTripInDB } from "@/db/actions";
import { useImage } from "@/hooks/useImage";
import { useFormData } from "@/hooks/useFormData";
import { useTrip } from "@/hooks/useTrip";
import { useMutation } from "@tanstack/react-query";
import { notFound } from "next/navigation";
import { Trip } from "@prisma/client";
import { Prisma } from "@prisma/client";
import { useWeather } from "@/hooks/useWeather";
import { useCallback, useEffect, useLayoutEffect } from "react";
import FormDetailsSection from "../saved-trips/ui/FormDetailsSection";
import TitleSection from "../saved-trips/ui/TitleSection";
import DescriptionSection from "../saved-trips/ui/DescriptionSection";
import ToursSection from "../saved-trips/ui/ToursSection";
import PackReadySection from "../saved-trips/ui/PackReadySection";
import ObjectsSection from "../saved-trips/ui/ObjectsSection";
import MustHaveSection from "../saved-trips/ui/MustHaveSection";
import WeatherSection from "../saved-trips/ui/WeatherSection";
import SaveSection from "./ui/SaveSection";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Image from "next/image";
import image5 from "@/assets/5.jpg";
import { Button } from "@nextui-org/react";

gsap.registerPlugin(ScrollTrigger);

function TripDetails() {
  const {
    mutate: createTrip,
    isPending: isCreatingTrip,
    error: createTripError,
  } = useMutation({
    mutationKey: ["trips"],
    mutationFn: (data: Prisma.TripCreateInput) => createTripInDB(data),

    onSuccess: () => {
      console.log("success createTrip ");
      alert("Trip created successfully");
    },
    onError: (error) => {
      console.log(error);
    },
  });

  const { tripData: trip, isPendingResponseAI, errorResponseAI } = useTrip();
  const { formData } = useFormData();
  const { isPendingWeather, weatherData } = useWeather();
  const { imageData, isPendingImage } = useImage();
  console.log("Form Data in Trip", formData);
  console.log("trip Data in Trip", trip);

  const handleYesAnswer = () => {
    console.log("formDataYEScalled");
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
      saved,
    };
    console.log("finalDataYES", finalData);

    createTrip(finalData as Prisma.TripCreateInput);
  };

  const handleNoAnswer = () => {
    console.log("formDataNOcalled");
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

        gsap.from(".pack-ready", {
          autoAlpha: 0,
          y: 100,
          duration: 1,
          scrollTrigger: {
            trigger: ".pack-section",
            start: "top center",
            end: "center 300px",
            toggleActions: "restart none play none",
          },
        });

        gsap.from(".stamps", {
          autoAlpha: 0,

          duration: 1,
          scrollTrigger: {
            trigger: ".stamps",
            // start: "0px 300px",
            // end: "400px 400px",
            start: "250px bottom",
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
              // stagger: 0.2,
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

  if (isPendingImage) {
    return <div>Loading image...</div>;
  }

  if (!trip) {
    notFound();
  }

  return (
    <>
      {/* Section 1 */}
      <section className="relative flex h-screen items-center justify-center overflow-x-hidden">
        <div className="absolute left-0 top-0 -z-10 h-full w-full bg-gradient-to-b from-gallery-100  to-violay-200  bg-cover bg-center   "></div>
        {trip && imageData && (
          <TitleSection trip={trip} imageData={imageData} />
        )}
      </section>

      {/* Section 2 */}

      <section className="description-section relative flex h-screen items-center justify-center overflow-x-hidden ">
        <div className="absolute left-0 top-0 -z-10 h-full w-full bg-gradient-to-b from-violay-200 to-gallery-50 bg-cover bg-center  "></div>

        {trip && imageData && (
          <DescriptionSection trip={trip} imageData={imageData} />
        )}
      </section>

      {/* Section 3 */}

      <section className=" tours-section relative flex h-screen items-center justify-center overflow-x-hidden">
        <div className="absolute left-0 top-0 -z-10 h-full w-full bg-gradient-to-b from-gallery-50 to-neptune-200 bg-cover bg-center   "></div>

        {trip && <ToursSection trip={trip} />}
      </section>

      {/* Section 4 */}

      <section className="pack-section relative flex h-screen items-center justify-center overflow-x-hidden">
        <div className="absolute left-0 top-0 -z-10 h-full w-full  bg-gradient-to-b from-neptune-200  to-gallery-100 "></div>
        {trip && <PackReadySection trip={trip} />}
      </section>

      {/* Section 4 */}

      <section className="objects-section relative flex h-screen items-center justify-center overflow-x-hidden">
        <div className="absolute left-0 top-0 -z-10 h-full w-full bg-gradient-to-b from-gallery-100  to-cabaret-100 "></div>
        {trip && <ObjectsSection trip={trip} />}
      </section>

      {/* Section 5 */}

      <section className=" musthave-section relative flex h-screen items-center justify-center overflow-x-hidden">
        <div className="absolute left-0 top-0 -z-10 h-full w-full bg-gradient-to-b from-cabaret-100 to-gallery-100  "></div>
        {trip && imageData && (
          <MustHaveSection trip={trip} imageData={imageData} />
        )}
      </section>

      {/* Section 6 */}
      <section className=" weather-section relative flex h-screen items-center justify-center overflow-x-hidden">
        <div className="absolute left-0 top-0 -z-10 h-full w-full bg-gradient-to-b from-gallery-100 to-yellorange-100 "></div>
        {trip && <WeatherSection trip={trip} isPending={isPendingResponseAI} />}
      </section>

      {/* Section 7 */}

      <section className="formdetails-section relative flex h-screen items-center justify-center overflow-x-hidden">
        <div className="absolute left-0 top-0 -z-10 h-full w-full  bg-gradient-to-b from-yellorange-100 to-gallery-100  "></div>
        {trip && imageData && formData && (
          <FormDetailsSection
            trip={trip}
            imageData={imageData}
            formData={formData}
          />
        )}
      </section>

      {/* Section 8 */}

      <section className="final-section relative flex h-screen items-center justify-center overflow-x-hidden">
        <div className="absolute left-0 top-0 -z-10 h-full w-full bg-gradient-to-b from-gallery-100 to-deeporange-100"></div>
        <SaveSection
          handleYesAnswer={handleYesAnswer}
          handleNoAnswer={handleNoAnswer}
          imageData={imageData}
        />
      </section>
    </>
  );
}

export default TripDetails;
