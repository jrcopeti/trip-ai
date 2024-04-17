import dayjs from "dayjs";
import Image from "next/image";
import {
  defaultPlaceholder,
  displayDuration,
  durationInDays,
} from "@/lib/utils";
import image4 from "@/assets/homepage/4.jpg";
import { Trip } from "@prisma/client";
import { FinalDataTypes, ImageDataTypes } from "@/types";

function FormDetailsSection({
  trip,
  imageData,
  formData,
}: {
  trip: Trip;
  imageData?: ImageDataTypes;
  formData?: FinalDataTypes;
}) {
  const startDate = dayjs(trip?.startDate || formData?.startDate);
  const endDate = dayjs(trip?.endDate || formData?.endDate);

  const durationDays = durationInDays(startDate, endDate);
  const duration = displayDuration(durationDays);

  return (
    <>
      <div className="form-details grid h-[90%] w-[90%] grid-cols-none grid-rows-2 shadow-xl lg:h-[80%] lg:w-[80%] lg:grid-cols-2 lg:grid-rows-none">
        <div className=" grid grid-cols-2  bg-gallery-50/50 p-6 lg:p-10 ">
          <div className=" -mb-10 h-[60px] w-[80px] text-tuna-900 lg:h-[80px] lg:w-[100px] ">
            <Image
              src={(trip?.flagUrl || formData?.flagUrl) ?? ""}
              alt="country flag"
              height={200}
              width={200}
              className="mt-1 object-cover"
            />
          </div>

          <div>
            <small className="text-tuna-600">Name</small>
            <p className="sm:text-md text-xs uppercase lg:text-lg">
              {trip?.userName || formData?.userName}
            </p>
          </div>

          <div>
            <small className="text-tuna-600">Destination</small>
            <p className="sm:text-md text-xs uppercase lg:text-lg">
              {trip?.city || formData?.city},{" "}
              {trip?.country || formData?.country}
            </p>
          </div>

          <div>
            <small className="text-tuna-600">Nationality</small>
            <p className="sm:text-md text-xs uppercase lg:text-lg">
              {trip?.nationality || formData?.nationality}
            </p>
          </div>

          <div>
            <small className="text-tuna-600">Trip Type</small>
            <p className="sm:text-md text-xs uppercase lg:text-lg">
              {trip?.type || formData?.type}
            </p>
          </div>
          <div>
            <small className="text-tuna-600">Age</small>
            <p className="sm:text-md text-xs uppercase lg:text-lg">
              {trip?.age || formData?.age}
            </p>
          </div>

          <div>
            <small className="text-tuna-600">Budget</small>
            <p className="sm:text-md text-xs uppercase lg:text-lg">
              {trip?.budget || formData?.budget}
            </p>
          </div>

          <div>
            <small className="text-tuna-600">Transport</small>
            <p className="sm:text-md text-xs uppercase lg:text-lg">
              {trip?.transport || formData?.transport}
            </p>
          </div>

          <div>
            <small className="text-tuna-600">LugaggeSize</small>
            <p className="sm:text-md text-xs uppercase lg:text-lg">
              {trip?.luggageSize || formData?.luggageSize}
            </p>
          </div>

          <div>
            <small className="text-tuna-600">Duration</small>
            <p className="sm:text-md text-xs uppercase lg:text-lg">
              {trip?.weatherForecast || formData?.weatherForecast
                ? `7 days based on weather forecast`
                : duration}
            </p>
          </div>

          <div>
            <small className="text-tuna-600">Accommodation</small>
            <p className="sm:text-md text-xs uppercase lg:text-lg">
              {trip?.accommodation || formData?.accommodation}
            </p>
          </div>

          <div>
            <small className="text-tuna-600">Notes</small>
            <p className="sm:text-md text-xs uppercase lg:text-lg">
              {trip?.note || formData?.note || "--"}
            </p>
          </div>

          <div>
            <small className="text-tuna-600">Interests</small>
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
            blurDataURL={
              (trip?.placeholder || imageData?.placeholder) ??
              defaultPlaceholder
            }
            placeholder="blur"
            priority
            fill
            className="object-cover "
          />
          π
        </div>
      </div>
    </>
  );
}

export default FormDetailsSection;
