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
      <div className="must-have grid h-[90%] w-[90%] grid-cols-none grid-rows-2 shadow-2xl lg:h-[80%] lg:w-[80%] lg:grid-cols-2 lg:grid-rows-none ">
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
            className="object-cover shadow-xl "
          />
        </div>

        <div className=" bg-gradient-to-tr from-gallery-50  to-gallery-50 p-8 sm:p-16  ">
          <h2 className="text-4xl font-bold sm:mt-3 sm:text-4xl md:text-5xl">
            Your Must Have items
          </h2>
          <div className="mt-4 grid max-w-[30rem] grid-cols-2 rounded-md lg:mt-8 lg:gap-y-4 ">
            {(trip?.mustHave as string[])?.map((item, i) => (
              <ul className=" bg-gallery-50/40 p-2" key={i}>
                <li className="max-h-fit text-lg font-semibold text-shark-950 first-letter:uppercase lg:text-2xl 2xl:text-3xl">
                  {item}
                </li>
              </ul>
            ))}
            {(trip?.requiredItems as string[])?.map((item, i) => (
              <ul className=" bg-gallery-50/40   p-2" key={i}>
                <li className="max-h-fit text-lg font-semibold text-cabaret-800 first-letter:uppercase lg:text-2xl 2xl:text-3xl  ">
                  {item}
                </li>
              </ul>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

export default MustHaveSection;
