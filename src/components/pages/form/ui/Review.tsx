import { FormDataSchema } from "@/lib/schema";
import { durationInDays } from "@/lib/utils";
import z from "zod";

type Inputs = z.infer<typeof FormDataSchema>;

function Review({ data, weather }: {data: Inputs, weather:boolean}) {
  const userName = data.userName;
  const city = data.city;
  const country = data.country;
  const nationality = data.nationality;
  const type = data.type;
  const age = data.age;
  const budget = data.budget;
  const luggageSize = data.luggageSize;
  const transport = data.transport;
  const accommodation = data.accommodation;
  const interests = data.interests;
  const note = data.note;
  const displayDuration = durationInDays(data.startDate, data.endDate);

  return (
    <>
      <div className="grid grid-cols-2 lg:mt-10 mt-4 gap-y-1">
        <div>
          <small>Name</small>
          <p className="sm:text-md text-xs uppercase lg:text-lg">{userName}</p>
        </div>

        <div>
          <small>Age</small>
          <p className="sm:text-md text-xs uppercase lg:text-lg">{age}</p>
        </div>

        <div>
          <small>Nationality</small>
          <p className="sm:text-md text-xs uppercase lg:text-lg">
            {nationality}
          </p>
        </div>

        <div>
          <small>Destination</small>
          <p className="sm:text-md text-xs uppercase lg:text-lg">
            {city}, {country}
          </p>
        </div>

        <div>
          <small>Trip Type</small>
          <p className="sm:text-md text-xs uppercase lg:text-lg">{type}</p>
        </div>

        <div>
          <small>Luggage Size</small>
          <p className="sm:text-md text-xs uppercase lg:text-lg">
            {luggageSize}
          </p>
        </div>

        <div>
          <small>Budget</small>
          <p className="sm:text-md text-xs uppercase lg:text-lg">{budget}</p>
        </div>

        <div>
          <small>Transport</small>
          <p className="sm:text-md text-xs uppercase lg:text-lg">{transport}</p>
        </div>

        <div>
          <small>Accommodation</small>
          <p className="sm:text-md text-xs uppercase lg:text-lg">
            {accommodation}
          </p>
        </div>

        <div>
          <small>Duration</small>
          <p className="sm:text-md text-xs uppercase lg:text-lg">
            {weather ? `7 days based on weather forecast` : displayDuration > 1 ? `${displayDuration} days ` : `${displayDuration} day`}
          </p>
        </div>

        <div className=" ">
          <small>Interests</small>
          {interests.map((interest: string) => (
            <p
              className=" sm:text-md text-xs uppercase lg:text-lg"
              key={interest}
            >
              <span>{interest}</span>
            </p>
          ))}
        </div>

        <div className="">
          <small>Notes</small>
          <p className="sm:text-md text-xs uppercase lg:text-lg">
            {note ? note : "--"}
          </p>
        </div>
        
      </div>
    </>
  );
}

export default Review;
