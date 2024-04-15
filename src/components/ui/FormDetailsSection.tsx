import { Trip } from "@prisma/client";

import Image from "next/image";
import { durationInDays } from "@/lib/utils";
import dayjs from "dayjs";
import { FinalDataTypes, ImageDataTypes } from "@/types";
import image4 from "@/assets/4.jpg";

function FormDetailsSection({
  trip,
  imageData,
  formData,
}: {
  trip: Trip;
  imageData?: ImageDataTypes;
  formData?: FinalDataTypes;
}) {
  const startDate = dayjs(trip?.startDate);
  const endDate = dayjs(trip?.endDate);
  const displayDuration = durationInDays(startDate, endDate);

  return (
    <>
      <div className="form-details grid h-[90%] w-[90%] grid-cols-none grid-rows-2 shadow-2xl lg:h-[80%] lg:w-[80%] lg:grid-cols-2 lg:grid-rows-none ">
        <div className=" grid grid-cols-2  bg-gradient-to-tr from-gallery-50  to-gallery-50 p-6 lg:p-10 ">
          <div className=" -mb-10 h-[60px] w-[80px] lg:h-[80px] lg:w-[100px] ">
            <Image
              src={(trip?.flagUrl || formData?.flagUrl) ?? ""}
              alt="city"
              height={200}
              width={200}
              className="mt-1 object-cover"
            />
          </div>

          <div>
            <small>Name</small>
            <p className="sm:text-md text-xs uppercase lg:text-lg">
              {trip?.userName}
            </p>
          </div>

          <div>
            <small>Destination</small>
            <p className="sm:text-md text-xs uppercase lg:text-lg">
              {trip?.city || formData?.city},{" "}
              {trip?.country || formData?.country}
            </p>
          </div>

          <div>
            <small>Nationality</small>
            <p className="sm:text-md text-xs uppercase lg:text-lg">
              {trip?.nationality || formData?.nationality}
            </p>
          </div>

          <div>
            <small>Trip Type</small>
            <p className="sm:text-md text-xs uppercase lg:text-lg">
              {trip?.type || formData?.type}
            </p>
          </div>
          <div>
            <small>Age</small>
            <p className="sm:text-md text-xs uppercase lg:text-lg">
              {trip?.age || formData?.age}
            </p>
          </div>

          <div>
            <small>Budget</small>
            <p className="sm:text-md text-xs uppercase lg:text-lg">
              {trip?.budget || formData?.budget}
            </p>
          </div>

          <div>
            <small>Transport</small>
            <p className="sm:text-md text-xs uppercase lg:text-lg">
              {trip?.transport || formData?.transport}
            </p>
          </div>

          <div>
            <small>LugaggeSize</small>
            <p className="sm:text-md text-xs uppercase lg:text-lg">
              {trip?.luggageSize || formData?.luggageSize}
            </p>
          </div>

          <div>
            <small>Duration</small>
            <p className="sm:text-md text-xs uppercase lg:text-lg">
              {trip.weatherForecast || formData?.weatherForecast
                ? `7 days based on weather forecast`
                : `${displayDuration} days`}
            </p>
          </div>

          <div>
            <small>Accommodation</small>
            <p className="sm:text-md text-xs uppercase lg:text-lg">
              {trip?.accommodation || formData?.accommodation}
            </p>
          </div>

          <div className="">
            <small>Notes</small>
            <p className="sm:text-md text-xs uppercase lg:text-lg">
              {trip?.note || formData?.note || "--"}
            </p>
          </div>

          <div className=" ">
            <small>Interests</small>
            {(trip?.interests || formData?.interests).map((interest) => (
              <p
                className=" sm:text-md text-xs uppercase lg:text-lg"
                key={interest}
              >
                <span>{interest}</span>
              </p>
            ))}
          </div>
        </div>

        <div className="relative h-full w-full ">
          <Image
            src={(trip?.image4 || imageData?.tripImage4) ?? image4}
            alt="city"
            blurDataURL={(trip?.placeholder || imageData?.placeholder) ?? ""}
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
