import type { StaticImageData } from "next/image";
import type { Trip } from "@/generated/prisma/client";
import image1 from "@/assets/travel-photos/1.jpg";
import image2 from "@/assets/travel-photos/2.jpg";
import image3 from "@/assets/travel-photos/3.jpg";
import image4 from "@/assets/travel-photos/4.jpg";
import image9 from "@/assets/travel-photos/9.jpg";
import { defaultPlaceholder } from "@/lib/constants";

export type TripPhoto = { src: string | StaticImageData; blurDataURL: string };

/** Each photo slot's index in `tripImages`, and its bundled photo. */
const slots = {
  title: { index: 0, fallback: image1 },
  description: { index: 1, fallback: image2 },
  afterTours: { index: 2, fallback: image3 },
  details: { index: 3, fallback: image4 },
  closing: { index: 4, fallback: image9 },
};

/**
 * The photo for one slot: the trip's own, behind the row's placeholder, or the slot's
 * bundled one, behind its own blur.
 */
export function tripPhoto(
  trip: Pick<Trip, "tripImages" | "placeholder">,
  slot: keyof typeof slots,
): TripPhoto {
  const { index, fallback } = slots[slot];
  const image = trip.tripImages[index];
  return image
    ? { src: image, blurDataURL: trip.placeholder ?? defaultPlaceholder }
    : { src: fallback, blurDataURL: fallback.blurDataURL ?? defaultPlaceholder };
}
