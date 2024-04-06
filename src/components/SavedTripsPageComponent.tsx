"use client";

import { getSingleSavedTrip } from "@/db/actions";
import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import Image from "next/image";
import { useEffect, useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
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
import {
  motion,
  useScroll,
  useSpring,
  useTransform,
  MotionValue,
  useMotionValueEvent,
} from "framer-motion";
import {
  Card,
  CardBody,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  getKeyValue,
} from "@nextui-org/react";
gsap.registerPlugin(ScrollTrigger);

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

  // useEffect(() => {
  //   if (!isPending) {
  //     generateWeather(trip?.city, trip?.country);
  //   }
  // }, [isPending, generateWeather, trip?.city, trip?.country]);
  // console.log("weatherData", weatherData);
  const useIsomorphicLayoutEffect =
    typeof window !== "undefined" ? useLayoutEffect : useEffect;
  gsap.registerPlugin(ScrollTrigger);
  // RIGHT HERE
  useIsomorphicLayoutEffect(() => {
    if (!isPending) {
      const innerHeight = window.innerHeight;

      const getRatio = (el: HTMLElement) =>
        innerHeight / (innerHeight + el.offsetHeight);

      gsap.utils.toArray("section").forEach((section, i) => {
        const bg = section.querySelector('[data-bg="true"]');

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
              trigger: bg,

              start: () => (i ? "top bottom" : "top top"),
              end: "bottom top",
              scrub: true,
              invalidateOnRefresh: true,
            },
          },
        );
      });
    }

    return () => {
      ScrollTrigger.getAll().forEach((st) => st.kill());
    };
  }, [isPending]);

  useIsomorphicLayoutEffect(() => {
    if (!isPending) {
      const tripDescription = document.getElementById("description");
      const titleTours = document.getElementById("title-tours");
      const tours = document.getElementById("tours");

      const packReady = document.getElementById("pack-ready");
      const objectsList = document.getElementById("objects-list");
      const context = gsap.context(() => {
        gsap.set(tripDescription, {
          scale: 0,
        });
        gsap.set(titleTours, {
          xPercent: -200,
        });
        gsap.set(tours, {
          autoAlpha: 0,
        });
        gsap.set(packReady, {
          yPercent: -100,
          autoAlpha: 0,
        });
        gsap.set(objectsList, {
          autoAlpha: 0,
          y: -50,
        });

        let timeline = gsap
          .timeline({
            scrollTrigger: {
              trigger: tripDescription,
              start: "top bottom",
              end: "center center",
              toggleActions: "play none none none",
              markers: true,
            },
          })
          
          .to(
            tripDescription,

            {
              scale: 1,
              duration: 1,
            },
          )
          .to(titleTours, { xPercent: 0, duration: 0.5 })
          .to(tours, { autoAlpha: 1, duration: 0.5 })
          .to(packReady, {
            yPercent: 0,
            duration: 0.5,
            autoAlpha: 1,
            stagger: 0.5,
          })
          .to(objectsList, {
            autoAlpha: 1,
            duration: 2.5,
            stagger: 0.5,
            y: 0,
          });
      });
      return () => context.revert();
    }
  }, [isPending]);

  if (isPending) {
    return <div>Loading single trip...</div>;
  }

  const formattedStartDate = dayjs(trip?.startDate).format("DD MMM YYYY");
  const formattedEndDate = dayjs(trip?.endDate).format("DD MMM YYYY");

  const columns = [
    { key: "quantity", label: "Quantity" },
    { key: "item", label: "Item" },
    { key: "description", label: "Description" },
  ];
  const rows = trip?.objectsList?.map((object, index) => ({
    key: object.id || index,
    quantity: object.quantity,
    item: object.item,
    description: object.description,
  }));

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
        <section
          data-bg="true"
          className="relative flex h-screen items-center justify-center overflow-x-hidden"
        >
          <div
            data-bg="true"
            className="absolute left-0 top-0 -z-10 h-full w-full bg-center bg-repeat brightness-75"
            style={{ backgroundImage: `url(${geopattern.src})` }}
          ></div>
          <div className="absolute h-[90%] w-[90%] p-4 lg:h-[80%] lg:w-[80%] lg:p-12 ">
            <div className="  grid gap-4 rounded-xl p-2 md:grid-cols-2 lg:p-4 xl:grid-cols-[5fr,1fr,] ">
              <Image
                src={trip?.image}
                alt="city"
                width={600}
                height={500}
                blurDataURL={trip?.placeholder}
                placeholder="blur"
                priority
                className="h-auto w-auto rounded-xl shadow-lg "
              />

              <div className=" grid grid-cols-1 gap-4 rounded-md p-4  shadow-sm lg:gap-8 xl:grid-cols-[1fr,1fr]">
                <h1 className=" text-3xl font-extrabold text-shark-950 md:text-5xl">
                  {trip?.title}
                </h1>
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

          <div className="p-12 backdrop-blur-sm">
            <p
              id="description"
              className="  text-start text-2xl font-extrabold leading-[1.8] text-shark-100 md:text-center   lg:text-4xl"
            >
              {trip?.description}
            </p>
          </div>
        </section>

        {/* Section 3 */}

        <section
          data-bg="true"
          className="relative flex h-screen items-center justify-center"
        >
          <div
            data-bg="true"
            className="absolute left-0 top-0 -z-10 h-full w-full bg-cover bg-center bg-no-repeat brightness-75"
            style={{ backgroundImage: `url(${trip?.image2})` }}
          ></div>

          <div className=" absolute h-[90%] w-[90%] p-4  backdrop-blur-sm lg:h-[80%] lg:w-[80%] lg:p-12">
            <div className="grid grid-cols-1 items-center gap-4 rounded-xl  p-2 lg:p-4 xl:grid-cols-[1fr,auto]  ">
              <h1
                id="title-tours"
                className=" rounded-xl  bg-shark-100/50 p-4 text-3xl font-extrabold capitalize text-shark-800 md:text-5xl"
              >
                Your suggested tours
              </h1>
              <div
                id="tours"
                className=" grid grid-cols-1 gap-4 rounded-md p-4 lg:gap-6"
              >
                {(trip?.tours as string[])?.map((tour) => (
                  <ul className="grid grid-cols-1" key={tour}>
                    <li className=" text-md font-semibold text-shark-200 lg:text-xl xl:text-2xl ">
                      {tour}
                    </li>
                  </ul>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Section 4 */}

        <section className="relative flex h-screen items-center justify-center">
          <div
            data-bg="true"
            className="absolute left-0 top-0 -z-10 h-full w-full brightness-75"
            style={{ backgroundImage: `url(${image4.src})` }}
          ></div>
          <h1
            id="pack-ready"
            className=" text-4xl font-extrabold capitalize text-shark-200 md:text-6xl"
          >
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
            <div
              id="objects-list"
              className="grid grid-cols-1 items-center justify-items-center rounded-md p-4 text-2xl lg:grid-cols-3 lg:gap-4"
            >
              {(trip?.objectsList as any)?.map((object: any) => (
                <div
                  className="flex h-full w-full flex-col items-stretch justify-start gap-y-6 rounded-xl bg-tuna-200 p-4 font-semibold leading-loose lg:text-2xl"
                  key={object.item}
                >
                  <div className="flex items-center justify-start space-x-2">
                    <span className="text-violay-500">{object.quantity}</span>
                    <span className="whitespace-nowrap text-shark-800">
                      {object.item}
                    </span>
                  </div>
                  <span className="whitespace-normal text-shark-800">
                    {object.description}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* <div
              id="objects-list"
              className=" grid grid-cols-2 items-center justify-items-center rounded-md p-4 text-2xl lg:grid-cols-3 lg:gap-8 lg:p-8"
            >
              {(trip?.objectsList as any)?.map((object: any) => (
                <ul
                  className=" grid grid-rows-2 items-start gap-y-10 rounded-xl bg-tuna-200 p-4 font-semibold leading-loose lg:text-2xl"
                  key={object.item}
                >
                  <li className="text-violay-500 row-span-1  ">{object.quantity}</li>
                  <li className="  whitespace-nowrap  text-shark-800">
                    {object.item}
                  </li>
                  <li className=" whitespace-normal row-span-2 text-shark-800 ">
                    {object.description}
                  </li>
                </ul>
              ))}
            </div> */}
          {/* <Table
              color="primary"
              aria-label="Example table with dynamic content"
            >
              <TableHeader columns={columns}>
                {(column) => (
                  <TableColumn key={column.key}>{column.label}</TableColumn>
                )}
              </TableHeader>
              <TableBody items={rows}>
                {(item) => (
                  <TableRow key={item.key}>
                    {(columnKey) => (
                      <TableCell>{getKeyValue(item, columnKey)}</TableCell>
                    )}
                  </TableRow>
                )}
              </TableBody>
            </Table> */}
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
