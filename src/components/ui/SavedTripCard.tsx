import Image from "next/image";
import type { Trip } from "@prisma/client";

import Link from "next/link";

function SavedTripCard({ trip }: { trip: Trip }) {
  const { id, city, country, flagUrl, userName } = trip;
  return (
    <Link
      href={`/saved-trips/${id}`}
      className="card card-compact bg-primary-content rounded-xl shadow-lg transition duration-300 ease-in-out hover:-translate-y-2 "
    >
      <div className="card-body w-full items-center text-center">
        <h2 className="card-title text-center capitalize">
          {city}, {country} by {userName}
        </h2>
        <Image
          src={flagUrl}
          alt={country}
          width={32}
          height={32}
          className="rounded-md "
        />
      </div>
    </Link>
  );
}

export default SavedTripCard;
