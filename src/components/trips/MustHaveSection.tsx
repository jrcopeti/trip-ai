import Image from "next/image";
import image3 from "@/assets/homepage/3.jpg";
import { defaultPlaceholder } from "@/lib/utils";
import type { MustHaveSectionProps } from "@/types";
import { FaCheck } from "react-icons/fa6";

function MustHaveSection({ trip, imageData }: MustHaveSectionProps) {
  return (
    <>
      <div className="must-have grid h-[90%] w-[90%] grid-cols-1 grid-rows-2 shadow-xl lg:h-[80%] lg:w-[80%] lg:grid-cols-2 lg:grid-rows-1">
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

        <div className="bg-gallery-50/70  px-4 py-2 sm:px-8 sm:py-4">
          <div className="ml-4">
            <h2 className=" text-2xl font-bold text-tuna-900 xs:text-3xl sm:mt-3 sm:text-4xl">
              Your Must Have items
            </h2>
            <div className="grid max-w-[30rem] grid-cols-2 rounded-md xs:mt-2 lg:mt-4 lg:gap-y-4 ">
              {(trip?.mustHave as string[])?.map((item, i) => (
                <ul className=" bg-gallery-50/40 p-2 " key={i}>
                  <li className=" flex max-h-fit items-center gap-2 text-base font-semibold text-tuna-600  first-letter:uppercase xs:text-lg lg:text-2xl 2xl:text-3xl">
                    {item} <FaCheck color="#4e888c" />
                  </li>
                </ul>
              ))}
            </div>
          </div>

          <div className="ml-4 xs:mt-4 lg:mt-8">
            <h2 className="text-xl font-bold text-tuna-900 sm:mt-3 sm:text-3xl md:text-3xl">
              And Your Required Items
            </h2>
            <div className="mt-2 grid max-w-[30rem] grid-cols-2 lg:mt-4 lg:gap-y-4 ">
              {(trip?.requiredItems as string[]).length >= 1 ? (
                (trip?.requiredItems as string[])?.map((item, i) => (
                  <ul className="bg-gallery-50/40 p-2" key={i}>
                    <li className="flex max-h-fit items-center gap-2 text-base font-semibold capitalize text-gallery-600 xs:text-lg lg:text-2xl 2xl:text-3xl">
                      {item !== "" && (
                        <>
                          {item} <FaCheck color="#4e888c" />
                        </>
                      )}
                    </li>
                  </ul>
                ))
              ) : (
                <p className="text-base font-semibold capitalize text-tuna-600 xs:text-lg lg:text-2xl 2xl:text-3xl">
                  --
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default MustHaveSection;
