import { useSingleSavedTrip } from "@/hooks/useSingleSavedTrip";
import { useImage } from "@/hooks/useImage";
import { useParams } from "next/navigation";
import Image from "next/image";
import image1 from "@/assets/homepage/1.jpg";
import GridContainer from "../ui/GridContainer";
import { defaultPlaceholder } from "@/lib/constants";

function TitleSection() {
  const params = useParams();
  console.log("params", params);
  const { trip } = useSingleSavedTrip({ params });
  const { imageData } = useImage();

  return (
    <>
      <GridContainer>
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

        <div className="bg-gallery-50/70 px-4 py-2 sm:px-6 sm:py-4">
          <h1 className="ml-4 mt-2 text-3xl font-extrabold text-tuna-900 xs:text-4xl sm:ml-8 sm:mt-0 md:text-5xl lg:text-[3.35rem] 2xl:text-7xl">
            {trip?.title}
          </h1>
        </div>
      </GridContainer>
    </>
  );
}

export default TitleSection;
