import Image from "next/image";
import image5 from "@/assets/homepage/5.jpg";
import { Button, ButtonGroup } from "@nextui-org/react";
import type { SaveSectionProps } from "@/types";
import { defaultPlaceholder } from "@/lib/utils";

function SaveSection({
  handleYesAnswer,
  handleNoAnswer,
  imageData,
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
          <h2 className="mb-4 text-xl font-semibold text-tuna-900">
            Do you want to save this trip?
          </h2>
          <ButtonGroup>
            <Button
              className="bg-neptune-500 font-semibold text-gallery-50"
              type="button"
              onClick={handleYesAnswer}
            >
              Yes
            </Button>
            <Button
              className="font bg-neptune-500 text-gallery-50"
              type="button"
              onClick={handleNoAnswer}
            >
              No
            </Button>
          </ButtonGroup>
        </div>
      </div>
    </>
  );
}

export default SaveSection;
