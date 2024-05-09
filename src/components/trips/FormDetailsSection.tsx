import { useRef } from "react";
import Image from "next/image";
import { useParams } from "next/navigation";
import { useLocomotiveScroll } from "@/hooks/useLocomotiveScroll";
import { useSingleSavedTrip } from "@/hooks/useSingleSavedTrip";
import { useImage } from "@/hooks/useImage";
import { useFormData } from "@/hooks/useFormData";
import dayjs from "dayjs";
import defaultImage4 from "@/assets/homepage/4.jpg";
import GridContainer from "../ui/GridContainer";
import { defaultPlaceholder } from "@/lib/constants";
import { displayDuration, durationInDays } from "@/lib/utils";

function FormDetailsSection() {
  const scrollRef = useRef(null);
  useLocomotiveScroll(scrollRef);

  const params = useParams();
  const { trip } = useSingleSavedTrip({ params });
  const { imageData } = useImage();
  const { formData } = useFormData();

  const flag = trip?.flagUrl || formData?.flagUrl;
  const city = trip?.city || formData?.city;
  const country = trip?.country || formData?.country;
  const nationality = trip?.nationality || formData?.nationality;
  const userName = trip?.userName || formData?.userName;
  const tripType = trip?.type || formData?.type;
  const age = trip?.age || formData?.age;
  const budget = trip?.budget || formData?.budget;
  const transport = trip?.transport || formData?.transport;
  const lugaggeSize = trip?.luggageSize || formData?.luggageSize;
  const weatherForecast = trip?.weatherForecast || formData?.weatherForecast;
  const accommodation = trip?.accommodation || formData?.accommodation;
  const note = trip?.note || formData?.note;
  const interests = trip?.interests || formData?.interests;

  const startDate = dayjs(trip?.startDate || formData?.startDate);
  const endDate = dayjs(trip?.endDate || formData?.endDate);
  const durationDays = durationInDays(startDate, endDate);
  const duration = displayDuration(durationDays);

  const image4 = trip?.image4 || imageData?.tripImage4;
  const placeholder = trip?.placeholder || imageData?.placeholder;

  return (
    <>
      <GridContainer animationClass="form-details">
        <div
          ref={scrollRef}
          className=" min-h-full overflow-auto bg-gallery-50/70 p-2 lg:px-4 lg:py-5"
        >
          <div className="-mb-4 h-[40px] w-[60px] text-tuna-900 xs:h-[60px] xs:w-[80px] lg:h-[80px] lg:w-[100px]">
            <Image
              src={flag ?? ""}
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
              <p className="text-[0.5rem] text-xs uppercase text-tuna-600 xs:text-sm sm:text-base lg:text-lg">
                {city}, {country}
              </p>
            </div>

            <div>
              <small className="text-[0.5rem] text-tuna-900 xs:text-xs">
                Nationality
              </small>
              <p className="text-[0.5rem] text-xs uppercase text-tuna-600 xs:text-sm sm:text-base lg:text-lg">
                {nationality}
              </p>
            </div>
            <div className="mt-2">
              <small className="text-[0.5rem] text-tuna-900 xs:text-xs">
                Name
              </small>
              <p className="text-[0.5rem] text-xs uppercase text-tuna-600 xs:text-sm sm:text-base lg:text-lg">
                {userName}
              </p>
            </div>

            <div>
              <small className="text-[0.5rem] text-tuna-900 xs:text-xs">
                Trip Type
              </small>
              <p className="text-[0.5rem] text-xs uppercase text-tuna-600 xs:text-sm sm:text-base lg:text-lg">
                {tripType}
              </p>
            </div>

            <div>
              <small className="text-[0.5rem] text-tuna-900 xs:text-xs">
                Age
              </small>
              <p className="text-[0.5rem] text-xs uppercase text-tuna-600 xs:text-sm sm:text-base lg:text-lg">
                {age}
              </p>
            </div>

            <div>
              <small className="text-[0.5rem] text-tuna-900 xs:text-xs">
                Budget
              </small>
              <p className="text-[0.5rem] text-xs uppercase text-tuna-600 xs:text-sm sm:text-base lg:text-lg">
                {budget}
              </p>
            </div>

            <div>
              <small className="text-[0.5rem] text-tuna-900 xs:text-xs">
                Transport
              </small>
              <p className="text-[0.5rem] text-xs uppercase text-tuna-600 xs:text-sm sm:text-base lg:text-lg">
                {transport}
              </p>
            </div>

            <div>
              <small className="text-[0.5rem] text-tuna-900 xs:text-xs">
                LugaggeSize
              </small>
              <p className="text-[0.5rem] text-xs uppercase text-tuna-600 xs:text-sm sm:text-base lg:text-lg">
                {lugaggeSize}
              </p>
            </div>

            <div className=" col-auto">
              <small className="text-[0.5rem] text-tuna-900 xs:text-xs">
                Duration
              </small>
              <p className="text-[0.5rem] text-xs uppercase text-tuna-600 xs:text-sm sm:text-base lg:text-lg">
                {weatherForecast ? `5 days based on weather` : duration}
              </p>
            </div>

            <div>
              <small className="text-[0.5rem] text-tuna-900 xs:text-xs">
                Accommodation
              </small>
              <p className="text-[0.5rem] text-xs uppercase text-tuna-600 xs:text-sm sm:text-base lg:text-lg">
                {accommodation}
              </p>
            </div>

            <div>
              <small className="text-[0.5rem] text-tuna-900 xs:text-xs">
                Notes
              </small>
              <p className="text-[0.5rem] text-xs uppercase text-tuna-600 xs:text-sm sm:text-base lg:text-lg">
                {note || "--"}
              </p>
            </div>

            <div>
              <small className="text-[0.5rem] text-tuna-900 xs:text-xs">
                Interests
              </small>
              {interests.map((interest) => (
                <p
                  className=" text-[0.5rem] text-xs uppercase text-tuna-600 xs:text-sm sm:text-base lg:text-lg"
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
            src={image4 ?? defaultImage4}
            alt="city"
            blurDataURL={placeholder ?? defaultPlaceholder}
            placeholder="blur"
            priority
            fill
            className="object-cover"
          />
        </div>
      </GridContainer>
    </>
  );
}

export default FormDetailsSection;
