import Image from "next/image";
import { Trip } from "@prisma/client";

function FinalSection({ trip }: { trip: Trip }) {
  return (
    <>
      <div className=" grid h-[90%] w-[90%] grid-cols-none grid-rows-2 shadow-2xl lg:h-[80%] lg:w-[80%] lg:grid-cols-2 lg:grid-rows-none ">
        <div className="relative h-full w-full ">
          <Image
            src={trip?.image4 ?? ""}
            alt="city"
            blurDataURL={trip?.placeholder ?? ""}
            placeholder="blur"
            priority
            fill
            className="object-cover shadow-xl "
          />
        </div>
        <div className="bg-gradient-to-tr from-gallery-50  to-gallery-50 p-8 sm:p-16 ">
          <h1 className="ml-4 mt-8 text-lg font-semibold text-tuna-900 md:text-2xl xl:text-3xl">
            {trip?.description}
          </h1>
        </div>
      </div>
    </>
  );
}

export default FinalSection;
