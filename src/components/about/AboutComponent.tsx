import { defaultPlaceholder } from "@/lib/utils";
import GridContainer from "../ui/GridContainer";
import image1 from "@/assets/homepage/1.jpg";
import Image from "next/image";
import Container from "../ui/Container";
import GradientBg from "../ui/GradientBg";

function AboutComponent() {
  return (
    <Container overflow="overflow-hidden" height="h-[calc(100dvh-3.5rem)]">
      <GradientBg
        from="from-violay-300"
        to="to-neptune-300"
        blur="blur-[150px]"
      />
      <GridContainer bg="bg-gallery-100/50">
        <div className="p-4 xs:p-6 sm:p-8 md:p-10 lg:p-12 xl:p-16 ">
          <div className="flex min-w-full flex-col items-start gap-4 lg:gap-8">
            <h1 className="mt-0 text-3xl font-extrabold text-tuna-900 xs:text-4xl sm:mt-4 md:text-5xl lg:mt-8 lg:text-6xl 2xl:text-7xl">
              About Trip AI
            </h1>
            <p className="text-base text-gallery-600 xs:text-lg sm:text-xl  lg:text-xl xl:text-2xl  ">
              Trip AI makes travel planning fun by creating customized
              itineraries that match your personal preferences. Whether
              you&apos;re looking to explore vibrant cities or quiet natural
              retreats, Trip AI makes planning your travels simple and personal.
              It offers detailed tours suggestions, a list of things to pack,
              all adapted to the weather.
            </p>
          </div>
        </div>
        <div className="relative h-full w-full ">
          <Image
            src={image1}
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
