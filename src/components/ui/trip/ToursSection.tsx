import type { Trip } from "@prisma/client";

function ToursSection({ trip}: { trip: Trip }) {
  return (
    <>
      <div className=" absolute h-[90%] w-[90%] p-4   lg:h-[80%] lg:w-[80%] lg:p-12">
        <div className="grid grid-cols-1 items-center gap-4 rounded-xl  p-2 lg:p-4 xl:grid-cols-[1fr,auto]  ">
          <h1 className=" title-tours rounded-xl  bg-shark-100/50 p-4 text-3xl font-extrabold capitalize text-shark-800 md:text-5xl">
            Your suggested tours
          </h1>
          <div className=" grid grid-cols-1 gap-4 rounded-md p-4 backdrop-blur-sm lg:gap-6">
            {(trip?.tours as string[])?.map((tour, i) => (
              <ul className="grid grid-cols-1" key={i}>
                <li className=" tour-item text-md font-semibold text-shark-200 lg:text-xl xl:text-2xl ">
                  {tour}
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
