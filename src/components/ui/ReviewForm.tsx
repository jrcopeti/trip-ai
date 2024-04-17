import { FormDataSchema } from "@/lib/schema";
import { durationInDays, displayDuration } from "@/lib/utils";
import z from "zod";

type Inputs = z.infer<typeof FormDataSchema>;

function ReviewForm({
  reviewFormData,
  weather,
}: {
  reviewFormData: Inputs;
  weather: boolean;
}) {
  const {
    userName,
    city,
    country,
    nationality,
    type,
    age,
    budget,
    luggageSize,
    transport,
    accommodation,
    interests,
    note,
    startDate,
    endDate,
  } = reviewFormData;

  const durationDays = durationInDays(startDate, endDate);
  const duration = displayDuration(durationDays);

  return (
    <>
      <div className="mt-4 grid grid-cols-2 gap-y-1 lg:mt-10">
        <div>
          <small className="text-tuna-600">Name</small>
          <p className="sm:text-md text-xs uppercase lg:text-lg">{userName}</p>
        </div>

        <div>
          <small className="text-tuna-600">Age</small>
          <p className="sm:text-md text-xs uppercase lg:text-lg">{age}</p>
        </div>

        <div>
          <small className="text-tuna-600">Nationality</small>
          <p className="sm:text-md text-xs uppercase lg:text-lg">
            {nationality}
          </p>
        </div>

        <div>
          <small className="text-tuna-600">Destination</small>
          <p className="sm:text-md text-xs uppercase lg:text-lg">
            {city}, {country}
          </p>
        </div>

        <div>
          <small className="text-tuna-600">Trip Type</small>
          <p className="sm:text-md text-xs uppercase lg:text-lg">{type}</p>
        </div>

        <div>
          <small className="text-tuna-600">Luggage Size</small>
          <p className="sm:text-md text-xs uppercase lg:text-lg">
            {luggageSize}
          </p>
        </div>

        <div>
          <small className="text-tuna-600">Budget</small>
          <p className="sm:text-md text-xs uppercase lg:text-lg">{budget}</p>
        </div>

        <div>
          <small className="text-tuna-600">Transport</small>
          <p className="sm:text-md text-xs uppercase lg:text-lg">{transport}</p>
        </div>

        <div>
          <small className="text-tuna-600">Accommodation</small>
          <p className="sm:text-md text-xs uppercase lg:text-lg">
            {accommodation}
          </p>
        </div>

        <div>
          <small className="text-tuna-600">Duration</small>
          <p className="sm:text-md text-xs uppercase lg:text-lg">
            {weather ? `7 days based on weather forecast` : duration}
          </p>
        </div>

        <div>
          <small className="text-tuna-600">Interests</small>
          {interests.map((interest: string) => (
            <p
              className=" sm:text-md text-xs uppercase lg:text-lg"
              key={interest}
            >
              <span>{interest}</span>
            </p>
          ))}
        </div>

        <div className="text-tuna-600">
          <small>Notes</small>
          <p className="sm:text-md text-xs uppercase lg:text-lg">
            {note ? note : "--"}
          </p>
        </div>
      </div>
    </>
  );
}

export default ReviewForm;
