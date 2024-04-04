"use client";

import { getSingleSavedTrip } from "@/db/actions";
import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import Image from "next/image";
import { useEffect, useLayoutEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/all";
import image1 from "@/assets/1.jpg";
import image2 from "@/assets/2.jpg";
import image3 from "@/assets/3.jpg";
import image4 from "@/assets/4.jpg";
import image5 from "@/assets/5.jpg";
import image6 from "@/assets/6.jpeg";
import image7 from "@/assets/7.jpg";
import geopattern from "@/assets/geopattern.png";
import geopattern2 from "@/assets/geopattern2.png";
import geopattern3 from "@/assets/geopattern3.png";
import { useWeather } from "@/hooks/useWeather";

function SavedTripsPageComponent({
  params,
}: {
  params: { id: number | string };
}) {
  const {
    data: trip,
    isPending,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["trips", params.id],
    queryFn: () => getSingleSavedTrip(Number(params.id)),
  });

  const { generateWeather, weatherData } = useWeather();

  useEffect(() => {
    if (!isPending) {
      generateWeather(trip?.city, trip?.country);
    }
  }, [isPending, generateWeather, trip?.city, trip?.country]);
  console.log("weatherData", weatherData);

  useLayoutEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    if (!isPending) {
      gsap.registerPlugin(ScrollTrigger);

      const innerHeight = window.innerHeight;

      const getRatio = (el) => innerHeight / (innerHeight + el.offsetHeight);

      gsap.utils.toArray("section").forEach((section, i) => {
        const bg = section.querySelector('[data-bg="true"]');
        console.log(bg, "bg", "i", i, section, "section");

        gsap.fromTo(
          bg,
          {
            backgroundPosition: () =>
              i ? `50% ${-innerHeight * getRatio(section)}px` : "50% 0px",
          },
          {
            backgroundPosition: () =>
              `100% ${innerHeight * (1 - getRatio(section))}px`,
            ease: "none",
            scrollTrigger: {
              trigger: section,

              start: () => (i ? "top bottom" : "top top"),
              end: "bottom top",
              scrub: true,
              invalidateOnRefresh: true,
            },
          },
        );
      });

      return () => {
        // Cleanup: Kill GSAP animations and ScrollTriggers
        ScrollTrigger.getAll().forEach((st) => st.kill());
        gsap.killTweensOf('[data-bg="true"]');
      };
    }
  }, [isPending]);

  if (isPending) {
    return <div>Loading single trip...</div>;
  }

  const formattedStartDate = dayjs(trip?.startDate).format("DD MMM YYYY");
  const formattedEndDate = dayjs(trip?.endDate).format("DD MMM YYYY");

  return (
    <>
      {/* <div>
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
      </div> */}

      <>
        {/* Section 1 */}
        <section className="relative flex h-screen items-center justify-center">
          <div
            data-bg="true"
            className="absolute left-0 top-0 -z-10 h-full w-full bg-center bg-repeat brightness-75"
            style={{ backgroundImage: `url(${geopattern.src})` }}
          ></div>
          <div className="absolute h-[90%] w-[90%] p-4 lg:h-[80%] lg:w-[80%] lg:p-12 ">
            <div className="grid grid-cols-1 gap-4 rounded-xl p-2 lg:grid-cols-[auto,auto] lg:p-4 ">
              <Image
                src={trip?.image}
                alt="city"
                width={500}
                height={500}
                blurDataURL={trip?.placeholder}
                placeholder="blur"
                priority
                className="rounded-xl shadow-lg"
              />

              <div className=" grid grid-cols-1 gap-4 rounded-md p-4  shadow-sm lg:grid-cols-[1fr,auto] lg:gap-8">
                <h1 className=" text-3xl font-extrabold text-shark-950 md:text-5xl">
                  {trip?.title}
                </h1>
                <p className="  text-lg font-bold text-shark-950 lg:text-2xl">
                  {trip?.description}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Section 2 */}

        <section
          data-bg="true"
          className="relative flex h-screen items-center justify-center"
        >
          <div
            data-bg="true"
            className="absolute left-0 top-0 -z-10 h-full w-full bg-cover bg-center bg-no-repeat brightness-75"
            style={{ backgroundImage: `url(${trip?.image2})` }}
          ></div>

          <div className="absolute h-[90%] w-[90%] p-4 backdrop-blur-md lg:h-[80%] lg:w-[80%] lg:p-12">
            <div className="grid grid-cols-1 items-center gap-4 rounded-xl  p-2 lg:p-4 xl:grid-cols-[1fr,auto]  ">
              <h1 className=" rounded-xl  bg-shark-100/50 p-4 text-3xl font-extrabold capitalize text-shark-950 md:text-5xl">
                Your suggested tours in {trip?.city}
              </h1>
              <div className=" grid grid-cols-1 gap-4 rounded-md p-4 lg:gap-8">
                {(trip?.tours as string[])?.map((tour) => (
                  <ul className="grid grid-cols-1" key={tour}>
                    <li className=" text-lg  font-semibold text-shark-200 lg:text-2xl xl:text-3xl ">
                      {tour}
                    </li>
                  </ul>
                ))}
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 justify-items-center gap-x-4 gap-y-8 rounded-xl p-2 lg:grid-cols-[auto,auto] lg:gap-x-10 lg:gap-y-12 lg:p-4 "></div>
        </section>

        {/* Section 3 */}

        <section className="relative flex h-screen items-center justify-center">
          <div
            data-bg="true"
            className="absolute left-0 top-0 -z-10 h-full w-full brightness-75"
            style={{ backgroundImage: `url(${image4.src})` }}
          ></div>
          <h1 className=" text-4xl font-extrabold capitalize text-shark-200 md:text-6xl">
            We have your pack ready
          </h1>
        </section>

        {/* Section 4 */}

        <section className="relative flex h-screen items-center justify-center">
          <div
            data-bg="true"
            className="absolute left-0 top-0 -z-10 h-full w-full bg-cover bg-center bg-no-repeat brightness-75"
            style={{ backgroundImage: `url(${image7.src})` }}
          ></div>
          <div className="absolute h-[90%] w-[90%] p-4 lg:h-[80%] lg:w-[80%] lg:p-12 ">
            <div className=" jus grid grid-cols-2 items-center justify-items-center rounded-md p-4 lg:gap-8">
              {(trip?.objectsList as any)?.map((object: any) => (
                <ul
                  className="grid grid-cols-[1fr,1fr,2fr] items-baseline gap-y-8 font-semibold leading-loose lg:text-2xl "
                  key={object.item}
                >
                  <li className="text-violay-200  ">{object.quantity}</li>
                  <li className="text-shark-100">{object.item}</li>
                  <li className="text-shark-100">{object.description}</li>
                </ul>
              ))}
            </div>
          </div>
        </section>

        {/* Section 5 */}

        <section className="relative flex h-screen items-center justify-center">
          <div
            data-bg="true"
            className="absolute left-0 top-0 -z-10 h-full w-full brightness-75"
            style={{ backgroundImage: `url(${geopattern3.src})` }}
          ></div>
          <h1 className="font-gallery-100 text-3xl">5</h1>
        </section>

        {/* Section 6 */}
        <section className="relative flex h-screen items-center justify-center">
          <div
            data-bg="true"
            className="absolute left-0 top-0 -z-10 h-full w-full bg-cover bg-center brightness-75"
            style={{ backgroundImage: `url(${trip?.image3})` }}
          ></div>
          <h1 className="font-gallery-100 text-3xl">6</h1>
        </section>

        {/* Section 7 */}

        <section className="relative flex h-screen items-center justify-center">
          <div
            data-bg="true"
            className="absolute left-0 top-0 -z-10 h-full w-full bg-repeat brightness-75"
            style={{ backgroundImage: `url(${geopattern2.src})` }}
          ></div>
          <h1 className="font-gallery-100 text-3xl">7</h1>
        </section>

        {/* Section 8 */}

        <section className="relative flex h-screen items-center justify-center">
          <div
            data-bg="true"
            className="absolute left-0 top-0 -z-10 h-full w-full bg-cover bg-center bg-no-repeat brightness-75"
            style={{ backgroundImage: `url(${image6.src})` }}
          ></div>
          <h1 className="font-gallery-100 text-3xl">8</h1>
        </section>

        {/* Section 9 */}

        <section className="relative flex h-screen items-center justify-center">
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
