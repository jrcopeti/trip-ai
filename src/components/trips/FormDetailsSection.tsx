import dayjs from "dayjs";
import Image from "next/image";
import {
  defaultPlaceholder,
  displayDuration,
  durationInDays,
} from "@/lib/utils";
import image4 from "@/assets/homepage/4.jpg";
import { FormDetailsSectionProps } from "@/types";

function FormDetailsSection({
  trip,
  imageData,
  formData,
}: FormDetailsSectionProps) {
  const startDate = dayjs(trip?.startDate || formData?.startDate);
  const endDate = dayjs(trip?.endDate || formData?.endDate);

  const durationDays = durationInDays(startDate, endDate);
  const duration = displayDuration(durationDays);

  return (
    <>
      <div className="form-details grid h-[90%] w-[90%] grid-cols-1 grid-rows-2  shadow-xl lg:h-[80%] lg:w-[80%] lg:grid-cols-2 lg:grid-rows-1">
        <div className="bg-gallery-50/70 p-2 sm:p-2 lg:px-4 lg:py-5">
          <div className="-mb-4 h-[40px] w-[60px] text-tuna-900 xs:h-[60px] xs:w-[80px] lg:h-[80px] lg:w-[100px]">
            <Image
              src={(trip?.flagUrl || formData?.flagUrl) ?? ""}
              alt="country flag"
              height={200}
              width={200}
              className="object-cover"
            />
          </div>
          <div className="grid grid-cols-3 gap-x-2 gap-y-2">
            <div className="mt-2">
              <small className="text-[0.5rem] text-tuna-900 xs:text-xs">
                Destination
              </small>
              <p className="sm:text-md text-[0.5rem] uppercase text-tuna-600 xs:text-xs lg:text-lg">
                {trip?.city || formData?.city},{" "}
                {trip?.country || formData?.country}
              </p>
            </div>

            <div>
              <small className="text-[0.5rem] text-tuna-900 xs:text-xs">
                Nationality
              </small>
              <p className="sm:text-md text-[0.5rem] uppercase text-tuna-600 xs:text-xs lg:text-lg">
                {trip?.nationality || formData?.nationality}
              </p>
            </div>
            <div className="mt-2">
              <small className="text-[0.5rem] text-tuna-900 xs:text-xs">
                Name
              </small>
              <p className="sm:text-md text-[0.5rem] uppercase text-tuna-600 xs:text-xs lg:text-lg">
                {trip?.userName || formData?.userName}
              </p>
            </div>

            <div>
              <small className="text-[0.5rem] text-tuna-900 xs:text-xs">
                Trip Type
              </small>
              <p className="sm:text-md text-[0.5rem] uppercase text-tuna-600 xs:text-xs lg:text-lg">
                {trip?.type || formData?.type}
              </p>
            </div>

            <div>
              <small className="text-[0.5rem] text-tuna-900 xs:text-xs">
                Age
              </small>
              <p className="sm:text-md text-[0.5rem] uppercase text-tuna-600 xs:text-xs lg:text-lg">
                {trip?.age || formData?.age}
              </p>
            </div>

            <div>
              <small className="text-[0.5rem] text-tuna-900 xs:text-xs">
                Budget
              </small>
              <p className="sm:text-md text-[0.5rem] uppercase text-tuna-600 xs:text-xs lg:text-lg">
                {trip?.budget || formData?.budget}
              </p>
            </div>

            <div>
              <small className="text-[0.5rem] text-tuna-900 xs:text-xs">
                Transport
              </small>
              <p className="sm:text-md text-[0.5rem] uppercase text-tuna-600 xs:text-xs lg:text-lg">
                {trip?.transport || formData?.transport}
              </p>
            </div>

            <div>
              <small className="text-[0.5rem] text-tuna-900 xs:text-xs">
                LugaggeSize
              </small>
              <p className="sm:text-md text-[0.5rem] uppercase text-tuna-600 xs:text-xs lg:text-lg">
                {trip?.luggageSize || formData?.luggageSize}
              </p>
            </div>

            <div className=" col-auto">
              <small className="text-[0.5rem] text-tuna-900 xs:text-xs">
                Duration
              </small>
              <p className="sm:text-md text-[0.5rem] uppercase text-tuna-600 xs:text-xs lg:text-lg">
                {trip?.weatherForecast || formData?.weatherForecast
                  ? `7 days based on weather`
                  : duration}
              </p>
            </div>

            <div>
              <small className="text-[0.5rem] text-tuna-900 xs:text-xs">
                Accommodation
              </small>
              <p className="sm:text-md text-[0.5rem] uppercase text-tuna-600 xs:text-xs lg:text-lg">
                {trip?.accommodation || formData?.accommodation}
              </p>
            </div>

            <div>
              <small className="text-[0.5rem] text-tuna-900 xs:text-xs">
                Notes
              </small>
              <p className="sm:text-md text-[0.5rem] uppercase text-tuna-600 xs:text-xs lg:text-lg">
                {trip?.note || formData?.note || "--"}
              </p>
            </div>

            <div>
              <small className="text-[0.5rem] text-tuna-900 xs:text-xs">
                Interests
              </small>
              {(trip?.interests || formData?.interests).map((interest) => (
                <p
                  className=" sm:text-md text-[0.5rem] uppercase text-tuna-600 xs:text-xs lg:text-lg"
                  key={interest}
                >
                  <span>{interest}</span>
                </p>
              ))}
            </div>
          </div>
        </div>

        <div className="relative h-full w-full">
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
            className="object-cover"
          />
        </div>
      </div>
    </>
  );
}

export default FormDetailsSection;
