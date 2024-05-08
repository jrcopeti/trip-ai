import { useParams } from "next/navigation";
import { useSingleSavedTrip } from "@/hooks/useSingleSavedTrip";
import Image from "next/image";
import plane from "@/assets/travel/plane.png";
import { useTripResponse } from "@/hooks/useTripResponse";

function ToursSection() {
  const params = useParams();
  const { trip } = useSingleSavedTrip({ params });
  const { tripData: response } = useTripResponse();

  const tours = (trip?.tours as string[]) || (response?.tours as string[]);

  return (
    <>
      <div className="absolute h-[90%] w-[90%] lg:h-[80%] lg:w-[80%]">
        <div className="grid grid-cols-1 items-center gap-4 rounded-xl text-center xl:grid-cols-[1fr,auto] xl:text-start">
          <h1 className="title-tours rounded-sm bg-gallery-50/40 p-6 text-xl font-extrabold capitalize text-tuna-900 shadow-xl xs:text-2xl lg:text-4xl xl:text-5xl">
            Your suggested tours
          </h1>
          <div className="grid max-w-full grid-cols-1 gap-3 lg:gap-4 xl:gap-6">
            {tours?.map((tour, i) => (
              <ul
                className="tour-item rounded-sm bg-gallery-50/40 p-2 shadow-md sm:p-3 lg:p-5"
                key={i}
              >
                <li className="max-h-fit text-xs font-semibold text-tuna-600 xs:text-base md:text-lg lg:text-lg 2xl:text-xl">
                  <span className="font-bold text-neptune-600">{i + 1}.</span>
                  &nbsp;{tour}
                </li>
              </ul>
            ))}
          </div>
          <div className="plane absolute -z-10 h-[100dvw] w-[100dvw] md:h-[600px] md:w-[600px]">
            <Image
              src={plane}
              alt="plane"
              fill
              className="min-h-full min-w-full object-cover opacity-50"
            />
          </div>
        </div>
      </div>
    </>
  );
}

export default ToursSection;
