import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { useSingleSavedTrip } from "@/hooks/useSingleSavedTrip";
import { Button } from "@nextui-org/react";
import image9 from "@/assets/homepage/9.jpg";
import GridContainer from "../ui/GridContainer";
import { defaultPlaceholder } from "@/lib/constants";

function FinalSection() {
  const params = useParams();
  const { trip } = useSingleSavedTrip({ params });
  const router = useRouter();

  return (
    <>
      <GridContainer animationClass="final-card">
        <div className="relative h-full w-full ">
          <Image
            src={trip?.image5 ?? image9}
            alt="city"
            blurDataURL={trip?.placeholder ?? defaultPlaceholder}
            placeholder="blur"
            priority
            fill
            className="object-cover"
          />
        </div>

        <div className="bg-gallery-50/70 p-6 lg:p-8">
          <div className="flex flex-col gap-3">
            <h2 className="text-2xl font-bold text-tuna-900 lg:text-3xl">
              Good to know!
            </h2>
            <p className="text-sm font-semibold text-tuna-600 xs:text-base sm:text-lg lg:text-xl">
              {trip?.tip}{" "}
            </p>
          </div>
          <Button
            onClick={router.back}
            className="mt-2 bg-neptune-500 text-base text-gallery-50 xs:mt-10 xs:p-6 xs:text-xl"
          >
            Back
          </Button>
        </div>
      </GridContainer>
    </>
  );
}

export default FinalSection;
