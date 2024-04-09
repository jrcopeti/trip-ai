import type { Trip } from "@prisma/client";

function ObjectsSection({ trip }: { trip: Trip }) {
  return (
    <div className="  absolute h-[90%] w-[90%] p-4 lg:h-[80%] lg:w-[80%] lg:p-12 ">
      <div className="grid grid-cols-2 items-center justify-items-center gap-2 rounded-md text-xs lg:grid-cols-3 lg:gap-4 lg:p-4 lg:text-2xl">
        {(
          trip?.objectsList as {
            quantity: number;
            item: string;
            description: string;
          }[]
        )?.map((object, i) => (
          <div
            className="objects-list flex h-full w-full flex-col items-stretch justify-start rounded-xl  bg-gallery-50/80  p-4 font-semibold leading-loose text-shark-900 lg:gap-y-6 lg:text-xl"
            key={i}
          >
            <div className=" flex items-center justify-start space-x-4">
              <span className="font-extrabold text-neptune-500">
                {object.quantity}
              </span>
              <span className="whitespace-nowrap font-bold capitalize ">{object.item}</span>
            </div>
            <span className="whitespace-normal text-gallery-600">
              {object.description}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ObjectsSection;
