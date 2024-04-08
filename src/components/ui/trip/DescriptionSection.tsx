import { Trip } from "@prisma/client";

function DescriptionSection({ trip }: { trip: Trip }) {
  return (
    <div className="p-12 backdrop-blur-sm">
      <p className=" trip-description text-start text-2xl font-extrabold leading-[1.8] text-shark-100 md:text-center lg:text-4xl">
        {trip?.description}
      </p>
    </div>
  );
}

export default DescriptionSection;
