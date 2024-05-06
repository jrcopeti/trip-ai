import { Trip } from "@prisma/client";

import dayjs from "dayjs";
import Image from "next/image";
import stamps from "@/assets/travel/stamps.png";
import stamps2 from "@/assets/travel/stamps2.png";
import stamps3 from "@/assets/travel/stamps3.png";
import type { PackReadySectionProps } from "@/types";

function PackReadySection({ trip, formData }: PackReadySectionProps) {
  const startDate = dayjs(trip?.startDate || formData?.startDate).format(
    "DD.MM.YYYY",
  );
  const endDate = dayjs(trip?.endDate || formData?.endDate).format(
    "DD.MM.YYYY",
  );

  return (
    <div className="flex-start flex flex-col rounded-sm bg-gallery-50/40 p-6 shadow-xl">
      <h1 className=" pack-ready text-center text-2xl font-extrabold capitalize text-tuna-900 xs:text-3xl sm:text-4xl md:text-6xl">
        We have your pack ready
      </h1>
      <h2 className="mt-1 p-4 text-xl font-semibold text-tuna-600 xs:text-2xl sm:text-3xl">
        {trip?.weatherForecast || formData?.weatherForecast
          ? "Based on the weather"
          : `From ${startDate} to ${endDate}`}
      </h2>
      <div className="stamps absolute -z-10 h-[350px] w-[350px] -translate-y-[87px] translate-x-[120px] md:h-[450px] md:w-[550px] md:-translate-y-[133px] md:translate-x-[400px]">
        <Image src={stamps2} alt="stamps" fill className="object-contain" />
      </div>
      <div className="stamps absolute -z-10 h-[300px] w-[250px] -translate-x-[80px] translate-y-[50px] md:h-[300px] md:w-[400px] md:-translate-x-[200px] md:translate-y-[20px]">
        <Image src={stamps3} alt="stamps" fill className="object-contain" />
      </div>
    </div>
  );
}

export default PackReadySection;
