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
import geopattern from "@/assets/geopattern.png";
import geopattern2 from "@/assets/geopattern2.png";
import geopattern3 from "@/assets/geopattern3.png";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import WeatherSection from "./ui/trip/WeatherSection";
import ObjectsSection from "./ui/trip/ObjectsSection";
import ToursSection from "./ui/trip/ToursSection";
import DescriptionSection from "./ui/trip/DescriptionSection";
import TitleSection from "./ui/trip/TitleSection";
import PackReadySection from "./ui/trip/PackReadySection";
import { notFound } from "next/navigation";

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

  // RIGHT HERE
  // useIsomorphicLayoutEffect(() => {
  //   if (!isPending) {
  //     const innerHeight = window.innerHeight;

  //     const getRatio = (el: HTMLElement) =>
  //       innerHeight / (innerHeight + el.offsetHeight);

  //     gsap.utils.toArray("section").forEach((section, i) => {
  //       if (section instanceof HTMLElement) {
  //         const bg = section.querySelector('[data-bg="true"]');

  //         gsap.fromTo(
  //           bg,
  //           {
  //             backgroundPosition: () =>
  //               i ? `50% ${-innerHeight * getRatio(section)}px` : "50% 0px",
  //           },
  //           {
  //             backgroundPosition: () =>
  //               `100% ${innerHeight * (1 - getRatio(section))}px`,
  //             ease: "none",
  //             scrollTrigger: {
  //               trigger: bg,

  //               start: () => (i ? "top bottom" : "top top"),
  //               end: "bottom top",
  //               scrub: true,
  //               invalidateOnRefresh: true,
  //             },
  //           },
  //         );
  //       }
  //     });
  //   }

  //   return () => {
  //     ScrollTrigger.getAll().forEach((st) => st.kill());
  //   };
  // }, [isPending]);

  useIsomorphicLayoutEffect(() => {
    if (!isPending) {
      const context = gsap.context(() => {
        gsap.from(".trip-description", {
          autoAlpha: 0,
          y: 100,
          duration: 1,
          scrollTrigger: {
            trigger: ".trip-description",
            start: "top bottom",
            end: "center 300px",

            toggleActions: "restart none none none",
          },
        });

        gsap.from(".title-tours", {
          autoAlpha: 0,
          x: -200,

          scrollTrigger: {
            trigger: ".tours-section",
            start: "top bottom",
            end: "center 300px",

            scrub: 1,
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
            toggleActions: "restart none none none",
          },
        });

        ScrollTrigger.batch(".objects-list", {
          start: "top bottom",
          end: "center center",

          onEnter: (elements) => {
            gsap.from(elements, {
              autoAlpha: 0,
              y: 100,
              stagger: 0.4,
              ease: "power2.in",
              duration: 1.0,
            });
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
            end: "center center",
            toggleActions: "restart none none none",
            markers: true,
          },
        });
      });
      return () => context.revert();
    }
  }, [isPending, isPendingWeather, weatherData]);

  if (isPending) {
    return <div>Loading single trip...</div>;
  }

  const formattedStartDate = dayjs(trip?.startDate).format("DD MMM YYYY");
  const formattedEndDate = dayjs(trip?.endDate).format("DD MMM YYYY");

  return (
    <>
      <>
        {/* Section 1 */}
        <section className="relative flex h-screen items-center justify-center overflow-x-hidden">
          <div
            data-bg="true"
            className="absolute left-0 top-0 -z-10 h-full w-full bg-center bg-repeat brightness-75"
            style={{ backgroundImage: `url(${geopattern.src})` }}
          ></div>
          {trip && <TitleSection trip={trip} />}
        </section>

        {/* Section 2 */}

        <section
          data-bg="true"
          className=" relative flex h-screen items-center justify-center overflow-x-hidden"
        >
          <div
            data-bg="true"
            className="absolute left-0 top-0 -z-10 h-full w-full bg-cover bg-center  brightness-75"
            style={{ backgroundImage: `url(${trip?.image2})` }}
          ></div>

          {trip && <DescriptionSection trip={trip} />}
        </section>

        {/* Section 3 */}

        <section
          data-bg="true"
          className=" tours-section relative flex h-screen items-center justify-center overflow-x-hidden"
        >
          <div
            data-bg="true"
            className="absolute left-0 top-0 -z-10 h-full w-full bg-cover bg-center bg-no-repeat brightness-75"
            style={{ backgroundImage: `url(${trip?.image4})` }}
          ></div>

          {trip && <ToursSection trip={trip} />}
        </section>

        {/* Section 4 */}

        <section className="pack-section relative flex h-screen items-center justify-center">
          <div
            data-bg="true"
            className="absolute left-0 top-0 -z-10 h-full w-full brightness-75"
            style={{ backgroundImage: `url(${image4.src})` }}
          ></div>
          {trip && <PackReadySection trip={trip} />}
        </section>

        {/* Section 4 */}

        <section
          data-bg="true"
          className="objects-section relative flex h-screen items-center justify-center"
        >
          <div
            data-bg="true"
            className="absolute left-0 top-0 -z-10 h-full w-full bg-cover bg-center bg-no-repeat brightness-75"
            style={{ backgroundImage: `url(${image7.src})` }}
          ></div>
          {trip && <ObjectsSection trip={trip} />}
        </section>

        {/* Section 5 */}

        <section
          data-bg="true"
          className="weather-section relative flex h-screen items-center justify-center"
        >
          <div
            data-bg="true"
            className="absolute left-0 top-0 -z-10 h-full w-full brightness-75"
            style={{ backgroundImage: `url(${geopattern3.src})` }}
          ></div>

          {trip && <WeatherSection trip={trip} isPending={isPending} />}
        </section>

        {/* Section 6 */}
        <section
          data-bg="true"
          className="relative flex h-screen items-center justify-center"
        >
          <div
            data-bg="true"
            className="absolute left-0 top-0 -z-10 h-full w-full  bg-cover bg-center brightness-75"
            style={{ backgroundImage: `url(${trip?.image3})` }}
          ></div>
          <h1 className="font-gallery-100 text-3xl">6</h1>
        </section>

        {/* Section 7 */}

        <section
          data-bg="true"
          className=" relative flex h-screen items-center justify-center"
        >
          <div
            data-bg="true"
            className="absolute left-0 top-0 -z-10 h-full w-full bg-repeat brightness-75"
            style={{ backgroundImage: `url(${geopattern2.src})` }}
          ></div>
          <h1 className="font-gallery-100 text-3xl">7</h1>
        </section>

        {/* Section 8 */}

        <section
          data-bg="true"
          className="relative flex h-screen items-center justify-center"
        >
          <div
            data-bg="true"
            className="absolute left-0 top-0 -z-10 h-full w-full bg-cover bg-center bg-no-repeat brightness-75"
            style={{ backgroundImage: `url(${image6.src})` }}
          ></div>
          <h1 className="font-gallery-100 text-3xl">8</h1>
        </section>

        {/* Section 9 */}

        <section
          data-bg="true"
          className="relative flex h-screen items-center justify-center"
        >
          <div
            data-bg="true"
            className="absolute left-0 top-0 -z-10 h-full w-full bg-cover bg-center bg-no-repeat brightness-75"
            style={{ backgroundImage: `url(${image1.src})` }}
          ></div>
          <h1 className="font-gallery-100 text-3xl">8</h1>
        </section>
      </>
    </>
  );
}

