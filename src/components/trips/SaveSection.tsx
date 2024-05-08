import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useTripResponse } from "@/hooks/useTripResponse";
import { useImage } from "@/hooks/useImage";
import { useCreateTrip } from "@/hooks/useCreateTrip";
import image5 from "@/assets/homepage/5.jpg";
import { Button, ButtonGroup } from "@nextui-org/react";
import GridContainer from "../ui/GridContainer";
import { defaultPlaceholder } from "@/lib/constants";

function SaveSection() {
  const params = useParams();
  const { tripData: trip } = useTripResponse();
  const { handleYesAnswer, handleNoAnswer, isCreatingTrip, isSaved } =
    useCreateTrip(params);
  const { imageData } = useImage();

  return (
    <>
      <GridContainer animationClass="final-card">
        <div className="relative h-full w-full ">
          <Image
            src={imageData?.tripImage5 ?? image5}
            alt="city"
            blurDataURL={imageData?.placeholder ?? defaultPlaceholder}
            placeholder="blur"
            priority
            fill
            className="object-cover shadow-xl "
          />
        </div>
        <div className="bg-gallery-50/70 p-6 lg:p-8">
          <div className="flex flex-col gap-3">
            <h2 className="text-2xl font-bold text-tuna-900 lg:text-3xl">
              Good to know!
            </h2>
            <p className="text-sm font-semibold text-tuna-600 xs:text-base sm:text-lg lg:text-xl">
              {trip?.tip}
            </p>
          </div>

          {!isSaved ? (
            <div className="mt-2 sm:mt-4">
              <h2 className="mb-2 text-lg font-semibold text-tuna-900 lg:text-xl">
                Do you want to save this trip?
              </h2>
              <ButtonGroup>
                <Button
                  className="bg-neptune-500 font-semibold text-gallery-50 lg:text-lg"
                  type="button"
                  onClick={handleYesAnswer}
                  isDisabled={isCreatingTrip}
                >
                  Yes, please
                </Button>
                <Button
                  className="bg-neptune-500 text-gallery-50 lg:text-lg"
                  type="button"
                  onClick={handleNoAnswer}
                  isDisabled={isCreatingTrip}
                >
                  No, thanks
                </Button>
              </ButtonGroup>
            </div>
          ) : (
            <Link href="/form">
              <Button className="mt-4 bg-neptune-500 p-6 text-base text-gallery-50 xs:text-lg lg:text-xl">
                Get another trip
              </Button>
            </Link>
          )}
        </div>
      </GridContainer>
    </>
  );
}

export default SaveSection;
