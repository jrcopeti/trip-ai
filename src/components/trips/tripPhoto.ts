import type { StaticImageData } from "next/image";
import type { Trip } from "@/generated/prisma/client";
import image1 from "@/assets/travel-photos/1.jpg";
import image2 from "@/assets/travel-photos/2.jpg";
import image3 from "@/assets/travel-photos/3.jpg";
import image4 from "@/assets/travel-photos/4.jpg";
import image9 from "@/assets/travel-photos/9.jpg";
import { defaultPlaceholder } from "@/lib/constants";

export type TripPhoto = { src: string | StaticImageData; blurDataURL: string };

/** Each trip-page slot's index in `tripImages`, and its bundled photo. */
const slots = {
  title: { index: 0, fallback: image1 },
  description: { index: 1, fallback: image2 },
  afterTours: { index: 2, fallback: image3 },
  details: { index: 3, fallback: image4 },
  closing: { index: 4, fallback: image9 },
  afterEssentials: { index: 5 },
} satisfies Record<string, { index: number; fallback?: StaticImageData }>;

type Slot = keyof typeof slots;
type SlotWithFallback = {
  [S in Slot]: (typeof slots)[S] extends { fallback: StaticImageData } ? S : never;
}[Slot];
type Photos = Pick<Trip, "tripImages" | "placeholder">;

/**
 * The photo for one slot: the trip's own, behind the row's placeholder, or the slot's
 * bundled one, behind its own blur. Undefined only for a slot with no bundled photo.
 */
export function tripPhoto(trip: Photos, slot: SlotWithFallback): TripPhoto;
export function tripPhoto(trip: Photos, slot: Slot): TripPhoto | undefined;
export function tripPhoto(trip: Photos, slot: Slot): TripPhoto | undefined {
  const { index, fallback }: { index: number; fallback?: StaticImageData } = slots[slot];
  const image = trip.tripImages[index];
  if (image) return { src: image, blurDataURL: trip.placeholder ?? defaultPlaceholder };
  return fallback && { src: fallback, blurDataURL: fallback.blurDataURL ?? defaultPlaceholder };
}
