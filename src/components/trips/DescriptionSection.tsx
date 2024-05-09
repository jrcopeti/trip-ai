import { useParams } from "next/navigation";
import { useSingleSavedTrip } from "@/hooks/useSingleSavedTrip";
import { useTripResponse } from "@/hooks/useTripResponse";
import { useImage } from "@/hooks/useImage";
import Image from "next/image";
import defaultImage2 from "@/assets/homepage/2.jpg";
import GridContainer from "../ui/GridContainer";
import { defaultPlaceholder } from "@/lib/constants";
import { useRef } from "react";
import { useLocomotiveScroll } from "@/hooks/useLocomotiveScroll";

function DescriptionSection() {
  const scrollRef = useRef(null);
  useLocomotiveScroll(scrollRef);

  const params = useParams();
  const { trip } = useSingleSavedTrip({ params });
  const { tripData: response } = useTripResponse();
  const { imageData } = useImage();

  const description = trip?.description || response?.description;
  const image2 = trip?.image2 || imageData?.tripImage2;
  const placeholder = trip?.placeholder || imageData?.placeholder;

  return (
    <>
      <GridContainer animationClass="trip-description">
        <div
          ref={scrollRef}
          className="min-h-full overflow-auto bg-gallery-50/70 p-4 xs:p-6 sm:p-8 xl:p-10"
        >
          <p className="text-sm font-semibold text-tuna-600 xs:text-base sm:text-lg lg:text-xl xl:text-2xl 2xl:text-3xl">
            {description}
          </p>
        </div>
        <div className="relative h-full w-full">
          <Image
            src={image2 ?? defaultImage2}
            alt="city"
            blurDataURL={placeholder ?? defaultPlaceholder}
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
