import Image from "next/image";
import image2 from "@/assets/homepage/2.jpg";
import GridContainer from "../ui/GridContainer";
import { defaultPlaceholder } from "@/lib/constants";
import type { DescriptionSectionProps } from "@/types";

function DescriptionSection({ trip, imageData }: DescriptionSectionProps) {
  return (
    <>
      <GridContainer bg="bg-gallery-50/70" animationClass="trip-description">
        <div className="bg-gallery-50/70 p-6 xs:p-8 sm:p-8 md:p-8 lg:p-8 xl:p-10">
          <p className="text-sm font-semibold text-tuna-600 sm:text-lg lg:text-xl xl:text-2xl 2xl:text-3xl">
            {trip?.description}
          </p>
        </div>
        <div className="relative h-full w-full ">
          <Image
            src={(trip?.image2 || imageData?.tripImage2) ?? image2}
            alt="city"
            blurDataURL={
              (trip?.placeholder || imageData?.placeholder) ??
              defaultPlaceholder
            }
            placeholder="blur"
            priority
            fill
            className="object-cover"
          />
        </div>
      </GridContainer>
    </>
  );
}

export default DescriptionSection;
