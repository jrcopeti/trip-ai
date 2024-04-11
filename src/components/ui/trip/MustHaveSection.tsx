import type { Trip } from "@prisma/client";
import Image from "next/image";
import travelIcons from "@/assets/travelicons.png";

function MustHaveSection({ trip }: { trip: Trip }) {
  return (
    <>
      <div className=" absolute h-[90%] w-[90%] lg:h-[80%] lg:w-[80%] ">
        <div className="grid grid-cols-[1fr,2fr] items-center gap-6 rounded-xl text-center sm:text-start md:gap-12  ">
          <h1 className="bg-gallery-50/40 p-6 text-3xl font-extrabold capitalize text-shark-950 shadow-xl lg:text-4xl xl:text-5xl">
            Your Must Have items
          </h1>
          <div className="grid max-w-[30rem] grid-cols-2 gap-4 rounded-md  lg:gap-4 xl:gap-10 ">
            {(trip?.mustHave as string[])?.map((item, i) => (
              <ul className=" bg-gallery-50/40  p-5" key={i}>
                <li className="text-md max-h-fit font-semibold text-shark-950 md:text-lg lg:text-2xl 2xl:text-3xl first-letter:uppercase">
                  {item}
                </li>
              </ul>
            ))}

            {(trip?.requiredItems as string[])?.map((item, i) => (
              <ul className=" bg-gallery-50/40   p-5" key={i}>
                <li className="text-md max-h-fit font-semibold text-cabaret-800 md:text-lg lg:text-2xl 2xl:text-3xl first-letter:uppercase  ">
                  {item}
                </li>
              </ul>
            ))}
          </div>
          <div className=" title-tours absolute -z-10 h-[80dvw] w-[80dvw] translate-x-[30px] translate-y-[330px] sm:h-[400px] sm:w-[400px] sm:translate-x-[30px] sm:translate-y-[300px]    ">
            <Image
              src={travelIcons}
              alt="plane"
              fill
              className=" min-h-full min-w-full object-cover opacity-50 "
            />
          </div>
        </div>
      </div>
    </>
  );
}

export default MustHaveSection;
