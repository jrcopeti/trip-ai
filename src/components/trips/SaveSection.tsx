import Link from "next/link";
import Image from "next/image";
import { Button, ButtonGroup } from "@nextui-org/react";
import image5 from "@/assets/homepage/5.jpg";
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
      <div className="final-card grid h-[90%] w-[90%] grid-cols-none grid-rows-2 shadow-xl lg:h-[80%] lg:w-[80%] lg:grid-cols-2 lg:grid-rows-none ">
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
        <div className="bg-gallery-50/50 p-8 sm:p-10">
          <div className="flex flex-col gap-3">
            <h2 className="text-3xl font-bold text-tuna-900">Good to know!</h2>
            <p className="text-lg font-semibold lg:text-xl">{trip?.tip} </p>
          </div>

          {!isSaved ? (
            <div className="mt-4">
              <h2 className="mb-4 text-xl font-semibold text-tuna-900">
                Do you want to save this trip?
              </h2>
              <ButtonGroup>
                <Button
                  className="bg-neptune-500 font-semibold text-gallery-50"
                  type="button"
                  onClick={handleYesAnswer}
                  disabled={isCreatingTrip}
                >
                  Yes
                </Button>
                <Button
                  className="font bg-neptune-500 text-gallery-50"
                  type="button"
                  onClick={handleNoAnswer}
                  disabled={isCreatingTrip}
                >
                  No
                </Button>
              </ButtonGroup>
            </div>
          ) : (
            <Link href="/">
              <Button className="mt-4 bg-neptune-500 p-6 text-xl text-gallery-50">
                Back to Home
              </Button>
            </Link>
          )}
        </div>
      </div>
    </>
  );
}

export default SaveSection;
