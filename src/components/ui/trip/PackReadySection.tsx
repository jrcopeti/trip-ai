import { Trip } from "@prisma/client";

import dayjs from "dayjs";

function PackReadySection({ trip }: { trip: Trip }) {
  const startDate = dayjs(trip?.startDate).format("DD.MM.YYYY");
  const endDate = dayjs(trip?.endDate).format("DD.MM.YYYY");

  return (
    <div className='flex flex-col'>
      <h1 className="pack-ready text-center text-4xl font-extrabold capitalize text-shark-100 md:text-6xl">
        We have your pack ready
      </h1>
      <h2 className=' p-4 mt-1 text-3xl text-gallery-950 font-semibold'>
        {trip.weatherForecast
          ? "Based on the weather"
          : `From ${startDate} to ${endDate}`}
      </h2>
    </div>
  );
}

export default PackReadySection;
