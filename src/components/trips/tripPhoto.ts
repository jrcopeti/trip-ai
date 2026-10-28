import type { StaticImageData } from "next/image";
import type { Trip } from "@/generated/prisma/client";
import image1 from "@/assets/travel-photos/1.jpg";
import image2 from "@/assets/travel-photos/2.jpg";
import image3 from "@/assets/travel-photos/3.jpg";
import image4 from "@/assets/travel-photos/4.jpg";
import image9 from "@/assets/travel-photos/9.jpg";
import { defaultPlaceholder } from "@/lib/constants";

export type TripPhoto = { src: string | StaticImageData; blurDataURL: string };
type Photos = Pick<Trip, "tripImages" | "placeholder">;

/**
 * The trip page's slots, in `tripImages`' order: title, description, photo after the
 * tours, details, closing, photo after the essentials. The last has no bundled photo.
 */
const fallbacks: (StaticImageData | undefined)[] = [image1, image2, image3, image4, image9];

/**
 * The photo for one slot: the trip's own, behind the row's placeholder, or the slot's
 * bundled one, behind its own blur. Undefined only for a slot with neither.
 */
export function tripPhoto(trip: Photos, slot: 0 | 1 | 2 | 3 | 4): TripPhoto;
export function tripPhoto(trip: Photos, slot: number): TripPhoto | undefined;
export function tripPhoto(trip: Photos, slot: number): TripPhoto | undefined {
  const image = trip.tripImages[slot];
  if (image) return { src: image, blurDataURL: trip.placeholder ?? defaultPlaceholder };
  const fallback = fallbacks[slot];
  return fallback && { src: fallback, blurDataURL: fallback.blurDataURL ?? defaultPlaceholder };
}
