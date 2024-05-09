import { useParams } from "next/navigation";
import { useSingleSavedTrip } from "@/hooks/useSingleSavedTrip";
import { useFormData } from "@/hooks/useFormData";
import Image from "next/image";
import dayjs from "dayjs";
import stamps2 from "@/assets/travel/stamps2.png";
import stamps3 from "@/assets/travel/stamps3.png";

function PackReadySection() {
  const params = useParams();
  const { trip } = useSingleSavedTrip({ params });
  const { formData } = useFormData();

  const startDate = dayjs(trip?.startDate || formData?.startDate).format(
    "DD.MM.YYYY",
  );
  const endDate = dayjs(trip?.endDate || formData?.endDate).format(
    "DD.MM.YYYY",
  );

  const weatherForecast = trip?.weatherForecast || formData?.weatherForecast;

  return (
    <div className="z-20 flex flex-col rounded-sm bg-gallery-50/40 p-6 shadow-xl">
      <h1 className="pack-ready text-center text-2xl font-extrabold capitalize text-tuna-900 xs:text-3xl sm:text-4xl md:text-6xl">
        We have your pack ready
      </h1>
      <div className="mt-1 p-4 text-xl font-semibold text-tuna-600 xs:text-2xl sm:text-3xl">
        {weatherForecast ? (
          <h2 className="flex flex-col">
            Based on the weather
            <small className="font-normal">
              From {startDate} to {endDate}
            </small>
          </h2>
        ) : (
          <h2>
            From {startDate} to {endDate}
          </h2>
        )}
      </div>
      <div className="stamps absolute -z-10 h-[350px] w-[350px] -translate-y-[87px] translate-x-[120px] md:h-[450px] md:w-[550px] md:-translate-y-[133px] md:translate-x-[400px]">
        <Image src={stamps2} alt="stamps" fill className="object-contain" />
      </div>
      <div className="stamps absolute -z-10 h-[300px] w-[250px] -translate-x-[80px] translate-y-[50px] md:h-[300px] md:w-[400px] md:-translate-x-[200px] md:translate-y-[20px]">
        <Image src={stamps3} alt="stamps" fill className="object-contain" />
      </div>
    </div>
  );
}

export default PackReadySection;
