import { Trip } from "@prisma/client";
import Image from "next/image";
import image1 from "@/assets/1.jpg";
import { ImageDataTypes } from "@/types";
import { image } from "@nextui-org/react";
import { defaultPlaceholder } from "@/lib/utils";

function TitleSection({
  trip,
  imageData,
}: {
  trip: Trip;
  imageData?: ImageDataTypes;
}) {
  return (
    <>
      <div className="grid h-[90%] w-[90%] grid-cols-none grid-rows-2 lg:h-[80%] lg:w-[80%] lg:grid-cols-2 lg:grid-rows-none ">
        <div className="relative h-full w-full ">
          <Image
            src={(trip?.image || imageData?.tripImage) ?? image1}
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

        <div className="bg-gallery-50/40 p-8 shadow-sm sm:p-16">
          <h1 className="ml-4 mt-8 text-4xl font-extrabold text-tuna-900 sm:ml-8 sm:mt-3 sm:text-4xl md:text-5xl lg:text-6xl 2xl:text-7xl">
            {trip?.title}
          </h1>
        </div>
      </div>
    </>
  );
}

export default TitleSection;
