import type { Trip } from "@prisma/client";


function ObjectsSection({ trip }: { trip: Trip }) {
  return (
    <div className="absolute h-[90%] w-[90%] p-4 lg:h-[80%] lg:w-[80%] lg:p-12 ">
      <div className="grid grid-cols-2 items-center justify-items-center gap-2 rounded-md text-xs lg:grid-cols-3 lg:gap-4 lg:p-4 lg:text-2xl">
        {(
          trip?.objectsList as {
            quantity: number;
            item: string;
            description: string;
          }[]
        )?.map((object, i) => (
          <div
            className="objects-list flex h-full w-full flex-col items-stretch justify-start  rounded-xl bg-tuna-200 p-4 font-semibold leading-loose lg:gap-y-6 lg:text-xl"
            key={i}
          >
            <div className=" flex items-center justify-start space-x-4">
              <span className=" text-violay-500">{object.quantity}</span>
              <span className="whitespace-nowrap text-shark-800">
                {object.item}
              </span>
            </div>
            <span className="whitespace-normal text-shark-800">
              {object.description}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ObjectsSection;
