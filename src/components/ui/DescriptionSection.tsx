import Image from "next/image";
import image2 from "@/assets/homepage/2.jpg";
import { defaultPlaceholder } from "@/lib/utils";
import type { DescriptionSectionProps } from "@/types";

function DescriptionSection({ trip, imageData }: DescriptionSectionProps) {
  return (
    <>
      <div className="trip-description grid h-[90%] w-[90%] grid-cols-none grid-rows-2 shadow-sm lg:h-[80%] lg:w-[80%] lg:grid-cols-2 lg:grid-rows-none ">
        <div className="bg-gallery-50/45 p-8 sm:p-14 ">
          <p className="text-xl font-semibold text-tuna-900 lg:text-2xl xl:text-3xl ">
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
      </div>
    </>
  );
}

export default DescriptionSection;
