import type { Trip } from "@prisma/client";
import Image from "next/image";
import suitcase from "@/assets/suitcase.png";

function ObjectsSection({ trip }: { trip: Trip }) {
  return (
    <div className="  absolute h-[90%] w-[90%] p-4 lg:h-[80%] lg:w-[80%] lg:p-12 ">

      <div className="grid grid-cols-2 items-center justify-items-center gap-2 rounded-md text-xs lg:grid-cols-3 lg:gap-4 lg:p-4 lg:text-2xl">
        {(
          trip?.objectsList as {
            quantity: number;
            item: string;
            description: string;
          }[]
        )?.map((object, i) => (
          <div
            className="objects-list flex h-full w-full flex-col items-stretch justify-start bg-gallery-50/40    p-6 font-semibold leading-loose text-shark-900 lg:gap-y-6 lg:text-2xl "
            key={i}
          >
            <div className=" flex items-center justify-start space-x-4 text-cabaret-800">
              <span className="font-extrabold ">{object.quantity}</span>
              <span className="whitespace-nowrap font-bold capitalize text-shark-900 ">
                {object.item}
              </span>
            </div>
            <span className="whitespace-normal text-gallery-700">
              {object.description}
            </span>
          </div>
        ))}
      <div className="absolute -z-10 h-[200px] w-[200px] lg:translate-y-[100px] lg:translate-x-[350px]  xl:translate-y-[100px] xl:translate-x-[450px] translate-y-[220px] translate-x-[120px] lg:h-[250px] lg:w-[350px] xl:h-[300px] xl:w-[400px]  ">
        <Image
          src={suitcase}
          alt="stamps"
          fill
          className=" object-contain opacity-60 "
        />
      </div>
      </div>

    </div>
  );
}

export default ObjectsSection;
