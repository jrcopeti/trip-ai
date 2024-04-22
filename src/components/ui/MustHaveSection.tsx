import Image from "next/image";
import image3 from "@/assets/homepage/3.jpg";
import { defaultPlaceholder } from "@/lib/utils";
import type { MustHaveSectionProps } from "@/types";

function MustHaveSection({ trip, imageData }: MustHaveSectionProps) {
  return (
    <>
      <div className="must-have grid h-[90%] w-[90%] grid-cols-1 grid-rows-2 shadow-xl lg:h-[80%] lg:w-[80%] lg:grid-cols-2 lg:grid-rows-1 ">
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

        <div className=" bg-gallery-50 px-4 py-2 sm:py-4 sm:px-8 overflow-auto">
          <div className="ml-4">
            <h2 className=" text-2xl xs:text-3xl font-bold text-tuna-900 sm:mt-3 sm:text-4xl md:text-5xl">
              Your Must Have items
            </h2>
            <div className="xs:mt-2 grid max-w-[30rem] grid-cols-2 rounded-md lg:mt-4 lg:gap-y-4 ">
              {(trip?.mustHave as string[])?.map((item, i) => (
                <ul className=" bg-gallery-50/40 p-2" key={i}>
                  <li className="max-h-fit text-base xs:text-lg font-semibold text-tuna-900 first-letter:uppercase lg:text-2xl 2xl:text-3xl">
                    {item}
                  </li>
                </ul>
              ))}
            </div>
          </div>

          <div className="ml-4 xs:mt-4 lg:mt-8">
            <h2 className="text-xl font-bold text-tuna-900 sm:mt-3 sm:text-3xl md:text-3xl">
              And your Required items
            </h2>
            <div className="mt-2 grid max-w-[30rem] grid-cols-2 lg:mt-4 lg:gap-y-4 ">
              {(trip?.requiredItems as string[])?.map((item, i) => (
                <ul className="bg-gallery-50/40 p-2" key={i}>
                  <li className="max-h-fit text-base xs:text-lg font-semibold text-cabaret-800 first-letter:uppercase lg:text-2xl 2xl:text-3xl">
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