export default SavedTripsPageComponent;

{
  /* <div>
        Saved Trips Page {params.id}
        <div>
          {isPending && <div>Loading single trip...</div>}

          <div className="grid grid-cols-3">
            <div>{trip?.userName}</div>
            <div>{trip?.city}</div>
            <div>{trip?.country}</div>
            <div>{formattedStartDate}</div>
            <div>{formattedEndDate}</div>
            <div>{trip?.luggageSize}</div>
            <div>{trip?.accommodation}</div>
            {(trip?.requiredItems as string[])?.map((item: string) => (
              <ul className="text-violay-600" key={item}>
                <li>{item}</li>
              </ul>
            ))}

            {(trip?.interests as string[])?.map((interest: string) => (
              <ul className="text-neptune-500" key={interest}>
                <li>{interest}</li>
              </ul>
            ))}

            <div> {trip?.note}</div>
            <div>{trip?.budget}</div>
            <div>
              <Image src={trip?.flagUrl} alt="flag" width={50} height={50} />{" "}
            </div>

            <div>
              <Image src={trip?.imageUrl} alt="flag" width={400} height={300} />{" "}
            </div>

            <div> title: {trip?.title}</div>
            <div className="text-deeporange-500">
              description: {trip?.description}
            </div>
          </div>

          {(trip?.objectsList as any)?.map((object: any) => (
            <ul key={object.item}>
              <li>{object.quantity}</li>
              <li>{object.item}</li>
              <li>{object.description}</li>
            </ul>
          ))}

          {(trip?.mustHave as string[])?.map((mustHave) => (
            <ul key={mustHave}>
              <li>{mustHave}</li>
            </ul>
          ))}
          {(trip?.tours as string[])?.map((tour) => (
            <ul key={tour}>
              <li>{tour}</li>
            </ul>
          ))}
        </div>
      </div> */
}
