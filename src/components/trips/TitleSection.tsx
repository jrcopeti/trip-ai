import Image from "next/image";
import image1 from "@/assets/homepage/1.jpg";
import { defaultPlaceholder } from "@/lib/utils";
import type { TitleSectionProps } from "@/types";

function TitleSection({ trip, imageData }: TitleSectionProps) {
 
  return (
    <>
      <div className="grid h-[90%] w-[90%] grid-cols-1 grid-rows-2 shadow-xl lg:h-[80%] lg:w-[80%] lg:grid-cols-2 lg:grid-rows-1">
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

        <div className="bg-gallery-50/40 p-8 sm:p-16">
          <h1 className="ml-4 mt-8 text-3xl font-extrabold text-tuna-900 sm:ml-8 sm:mt-3 xs:text-4xl md:text-5xl lg:text-6xl 2xl:text-7xl">
            {trip?.title}
          </h1>
        </div>
      </div>
    </>
  );
}

export default TitleSection;
