import { Trip } from "@prisma/client";

import dayjs from "dayjs";
import Image from "next/image";
import stamps from "@/assets/travel/stamps.png";

function PackReadySection({ trip }: { trip: Trip }) {
  const startDate = dayjs(trip?.startDate).format("DD.MM.YYYY");
  const endDate = dayjs(trip?.endDate).format("DD.MM.YYYY");

  return (
    <div className='flex flex-col flex-start p-6 bg-gallery-50/40 shadow-xl'>
      <h1 className=" text-center text-4xl font-extrabold capitalize text-tuna-900 md:text-6xl">
        We have your pack ready
      </h1>
      <h2 className=' p-4 mt-1 text-3xl text-tuna-600 font-semibold'>
        {trip.weatherForecast
          ? "Based on the weather"
          : `From ${startDate} to ${endDate}`}
      </h2>
      <div className='stamps absolute md:h-[400px] md:w-[500px] h-[300px] w-[300px] -z-10 -translate-y-[80px] translate-x-[170px] md:-translate-y-[110px] md:translate-x-[300px] '>

      <Image src={stamps} alt="stamps" fill className="object-contain  " />
      </div>
    </div>
  );
}

export default PackReadySection;
