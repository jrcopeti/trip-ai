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
        <div className="bg-gallery-50/40 p-4 xs:p-6 sm:p-8 md:p-10 lg:p-12 xl:p-14">
          <h1 className="mb-auto ml-4 mt-8 text-3xl font-extrabold text-tuna-900 xs:text-4xl sm:ml-8 sm:mt-3 md:text-5xl lg:text-6xl 2xl:text-7xl">
            About Trip AI
          </h1>
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
