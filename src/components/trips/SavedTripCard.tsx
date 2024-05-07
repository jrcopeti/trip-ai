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
      className="trip-card relative flex h-[300px] min-h-[300px] w-[300px] max-w-[300px] flex-col rounded-sm bg-gallery-100 px-4 py-3 opacity-0 shadow-md transition duration-300 ease-in-out"
    >
      <div>
        <h2 className="font-semibold capitalize text-tuna-900 md:text-lg 2xl:text-xl">
          {city.trim()}, {country}
        </h2>
      </div>

      <div>
        <p className="text-gallery-600">
          <small>by </small>
          <span className="capitalize">&nbsp;{userName}</span>
        </p>
      </div>

      <div className="relative mt-1 h-full w-full">
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
    </Link>
  );
}

export default SavedTripCard;
