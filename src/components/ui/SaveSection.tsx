import Image from "next/image";
import image5 from "@/assets/homepage/5.jpg";
import { Button } from "@nextui-org/react";
import type { SaveSectionProps } from "@/types";

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
            blurDataURL={imageData?.placeholder ?? ""}
            placeholder="blur"
            priority
            fill
            className="object-cover shadow-xl "
          />
        </div>
        <div>
          <Button type="button" onClick={handleYesAnswer}>
            Do you want to save your trip?
          </Button>
          <Button type="button" onClick={handleNoAnswer}>
            No
          </Button>
        </div>
      </div>
    </>
  );
}

export default SaveSection;
