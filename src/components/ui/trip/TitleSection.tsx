import { Trip } from "@prisma/client";
import Image from "next/image";

function TitleSection({ trip }: { trip: Trip }) {
  return (
    <>
      <div className="absolute h-[90%] w-[90%] p-4 lg:h-[80%] lg:w-[80%] lg:p-12 ">
        <div className="  grid gap-4 rounded-xl p-2 md:grid-cols-2 lg:p-4 xl:grid-cols-[1fr,1fr,] ">
          <Image
            src={trip?.image ?? ""}
            alt="city"
            width={600}
            height={500}
            blurDataURL={trip?.placeholder ?? ""}
            placeholder="blur"
            priority
            className="h-auto w-auto rounded-xl shadow-lg "
          />

          <div className=" grid grid-cols-1 gap-4 rounded-md p-4  shadow-sm lg:gap-8 xl:grid-cols-[1fr,1fr]">
            <h1 className=" text-3xl font-extrabold text-shark-950 md:text-5xl">
              {trip?.title}
            </h1>
          </div>
        </div>
      </div>
    </>
  );
}

export default TitleSection;
