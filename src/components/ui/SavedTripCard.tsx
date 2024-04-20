import Image from "next/image";
import Link from "next/link";
import type { Trip } from "@prisma/client";
import image1 from "@/assets/homepage/1.jpg";
import { defaultPlaceholder } from "@/lib/utils";

function SavedTripCard({ trip }: { trip: any }) {
  const { id, city, country, userName, image, placeholder } = trip;

  return (
    <Link
      href={`/saved-trips/${id}`}
      className="saved-trip-card flex h-[40vh] w-[40vh] flex-col rounded-sm bg-gallery-100 px-4 py-3 shadow-md transition duration-300 ease-in-out hover:-translate-y-2 "
    >
      <div>
        <h2 className="text-xl font-semibold capitalize text-tuna-900">
          {city.trim()}, {country}
        </h2>
      </div>

      <div>
        <p className="text-gallery-600 ">
          <small>by </small>
          &nbsp;{userName}
        </p>
      </div>

      <div className="relative mt-1 h-full w-full ">
        <Image
          src={image ?? image1}
          alt={city}
          fill
          className="rounded-sm object-cover"
          placeholder="blur"
          blurDataURL={placeholder ?? defaultPlaceholder}
        />
      </div>
    </Link>
  );
}

export default SavedTripCard;
