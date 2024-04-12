import type { Trip } from "@prisma/client";
import Image from "next/image";
import travelIcons from "@/assets/travelicons.png";

function MustHaveSection({ trip }: { trip: Trip }) {
  return (
    <>
      {/* <div className=" absolute h-[90%] w-[90%] lg:h-[80%] lg:w-[80%] ">
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
      </div> */}

      <>
        <div className=" grid h-[90%] w-[90%] grid-cols-none grid-rows-2 shadow-2xl lg:h-[80%] lg:w-[80%] lg:grid-cols-2 lg:grid-rows-none ">
          <div className="relative h-full w-full ">
            <Image
              src={trip?.image3 ?? ""}
              alt="city"
              blurDataURL={trip?.placeholder ?? ""}
              placeholder="blur"
              priority
              fill
              className="object-cover shadow-xl "
            />
          </div>

          <div className=" bg-gradient-to-tr from-gallery-50  to-gallery-50 p-8 sm:p-16  ">
            <h2 className="text-4xl font-bold sm:mt-3 sm:text-4xl md:text-5xl">
              Your Must Have items
            </h2>
            <div className="grid max-w-[30rem] grid-cols-2 rounded-md lg:gap-y-4 mt-4 lg:mt-8 ">
              {(trip?.mustHave as string[])?.map((item, i) => (
                <ul className=" bg-gallery-50/40 p-2" key={i}>
                  <li className="max-h-fit text-lg font-semibold text-shark-950 first-letter:uppercase lg:text-2xl 2xl:text-3xl">
                    {item}
                  </li>
                </ul>
              ))}
              {(trip?.requiredItems as string[])?.map((item, i) => (
                <ul className=" bg-gallery-50/40   p-2" key={i}>
                  <li className="max-h-fit text-lg font-semibold text-cabaret-800 first-letter:uppercase lg:text-2xl 2xl:text-3xl  ">
                    {item}
                  </li>
                </ul>
              ))}
            </div>
          </div>
        </div>
      </>
    </>
  );
}

export default MustHaveSection;
