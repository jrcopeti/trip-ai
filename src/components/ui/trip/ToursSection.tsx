import type { Trip } from "@prisma/client";

function ToursSection({ trip }: { trip: Trip }) {
  return (
    <>
      <div className=" absolute h-[90%] w-[90%] p-4   lg:h-[80%] lg:w-[80%] lg:p-12">
        <div className="grid grid-cols-1 items-center gap-4 rounded-xl  p-2 text-center sm:text-start lg:p-4 xl:grid-cols-[1fr,auto]  ">
          <h1 className=" title-tours rounded-xl  bg-gallery-50/50 p-4 text-3xl font-extrabold capitalize text-shark-950 md:text-5xl">
            Your suggested tours
          </h1>
          <div className=" grid grid-cols-1 gap-4 rounded-md p-4 backdrop-blur-sm lg:gap-6">
            {(trip?.tours as string[])?.map((tour, i) => (
              <ul
                className="tour-item grid grid-cols-1 rounded-xl bg-gallery-50/50 p-4"
                key={i}
              >
                <li className="text-sm font-semibold text-shark-900 lg:text-xl xl:text-2xl ">
                  <span className="font-bold text-neptune-600">{i + 1}.</span>
                  &nbsp;{tour}
                </li>
              </ul>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

export default ToursSection;
