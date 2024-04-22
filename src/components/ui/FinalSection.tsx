import { useRouter } from "next/navigation";
import { Trip } from "@prisma/client";
import { Button } from "@nextui-org/react";
import Image from "next/image";
import image9 from "@/assets/homepage/9.jpg";
import { defaultPlaceholder } from "@/lib/utils";

function FinalSection({ trip }: { trip: Trip }) {
  const router = useRouter();
  return (
    <>
      <div className="final-card grid h-[90%] w-[90%] grid-cols-none grid-rows-2 shadow-xl lg:h-[80%] lg:w-[80%] lg:grid-cols-2 lg:grid-rows-none ">
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
        <div className="bg-gallery-50/50 p-8 sm:p-10 ">
          <Button
            onClick={router.back}
            className="bg-neptune-500 p-6 text-xl text-gallery-50"
          >
            Back
          </Button>
        </div>
      </div>
    </>
  );
}

export default FinalSection;
