import Image from "next/image";
import image1 from "@/assets/homepage/1.jpg";
import GridContainer from "../ui/GridContainer";
import { defaultPlaceholder } from "@/lib/utils";
import type { TitleSectionProps } from "@/types";

function TitleSection({ trip, imageData }: TitleSectionProps) {
  return (
    <>
      <GridContainer bg="bg-gallery-50/70">
        <div className="relative h-full w-full ">
          <Image
            src={(trip?.image || imageData?.tripImage) ?? image1.src}
            alt="city"
            blurDataURL={
              (trip?.placeholder || imageData?.placeholder) ??
              defaultPlaceholder
            }
            placeholder="blur"
            priority
            fill
            className="object-cover shadow-xl"
          />
        </div>

        <div className="p-4 xs:p-6 sm:p-8 md:p-10 lg:p-12 xl:p-14">
          <h1 className="mb-auto ml-4 mt-8 text-3xl font-extrabold text-tuna-900 xs:text-4xl sm:ml-8 sm:mt-0 md:text-5xl lg:text-6xl 2xl:text-7xl">
            {trip?.title}
          </h1>
        </div>
      </GridContainer>
    </>
  );
}

export default TitleSection;
