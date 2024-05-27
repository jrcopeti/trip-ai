import { useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { useSingleSavedTrip } from "@/hooks/useSingleSavedTrip";
import { useLocomotiveScroll } from "@/hooks/useLocomotiveScroll";
import { Button, ButtonGroup } from "@nextui-org/react";
import defaultImage5 from "@/assets/homepage/9.jpg";
import GridContainer from "../ui/GridContainer";
import { defaultPlaceholder } from "@/lib/constants";

function FinalSection() {
  const scrollRef = useRef(null);
  useLocomotiveScroll(scrollRef);

  const params = useParams();
  const { trip } = useSingleSavedTrip({ params });
  const router = useRouter();

  return (
    <>
      <GridContainer animationClass="final-card">
        <div className="relative h-full w-full ">
          <Image
            src={trip?.image5 ?? defaultImage5}
            alt="city"
            blurDataURL={trip?.placeholder ?? defaultPlaceholder}
            placeholder="blur"
            priority
            fill
            className="object-cover"
          />
        </div>

        <div
          ref={scrollRef}
          className="min-h-full overflow-auto bg-gallery-50/70 p-6 lg:p-8"
        >
          <div className="flex flex-col gap-3">
            <h2 className="text-2xl font-bold text-tuna-900 lg:text-3xl">
              Good to know!
            </h2>
            <p className="text-sm font-semibold text-tuna-600 xs:text-base sm:text-lg lg:text-xl">
              {trip?.tip}{" "}
            </p>
          </div>
          <ButtonGroup>
            <Button
              onClick={router.back}
              className="mt-2 bg-neptune-500 text-base font-semibold text-gallery-50 xs:mt-10 xs:p-6 xs:text-xl"
            >
              Back
            </Button>
            <Button
              onClick={() => router.push("/form")}
              className="mt-2 bg-neptune-600 text-base text-gallery-50 xs:mt-10 xs:p-6 xs:text-xl"
            >
              Get another trip
            </Button>
          </ButtonGroup>
        </div>
      </GridContainer>
    </>
  );
}

export default FinalSection;
