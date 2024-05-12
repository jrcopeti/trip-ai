import Image from "next/image";
import Link from "next/link";
import type { Trip } from "@prisma/client";
import image1 from "@/assets/homepage/1.jpg";
import { defaultPlaceholder } from "@/lib/constants";

function SavedTripCard({ trip }: { trip: Trip }) {
  const { id, city, country, userName, image, placeholder } = trip;

  return (
    <Link
      href={`/saved-trips/${id}`}
      className="trip-card relative flex h-[40vh] min-h-[40vh] w-[40vh] max-w-[40vh] flex-col rounded-sm bg-gallery-100 px-4 py-3 opacity-0 shadow-md transition duration-300 ease-in-out sm:h-[350px] sm:min-h-[350px] sm:w-[350px] sm:max-w-[350px]"
    >
      <div className="relative h-full w-full">
        <Image
          src={image ?? image1}
          alt={city}
          fill
          className=" rounded-sm object-cover"
          placeholder="blur"
          blurDataURL={placeholder ?? defaultPlaceholder}
          priority
        />
      </div>
      <div className="mt-2">
        <h2 className="text-lg font-semibold capitalize text-tuna-900 xs:text-xl sm:text-2xl">
          {city.trim()}, {country}
        </h2>
      </div>

      <div>
        <p className="text-base text-gallery-600 xs:text-lg sm:text-xl">
          <small>by </small>
          <span className="capitalize">&nbsp;{userName}</span>
        </p>
      </div>
    </Link>
  );
}

export default SavedTripCard;
