"use client";

//React
import { useState } from "react";

//UI
import Image from "next/image";
import image16 from "@/assets/homepage/16.jpg";
import GridContainer from "../ui/GridContainer";
import Container from "../ui/Container";
import GradientBg from "../ui/GradientBg";

//Data
import { defaultPlaceholder } from "@/lib/constants";
import { homepageImages } from "@/data";

function AboutComponent() {
  const [randomIndex] = useState(() =>
    Math.floor(Math.random() * homepageImages.length),
  );

  return (
    <Container overflow="overflow-hidden" height="h-[calc(100dvh-3.5rem)]">
      <GradientBg />
      <GridContainer bg="bg-gallery-50/70">
        <div className="flex min-w-full flex-col items-start gap-4 p-4 xs:p-8 md:p-8 lg:gap-8 lg:p-10">
          <h1 className="text-3xl font-extrabold text-tuna-900 xs:text-4xl md:text-5xl lg:text-6xl 2xl:text-7xl">
            About Trip AI
          </h1>
          <p className=" text-sm text-gallery-700 xs:text-base sm:text-xl xl:text-2xl  ">
            Trip AI makes travel planning fun by creating customized itineraries
            that match your preferences. Whether you&apos;re looking to explore
            vibrant cities or quiet natural retreats, Trip AI make travel plans
            simple and personal. It offers detailed tours suggestions and a list
            of things to pack, all adapted to the weather.
          </p>
          <p className="text-sm text-gallery-600 xl:text-base ">
            Created by{" "}
            <a
              className="font-semibold text-gallery-600 hover:text-gallery-900 hover:opacity-65"
              target="_blank"
              href="https://github.com/jrcopeti"
            >
              José Copeti
            </a>
          </p>
        </div>

        <div className="relative h-full w-full ">
          <Image
            src={homepageImages[randomIndex].src ?? image16}
            alt="city"
            blurDataURL={
              homepageImages[randomIndex].placeholder ?? defaultPlaceholder
            }
            placeholder="blur"
            priority
            fill
            className="object-cover shadow-xl"
          />
        </div>
      </GridContainer>
    </Container>
  );
}

export default AboutComponent;
