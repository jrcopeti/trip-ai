import { durationInDays, displayDuration } from "@/lib/utils";
import type { ReviewFormProps } from "@/types";

function ReviewForm({ reviewFormData, weather }: ReviewFormProps) {
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
    requiredItems,
    accommodation,
    interests,
    note,
    startDate,
    endDate,
  } = reviewFormData;

  const durationDays = durationInDays(startDate, endDate);
  const duration = displayDuration(durationDays);
  const transformedRequiredItems =
    requiredItems?.map((requiredItem) => requiredItem.item) ?? [];

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
            {weather ? `7 days based on weather` : duration}
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

        {transformedRequiredItems.length > 0 && (
          <div>
            <small className="text-tuna-600">Required Items</small>
            {transformedRequiredItems.map((item, index) => (
              <p
                className="sm:text-md text-xs uppercase lg:text-lg"
                key={index}
              >
                {item}
              </p>
            ))}
          </div>
        )}

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
