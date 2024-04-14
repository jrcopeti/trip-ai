"use client";
import { useEffect, useLayoutEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { getSingleSavedTrip } from "@/db/actions";
import { useWeather } from "@/hooks/useWeather";

import dayjs from "dayjs";
import image1 from "@/assets/1.jpg";
import image2 from "@/assets/2.jpg";
import image3 from "@/assets/3.jpg";
import image4 from "@/assets/4.jpg";
import image5 from "@/assets/5.jpg";
import image6 from "@/assets/6.jpeg";
import image7 from "@/assets/7.jpg";
import image8 from "@/assets/8.jpg";
import plane from "@/assets/plane.png";
import geopattern from "@/assets/geopattern.png";
import geopattern2 from "@/assets/geopattern2.png";
import geopattern3 from "@/assets/geopattern3.png";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import WeatherSection from "./ui/WeatherSection";
import ObjectsSection from "./ui/ObjectsSection";
import ToursSection from "./ui/ToursSection";
import DescriptionSection from "./ui/DescriptionSection";
import TitleSection from "./ui/TitleSection";
import PackReadySection from "./ui/PackReadySection";
import { notFound } from "next/navigation";
import MustHaveSection from "./ui/MustHaveSection";
import FormDetailsSection from "./ui/FormDetailsSection";
import FinalSection from "./ui/FinalSection";

gsap.registerPlugin(ScrollTrigger);

function SavedTripsPageComponent({
  params,
}: {
  params: { id: number | string };
}) {
  const {
    data: trip,
    isPending,
    error,
  } = useQuery({
    queryKey: ["trips", params.id],
    queryFn: () => getSingleSavedTrip(Number(params.id)),
  });

  const { isPendingWeather, weatherData } = useWeather();

  console.log("isPending:", isPending);

  console.log("trip city:", trip?.city);
  console.log("trip country:", trip?.country);

  const useIsomorphicLayoutEffect =
    typeof window !== "undefined" ? useLayoutEffect : useEffect;

  useIsomorphicLayoutEffect(() => {
    if (!isPending) {
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
  }, [isPending]);

  useIsomorphicLayoutEffect(() => {
    if (!isPending && !isPendingWeather && weatherData) {
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
  }, [isPending, isPendingWeather, weatherData]);

  if (isPending) {
    return <div>Loading single trip...</div>;
  }

  return (
    <>
      {/* Section 1 */}
      <section className="relative flex h-screen items-center justify-center overflow-x-hidden">
        <div className="absolute left-0 top-0 -z-10 h-full w-full bg-gradient-to-b from-gallery-100  to-violay-200  bg-cover bg-center   "></div>
        {trip && <TitleSection trip={trip} imageData={null} />}
      </section>

      {/* Section 2 */}

      <section className="description-section relative flex h-screen items-center justify-center overflow-x-hidden ">
        <div className="absolute left-0 top-0 -z-10 h-full w-full bg-gradient-to-b from-violay-200 to-gallery-50 bg-cover bg-center  "></div>

        {trip && <DescriptionSection trip={trip} imageData={null} />}
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
        <div
          className="absolute left-0 top-0 -z-10 h-full w-full bg-gradient-to-b from-gallery-100  to-cabaret-100 "
          // style={{ backgroundImage: `url(${image7.src})` }}
        ></div>
        {trip && <ObjectsSection trip={trip} />}
      </section>

      {/* Section 5 */}

      <section className=" musthave-section relative flex h-screen items-center justify-center overflow-x-hidden">
        <div className="absolute left-0 top-0 -z-10 h-full w-full bg-gradient-to-b from-cabaret-100 to-gallery-100  "></div>
        {trip && <MustHaveSection trip={trip} imageData={null} />}
      </section>

      {/* Section 6 */}
      <section className=" weather-section relative flex h-screen items-center justify-center overflow-x-hidden">
        <div className="absolute left-0 top-0 -z-10 h-full w-full bg-gradient-to-b from-gallery-100 to-yellorange-100 "></div>
        {trip && <WeatherSection trip={trip} isPending={isPending} />}
      </section>

      {/* Section 7 */}

      <section className="formdetails-section relative flex h-screen items-center justify-center overflow-x-hidden">
        <div className="absolute left-0 top-0 -z-10 h-full w-full  bg-gradient-to-b from-yellorange-100 to-gallery-100  "></div>
        {trip && (
          <FormDetailsSection trip={trip} imageData={null} formData={null} />
        )}
      </section>

      {/* Section 8 */}

      <section className="final-section relative flex h-screen items-center justify-center overflow-x-hidden">
        <div className="absolute left-0 top-0 -z-10 h-full w-full bg-gradient-to-b from-gallery-100 to-deeporange-100"></div>
        {trip && <FinalSection trip={trip} />}
      </section>
    </>
  );
}

export default SavedTripsPageComponent;
