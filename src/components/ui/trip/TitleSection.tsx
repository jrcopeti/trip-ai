import { Trip } from "@prisma/client";
import Image from "next/image";

function TitleSection({ trip }: { trip: Trip }) {
  return (
    <>
      <div className=" grid h-[90%] w-[90%] grid-rows-2 lg:grid-rows-none lg:grid-cols-2 grid-cols-none lg:h-[80%] lg:w-[80%] shadow-2xl ">
        <div className="relative h-full w-full ">
          <Image
            src={trip?.image ?? ""}
            alt="city"
            blurDataURL={trip?.placeholder ?? ""}
            placeholder="blur"
            priority
        fill
            className="object-cover shadow-xl "
          />
        </div>

        <div className="  bg-gradient-to-tr from-gallery-50  to-gallery-50 p-8 sm:p-16 ">
          <h1 className="2xl:text-7xl lg:text-6xl md:text-5xl sm:text-4xl text-4xl font-extrabold text-tuna-900 ml-4 mt-8 sm:ml-8 sm:mt-3
         ">
            {/* {trip?.title} */}
            Marias Trip in the exciting journey to the city of Washington, United States
          </h1>
          <p>


          </p>
        </div>
      </div>
    </>
  );
}

export default TitleSection;
