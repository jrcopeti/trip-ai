import Image from "next/image";
import image16 from "@/assets/homepage/16.jpg";
import GridContainer from "../ui/GridContainer";
import Container from "../ui/Container";
import GradientBg from "../ui/GradientBg";
import { defaultPlaceholder } from "@/lib/constants";

function AboutComponent() {
  return (
    <Container overflow="overflow-hidden" height="h-[calc(100dvh-3.5rem)]">
      <GradientBg />
      <GridContainer bg="bg-gallery-50/70">
        <div className="flex min-w-full flex-col items-start gap-4 p-4 xs:p-8 md:p-8 lg:gap-8 lg:p-10">
          <h1 className="text-3xl font-extrabold text-tuna-900 xs:text-4xl md:text-5xl lg:text-6xl 2xl:text-7xl">
            About Trip AI
          </h1>
          <p className="text-base text-gallery-600 sm:text-xl xl:text-2xl  ">
            Trip AI makes travel planning fun by creating customized itineraries
            that match your preferences. Whether you&apos;re looking to explore
            vibrant cities or quiet natural retreats, Trip AI make travel plans
            simple and personal. It offers detailed tours suggestions and a list of
            things to pack, all adapted to the weather.
          </p>
        </div>

        <div className="relative h-full w-full ">
          <Image
            src={image16}
            alt="city"
            blurDataURL={defaultPlaceholder}
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
