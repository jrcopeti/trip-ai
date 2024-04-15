import { ImageDataTypes } from "@/types";
import { Trip } from "@prisma/client";
import Image from "next/image";
import image2 from "@/assets/2.jpg";
import { defaultPlaceholder } from "@/lib/utils";

function DescriptionSection({
  trip,
  imageData,
}: {
  trip: Trip;
  imageData?: ImageDataTypes;
}) {
  return (
    <>
      <div className=" trip-description grid h-[90%] w-[90%] grid-cols-none grid-rows-2 shadow-2xl lg:h-[80%] lg:w-[80%] lg:grid-cols-2 lg:grid-rows-none ">
        <div className="bg-gradient-to-tr from-gallery-50  to-gallery-50 p-8 sm:p-14 ">
          <p className="text-base font-semibold text-tuna-900 lg:text-xl xl:text-2xl">
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
            className="object-cover shadow-xl "
          />
        </div>
      </div>
    </>
  );
}

export default DescriptionSection;
