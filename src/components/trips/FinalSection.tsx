import { useRouter } from "next/navigation";
import { Trip } from "@prisma/client";
import { Button } from "@nextui-org/react";
import Image from "next/image";
import image9 from "@/assets/homepage/9.jpg";
import { defaultPlaceholder } from "@/lib/utils";
import CustomToaster from "../ui/CustomToaster";
import toast from "react-hot-toast";

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

        <div className="bg-gallery-50/50 p-8 sm:p-10">
          <div className='flex flex-col gap-3'>
            <h2 className='text-tuna-900 font-bold text-3xl'>Good to know!</h2>
            <p className='font-semibold text-lg lg:text-xl'>{trip?.tip} </p>
          </div>
          <Button
            onClick={router.back}
            className="bg-neptune-500 p-6 text-xl text-gallery-50 mt-10"
          >
            Back
          </Button>
        <button onClick={() => toast(<CustomToaster message="Your trip was saved" />)}>Toast</button>
        </div>

      </div>
    </>
  );
}

export default FinalSection;
