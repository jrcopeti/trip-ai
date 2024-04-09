import { Trip } from "@prisma/client";

function DescriptionSection({ trip }: { trip: Trip }) {
  return (
    <div className=" trip-description p-4 bg-gallery-50/40 sm:bg-gallery-50/45 backdrop-blur-sm">
      <p className=" sm:text-start text-2xl font-bold leading-[1.4] text-shark-950 text-center md:text-center lg:text-4xl">
        {trip?.description}
      </p>
    </div>
  );
}

export default DescriptionSection;
