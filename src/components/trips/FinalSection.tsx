import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@nextui-org/react";
import image9 from "@/assets/homepage/9.jpg";
import { defaultPlaceholder } from "@/lib/utils";
import { Trip } from "@prisma/client";

function FinalSection({ trip }: { trip: Trip }) {
  const router = useRouter();
  return (
    <>
      <div className="final-card grid h-[90%] w-[90%] grid-cols-1 grid-rows-2 overflow-auto shadow-xl lg:h-[80%] lg:w-[80%] lg:grid-cols-2 lg:grid-rows-1">
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

        <div className="bg-gallery-50/70 p-8 sm:p-10">
          <div className="flex flex-col gap-3">
            <h2 className="text-3xl font-bold text-tuna-900">Good to know!</h2>
            <p className="text-lg font-semibold text-tuna-600 lg:text-xl">
              {trip?.tip}{" "}
            </p>
          </div>
          <Button
            onClick={router.back}
            className="mt-10 bg-neptune-500 p-6 text-xl text-gallery-50"
          >
            Back
          </Button>
        </div>
      </div>
    </>
  );
}

export default FinalSection;
