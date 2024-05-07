import Image from "next/image";
import image1 from "@/assets/homepage/1.jpg";
import GridContainer from "../ui/GridContainer";
import { defaultPlaceholder } from "@/lib/constants";
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

        <div className="p-2 xs:p-4 xl:px-4 xl:py-6">
          <h1 className="mb-auto ml-4 mt-2 text-3xl font-extrabold text-tuna-900 xs:text-4xl sm:ml-8 sm:mt-0 md:text-5xl lg:text-5xl 2xl:text-6xl">
            {trip?.title}
          </h1>
        </div>
      </GridContainer>
    </>
  );
}

export default TitleSection;
