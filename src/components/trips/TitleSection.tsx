import { useSingleSavedTrip } from "@/hooks/useSingleSavedTrip";
import { useTripResponse } from "@/hooks/useTripResponse";
import { useImage } from "@/hooks/useImage";
import { useParams } from "next/navigation";
import Image from "next/image";
import defaultImage1 from "@/assets/homepage/1.jpg";
import GridContainer from "../ui/GridContainer";
import { defaultPlaceholder } from "@/lib/constants";

function TitleSection() {
  const params = useParams();
  console.log("params", params);
  const { trip } = useSingleSavedTrip({ params });
  const { tripData: response } = useTripResponse();
  const { imageData } = useImage();

  const tripImage = trip?.image || imageData?.tripImage;
  const placeholder = trip?.placeholder || imageData?.placeholder;
  const title = trip?.title || response?.title;

  return (
    <>
      <GridContainer>
        <div className="relative h-full w-full ">
          <Image
            src={tripImage ?? defaultImage1}
            alt="city"
            blurDataURL={placeholder ?? defaultPlaceholder}
            placeholder="blur"
            priority
            fill
            className="object-cover shadow-xl"
          />
        </div>

        <div className="bg-gallery-50/70 px-4 py-2 sm:px-6 sm:py-4">
          <h1 className="ml-4 mt-2 text-3xl font-extrabold text-tuna-900 xs:text-4xl sm:ml-8 sm:mt-0 md:text-5xl lg:text-[3.35rem] 2xl:text-7xl">
            {title}
          </h1>
        </div>
      </GridContainer>
    </>
  );
}

export default TitleSection;
