import { useRef } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import defaultImage3 from "@/assets/homepage/3.jpg";
import { useLocomotiveScroll } from "@/hooks/useLocomotiveScroll";
import { useSingleSavedTrip } from "@/hooks/useSingleSavedTrip";
import { useTripResponse } from "@/hooks/useTripResponse";
import { useImage } from "@/hooks/useImage";
import GridContainer from "../ui/GridContainer";
import { defaultPlaceholder } from "@/lib/constants";
import { FaCheck } from "react-icons/fa6";

function MustHaveSection() {
  const scrollRef = useRef(null);
  useLocomotiveScroll(scrollRef);

  const params = useParams();
  const { trip } = useSingleSavedTrip({ params });
  const { tripData: response } = useTripResponse();
  const { imageData } = useImage();

  const image3 = trip?.image3 || imageData?.tripImage3;
  const placeholder = trip?.placeholder || imageData?.placeholder;
  const mustHave = trip?.mustHave || response?.mustHave;
  const requiredItems =
    (trip?.requiredItems as string[]) || (response?.requiredItems as string[]);

  return (
    <>
      <GridContainer animationClass="must-have">
        <div className="relative h-full w-full ">
          <Image
            src={image3 ?? defaultImage3}
            alt="city"
            blurDataURL={placeholder ?? defaultPlaceholder}
            placeholder="blur"
            priority
            fill
            className="object-cover"
          />
        </div>

        <div
          ref={scrollRef}
          className="min-h-full overflow-auto bg-gallery-50/70 px-4 py-3 lg:px-6 lg:py-5"
        >
          <div className="ml-2">
            <h2 className="text-2xl font-bold text-tuna-900 xs:text-3xl sm:mt-3 lg:text-4xl">
              Your Must Have items
            </h2>
            <div className="grid grid-cols-2 gap-x-5 xs:mt-2 sm:grid-cols-3 lg:mt-4 lg:grid-cols-2 lg:gap-y-1">
              {mustHave?.map((item, i) => (
                <ul className="py-1" key={i}>
                  <li className="inline-flex items-center gap-2 text-base font-semibold capitalize text-tuna-600 xs:text-lg lg:text-2xl 2xl:text-3xl">
                    <span>
                      <FaCheck color="#4e888c" />
                    </span>
                    <p className="">{item}</p>
                  </li>
                </ul>
              ))}
            </div>
          </div>

          <div className="ml-2 xs:mt-4 lg:mt-6">
            <h2 className="text-2xl font-bold text-tuna-900 sm:mt-3 sm:text-3xl lg:text-4xl">
              And Your Required Items
            </h2>
            <div className="mt-2 grid grid-cols-2 gap-x-5 xs:mt-2 sm:grid-cols-3 lg:mt-4 lg:grid-cols-2 lg:gap-y-1">
              {requiredItems.length > 1 &&
                requiredItems?.map((item, i) => (
                  <ul className="py-1" key={i}>
                    <li className="inline-flex items-center gap-1 text-base font-semibold capitalize text-tuna-600 xs:text-lg lg:text-2xl 2xl:text-3xl">
                      {item !== "" && (
                        <>
                          <span>
                            <FaCheck color="#4e888c" />
                          </span>
                          <p>{item}</p>
                        </>
                      )}
                    </li>
                  </ul>
                ))}
              {requiredItems.length === 1 &&
                requiredItems?.map((item, i) => (
                  <ul className="py-1" key={i}>
                    <li className="inline-flex items-center gap-1 text-base font-semibold capitalize text-tuna-600 xs:text-lg lg:text-2xl 2xl:text-3xl">
                      {item !== "" ? (
                        <>
                          <span>
                            <FaCheck color="#4e888c" />
                          </span>
                          <p>{item}</p>
                        </>
                      ) : (
                        <p className="text-base font-semibold capitalize text-tuna-600 lg:text-xl 2xl:text-2xl">
                          --
                        </p>
                      )}
                    </li>
                  </ul>
                ))}
              {!requiredItems ||
                (requiredItems.length === 0 && (
                  <p className="text-base font-semibold capitalize text-tuna-600 lg:text-xl 2xl:text-2xl">
                    --
                  </p>
                ))}
            </div>
          </div>
        </div>
      </GridContainer>
    </>
  );
}

export default MustHaveSection;
