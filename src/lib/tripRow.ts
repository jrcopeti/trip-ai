import type { Prisma } from "@/generated/prisma/client";
import type { TripData } from "@/lib/agent/submitTrip";
import type { TripRequest } from "@/lib/agent/request";
import type { Place } from "@/lib/place";
import type { ImageDataTypes } from "@/types";

/**
 * The row `generateTrip` writes, from the checked request, GeoNames' place and the model's
 * output. Unsaved until the traveller answers; `setTripSaved` only flips the flag.
 */
export function toTripRow({
  request,
  place,
  tripData,
  images,
  tripUrl,
  byWeather,
}: {
  request: TripRequest;
  place: Pick<Place, "lat" | "lng">;
  tripData: TripData;
  images: ImageDataTypes;
  tripUrl: string;
  /** Whether a forecast reached the prompt, not whether the traveller asked for one. */
  byWeather: boolean;
}): Prisma.TripCreateInput {
  // Stored lowercased, as the form used to; the trip page capitalises them.
  const lower = (text: string) => text.trim().toLowerCase();

  return {
    userName: lower(request.userName),
    travellers: request.travellers,
    ageRanges: request.ageRanges,
    pace: request.pace,
    passport: request.passport || null,
    type: request.type,
    city: lower(request.city),
    country: request.country,
    countryCode: request.countryCode,
    lat: place.lat,
    lng: place.lng,
    // Calendar days at UTC midnight: the trip page formats them in UTC.
    startDate: new Date(`${request.startDate}T00:00:00.000Z`),
    endDate: new Date(`${request.endDate}T00:00:00.000Z`),
    luggageSize: request.luggageSize,
    accommodation: request.accommodation,
    transport: request.transport,
    budget: request.budget,
    requiredItems: request.requiredItems.map(lower),
    interests: request.interests,
    note: request.note ? lower(request.note) : null,
    // The request leaves it out on purpose (it never reaches the prompt); the form can't submit without it.
    agreement: true,
    byWeather,
    tripUrl,
    tripImages: images.tripImages,
    placeholder: images.placeholder,
    saved: false,
    title: tripData.title,
    description: tripData.description,
    objectsList: tripData.objectsList as Prisma.InputJsonValue,
    mustHave: tripData.mustHave,
    tours: tripData.tours as Prisma.InputJsonValue,
    tip: tripData.tip,
  };
}
