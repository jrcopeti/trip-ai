import { Trip } from "@prisma/client";

import dayjs from "dayjs";
import Image from "next/image";
import stamps from "@/assets/travel/stamps.png";
import stamps2 from "@/assets/travel/stamps2.png";
import stamps3 from "@/assets/travel/stamps3.png";

function PackReadySection({ trip }: { trip: Trip }) {
  const startDate = dayjs(trip?.startDate).format("DD.MM.YYYY");
  const endDate = dayjs(trip?.endDate).format("DD.MM.YYYY");

  return (
    <div className='flex flex-col flex-start p-6 bg-gallery-50/40 shadow-xl'>
      <h1 className=" pack-ready text-center text-2xl xs:text-3xl sm:text-4xl font-extrabold capitalize text-tuna-900 md:text-6xl">
        We have your pack ready
      </h1>
      <h2 className='p-4 mt-1 text-xl xs:text-2xl sm:text-3xl text-tuna-600 font-semibold'>
        {/* TODO: fix  */}
        {trip?.weatherForecast
          ? "Based on the weather"
          : `From ${startDate} to ${endDate}`}
      </h2>
      <div className='stamps absolute md:h-[450px] md:w-[550px] h-[350px] w-[350px] -z-10 -translate-y-[87px] translate-x-[120px] md:-translate-y-[133px] md:translate-x-[400px] '>

      <Image src={stamps2} alt="stamps" fill className="object-contain" />
      </div>
      <div className='stamps absolute md:h-[300px] md:w-[400px] h-[300px] w-[250px] -z-10 translate-y-[50px] -translate-x-[80px] md:translate-y-[20px] md:-translate-x-[200px]'>
        <Image src={stamps3} alt="stamps" fill className="object-contain" />
      </div>
    </div>
  );
}

export default PackReadySection;
