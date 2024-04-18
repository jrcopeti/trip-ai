import { ImageDataTypes } from "@/types";
import type { Trip } from "@prisma/client";
import Image from "next/image";
import image3 from "@/assets/homepage/3.jpg";
import { defaultPlaceholder } from "@/lib/utils";

function MustHaveSection({
  trip,
  imageData,
}: {
  trip: Trip;
  imageData?: ImageDataTypes;
}) {
  return (
    <>
      <div className="must-have grid h-[90%] w-[90%] grid-cols-none grid-rows-2 shadow-xl lg:h-[80%] lg:w-[80%] lg:grid-cols-2 lg:grid-rows-none ">
        <div className="relative h-full w-full ">
          <Image
            src={(trip?.image3 || imageData?.tripImage3) ?? image3}
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

        <div className=" bg-gallery-50 p-4 sm:p-8">
          <div className="ml-4">
            <h2 className="text-4xl font-bold text-tuna-900 sm:mt-3 sm:text-4xl md:text-5xl">
              Your Must Have items
            </h2>
            <div className="mt-2 grid max-w-[30rem] grid-cols-2 rounded-md lg:mt-4 lg:gap-y-4 ">
              {(trip?.mustHave as string[])?.map((item, i) => (
                <ul className=" bg-gallery-50/40 p-2" key={i}>
                  <li className="max-h-fit text-lg font-semibold text-tuna-900 first-letter:uppercase lg:text-2xl 2xl:text-3xl">
                    {item}
                  </li>
                </ul>
              ))}
            </div>
          </div>

          <div className="ml-4 mt-2 lg:mt-8">
            <h2 className="text-xl font-bold text-tuna-900 sm:mt-3 sm:text-3xl md:text-3xl">
              And your Required items
            </h2>
            <div className="mt-2 grid max-w-[30rem] grid-cols-2 rounded-md lg:mt-4 lg:gap-y-4 ">
              {(trip?.requiredItems as string[])?.map((item, i) => (
                <ul className="bg-gallery-50/40 p-2" key={i}>
                  <li className="max-h-fit text-lg font-semibold text-cabaret-800 first-letter:uppercase lg:text-2xl 2xl:text-3xl">
                    {item}
                  </li>
                </ul>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default MustHaveSection;
