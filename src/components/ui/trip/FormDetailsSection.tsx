import { Trip } from "@prisma/client";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import Image from "next/image";

function FormDetailsSection({ trip }: { trip: Trip }) {
  dayjs.extend(duration);
  const startDate = dayjs("2024-04-08");
  const endDate = dayjs("2024-04-15");
  const tripDuration = endDate.diff(startDate);
  const durationInDays = dayjs.duration(tripDuration).asDays();

  return (
    <>
      <div className=" grid h-[90%] w-[90%] grid-cols-none grid-rows-2 shadow-2xl lg:h-[80%] lg:w-[80%] lg:grid-cols-2 lg:grid-rows-none ">
        <div className=" grid grid-cols-2  bg-gradient-to-tr from-gallery-50  to-gallery-50 p-8 lg:p-12 ">
          <div>
            <small>Name</small>
            <p className="sm:text-md text-xs uppercase lg:text-lg">
              {trip?.userName}
            </p>
          </div>

          <div className="">
            <div>
              <small>Destination</small>
              <p className="sm:text-md text-xs uppercase lg:text-lg">
                {trip?.city}, {trip?.country}
              </p>
              <div className=" mb-4  h-[60px] w-[80px] self-start lg:h-[80px] lg:w-[100px] ">
                <Image
                  src={trip?.flagUrl ?? ""}
                  alt="city"
                  blurDataURL={trip?.placeholder ?? ""}
                  placeholder="blur"
                  height={200}
                  width={200}
                  className="object-cover  mt-1"
                />
              </div>
            </div>
          </div>

          <section className="-mt-[6.4rem] flex flex-col gap-2 lg:-mt-[19.5rem]">
            <div>
            <div>
              <small>Age</small>
              <p className="sm:text-md text-xs uppercase lg:text-lg">
                {trip?.age}
              </p>
            </div>
              <small>Nationality</small>
              <p className="sm:text-md text-xs uppercase lg:text-lg">
                {trip?.nationality}
              </p>
            </div>


            <div>
              <small>Trip Type</small>
              <p className="sm:text-md text-xs uppercase lg:text-lg">
                {trip?.type}
              </p>
            </div>
            <div>
              <small>Budget</small>
              <p className="sm:text-md text-xs uppercase lg:text-lg">
                {trip?.budget}
              </p>
            </div>

            <div>
              <small>Transport</small>
              <p className="sm:text-md text-xs uppercase lg:text-lg">
                {trip?.transport}
              </p>
            </div>


          </section>

          <section className="-mt-[3.2rem] lg:-mt-[16rem] flex flex-col gap-2">
            <div>
              <small>Duration</small>
              <p className="sm:text-md text-xs uppercase lg:text-lg">
                {trip.weatherForecast
                  ? `7 days weather forecast`
                  : `${durationInDays} days`}
              </p>
              <div>
                <small>Accommodation</small>
                <p className="sm:text-md text-xs uppercase lg:text-lg">
                  {trip?.accommodation}
                </p>
              </div>
            </div>
            <div className=" ">
              <small>Interests</small>
              {trip.interests.map((interest) => (
                <p
                  className=" sm:text-md text-xs uppercase lg:text-lg"
                  key={interest}
                >
                  <p>{interest}</p>
                </p>
              ))}
            </div>

            <div className="">
              <small>Notes</small>
              <p className="uppercase text-xs sm:text-md lg:text-lg">
                {trip?.note ? trip.note : "--"}
              </p>
            </div>
          </section>
        </div>

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
      </div>
    </>
  );
}

export default FormDetailsSection;