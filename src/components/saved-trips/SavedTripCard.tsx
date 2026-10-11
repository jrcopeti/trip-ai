import Polaroid from "@/components/sorbet/Polaroid";
import image1 from "@/assets/travel-photos/1.jpg";
import { defaultPlaceholder } from "@/lib/constants";
import type { Trip } from "@prisma/client";
import { card } from "./content";

/** One saved trip as a polaroid. `index` places it on the fan. */
function SavedTripCard({ trip, index }: { trip: Trip; index: number }) {
  const { id, city, country, userName, image, placeholder } = trip;

  return (
    <Polaroid
      href={`/saved-trips/${id}`}
      image={image ?? image1}
      placeholder={placeholder ?? defaultPlaceholder}
      caption={`${city.trim()}, ${country}`}
      byline={`${card.bylinePrefix} ${userName}`}
      index={index}
    />
  );
}

export default SavedTripCard;
