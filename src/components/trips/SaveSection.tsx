import Link from "next/link";
import Image from "next/image";
import { Button, ButtonGroup } from "@nextui-org/react";
import image5 from "@/assets/homepage/5.jpg";
import GridContainer from "../ui/GridContainer";
import { defaultPlaceholder } from "@/lib/utils";
import type { SaveSectionProps } from "@/types";

function SaveSection({
  handleYesAnswer,
  handleNoAnswer,
  imageData,
  trip,
  isCreatingTrip,
  isSaved,
}: SaveSectionProps) {
  return (
    <>
      <GridContainer bg="bg-gallery-50/70" animationClass="final-card">
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
        <div className="bg-gallery-50/70 p-4 sm:p-10">
          <div className="flex flex-col gap-3">
            <h2 className="text-3xl font-bold text-tuna-900">Good to know!</h2>
            <p className="text-base font-semibold text-tuna-600 sm:text-lg lg:text-xl">
              {trip?.tip}
            </p>
          </div>

          {!isSaved ? (
            <div className="mt-2 sm:mt-4">
              <h2 className="mb-2 text-lg font-semibold text-tuna-900">
                Do you want to save this trip?
              </h2>
              <ButtonGroup>
                <Button
                  className="bg-neptune-500 font-semibold text-gallery-50"
                  type="button"
                  onClick={handleYesAnswer}
                  isDisabled={isCreatingTrip}
                >
                  Yes, please
                </Button>
                <Button
                  className="bg-neptune-500 text-gallery-50"
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
              <Button className="mt-4 bg-neptune-500 p-6 text-base text-gallery-50 xs:text-xl">
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
