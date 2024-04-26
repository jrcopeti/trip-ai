import type { Trip } from "@prisma/client";
import Image from "next/image";
import plane from "@/assets/travel/plane.png";

function ToursSection({ trip }: { trip: Trip }) {
  return (
    <>
      <div className="absolute h-[90%] w-[90%] lg:h-[80%] lg:w-[80%]">
        <div className="grid grid-cols-1 items-center gap-4 rounded-xl text-center sm:text-start xl:grid-cols-[1fr,auto]  ">
          <h1 className="title-tours bg-gallery-50/40 p-6 text-xl font-extrabold capitalize text-tuna-900 shadow-xl xs:text-2xl lg:text-4xl xl:text-5xl">
            Your suggested tours
          </h1>
          <div className="grid max-w-full grid-cols-1 gap-3 lg:gap-4 xl:gap-10 ">
            {(trip?.tours as string[])?.map((tour, i) => (
              <ul
                className="tour-item grid grid-cols-1 bg-gallery-50/40 p-2 shadow-md sm:p-3 lg:p-5"
                key={i}
              >
                <li className="max-h-fit text-xs font-semibold text-tuna-900 xs:text-sm md:text-lg lg:text-xl 2xl:text-2xl">
                  <span className="font-bold text-neptune-600">{i + 1}.</span>
                  &nbsp;{tour}
                </li>
              </ul>
            ))}
          </div>
          <div className="plane absolute -z-10 h-[100dvw] w-[100dvw] md:h-[600px] md:w-[600px]">
            <Image
              src={plane}
              alt="plane"
              fill
              className="min-h-full min-w-full object-cover opacity-50 "
            />
          </div>
        </div>
      </div>
    </>
  );
}

export default ToursSection;