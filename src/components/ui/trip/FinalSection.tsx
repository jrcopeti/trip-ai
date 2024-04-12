import Image from "next/image";
import { Trip } from "@prisma/client";
import { Button } from "@nextui-org/react";
import image9 from "@/assets/9.jpg";

function FinalSection({ trip }: { trip: Trip }) {
  return (
    <>
      <div className="final-card grid h-[90%] w-[90%] grid-cols-none grid-rows-2 shadow-2xl lg:h-[80%] lg:w-[80%] lg:grid-cols-2 lg:grid-rows-none ">
        <div className="relative h-full w-full ">
          <Image
            src={image9 ?? ""}
            alt="city"
            blurDataURL={trip?.placeholder ?? ""}
            placeholder="blur"
            priority
            fill
            className="object-cover shadow-xl "
          />
        </div>
        <div className="bg-gallery-50 p-8 sm:p-16 ">
          <Button className='bg-violay-500 text-gallery-50 text-xl p-6'>Back</Button>
        </div>
      </div>
    </>
  );
}

export default FinalSection;
