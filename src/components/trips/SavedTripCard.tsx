import Image from "next/image";
import Link from "next/link";
import type { Trip } from "@prisma/client";
import image1 from "@/assets/homepage/1.jpg";
import { defaultPlaceholder } from "@/lib/utils";

function SavedTripCard({ trip }: { trip: Trip }) {
  const { id, city, country, userName, image, placeholder } = trip;

  return (
    <Link
      href={`/saved-trips/${id}`}
      className="trip-card flex h-[40vh] w-[40vh] max-w-[40vh] flex-col rounded-sm bg-gallery-100 px-4 py-3 opacity-0 shadow-md transition duration-300 ease-in-out hover:-translate-y-2 "
    >
      <div>
        <h2 className="text-xl font-semibold capitalize text-tuna-900">
          {city.trim()}, {country}
        </h2>
      </div>

      <div>
        <p className="text-gallery-600 ">
          <small>by </small>
          <span className="capitalize">&nbsp;{userName}</span>
        </p>
      </div>

      <div className="relative mt-1 h-full w-full ">
        <Image
          src={image ?? image1}
          alt={city}
          fill
          className="h-full w-full rounded-sm object-cover"
          placeholder="blur"
          blurDataURL={placeholder ?? defaultPlaceholder}
          priority
        />
      </div>
    </Link>
  );
}

export default SavedTripCard;
