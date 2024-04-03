"use client";

import { getSingleSavedTrip } from "@/actions/actions";
import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import Image from "next/image";
import { useEffect, useLayoutEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/all";

const image1 = "/1.jpg";
const image2 = "/2.jpg";
const image3 = "/3.jpg";
const image4 = "/4.jpg";
const image5 = "/5.jpg";
// const image6 = "/6.jpg";
// const image7 = "/7.jpg";
// const image8 = "/8.jpg";
// const image9 = "/9.jpg";
const geopattern = "/geopattern.png";
const geopattern2 = "/geopattern2.png";
const geopattern3 = "/geopattern3.png";

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
            style={{ backgroundImage: `url(${geopattern})` }}
          ></div>
          <h1 className="font-gallery-100 text-3xl">1</h1>

          <div className="absolute h-[80%] w-[80%] p-12 ">
            {/* <div className="absolute inset-0 top-[25%] left-[37%] -translate-x-1/2 -translate-y-1/4 ">
                </div> */}
            <div className="gap-x-15  grid grid-cols-1 lg:grid-cols-2 ">
              <div>
                <Image
                  src={trip?.image}
                  alt="city"
                  width={500}
                  height={500}
                  blurDataURL={trip?.placeholder}
                  placeholder="blur"
                  priority
                  className="rounded-xl"
                />
              </div>
              <div className=" backdrop-blur-sm">
                <h1>{trip?.title}</h1>
                <p>{trip?.description}</p>
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

          <div className="absolute h-[80%] w-[80%] p-12 backdrop-blur-md">
            {/* <div className="absolute inset-0 top-[25%] left-[37%] -translate-x-1/2 -translate-y-1/4 ">
                </div> */}

            <div className="gap-x-15 grid grid-cols-1 lg:grid-cols-2 ">
              <div></div>
              <div className=" h-full backdrop-blur-md">
                <h1 className="font-gallery-100 text-3xl">2</h1>
                <h1>{trip?.title}</h1>
                <p>{trip?.description}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Section 3 */}

        <section className="relative flex h-screen items-center justify-center">
          <div
            data-bg="true"
            className="absolute left-0 top-0 -z-10 h-full w-full bg-cover bg-center brightness-75"
            style={{ backgroundImage: `url(${image5})` }}
          ></div>
          <h1 className="font-gallery-100 text-3xl">3</h1>
        </section>

        {/* Section 4 */}

        <section className="relative flex h-screen items-center justify-center">
          <div
            data-bg="true"
            className="absolute left-0 top-0 -z-10 h-full w-full bg-cover bg-center bg-no-repeat brightness-75"
            style={{ backgroundImage: `url(${image3})` }}
          ></div>
          <h1 className="font-gallery-100 text-3xl">4</h1>
        </section>

        {/* Section 5 */}

        <section className="relative flex h-screen items-center justify-center">
          <div
            data-bg="true"
            className="absolute left-0 top-0 -z-10 h-full w-full brightness-75"
            style={{ backgroundImage: `url(${geopattern3})` }}
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
            style={{ backgroundImage: `url(${geopattern2})` }}
          ></div>
          <h1 className="font-gallery-100 text-3xl">7</h1>
        </section>

        {/* Section 8 */}

        <section className="relative flex h-screen items-center justify-center">
          <div
            data-bg="true"
            className="absolute left-0 top-0 -z-10 h-full w-full bg-cover bg-center bg-no-repeat brightness-75"
            style={{ backgroundImage: `url(${image3})` }}
          ></div>
          <h1 className="font-gallery-100 text-3xl">8</h1>
        </section>
      </>
    </>
  );
}

export default SavedTripsPageComponent;
