import type { Prisma, Trip } from "@prisma/client";
import type { TripData } from "@/lib/agent/submitTrip";
import type { FinalDataTypes, ImageDataTypes } from "@/types";

type TripOutput = TripData | Pick<Trip, keyof TripData>;

/**
 * The row `createTripInDB` writes, field by field: spreading the form hands Prisma keys it
 * has no column for. A bridge until the server writes the row (grounded-agent branch 2).
 */
export function toTripRow({
  formData,
  tripData,
  imageData,
  tripUrl,
  saved,
}: {
  formData: FinalDataTypes;
  tripData: TripOutput;
  imageData?: ImageDataTypes;
  tripUrl: string;
  saved: boolean;
}): Prisma.TripCreateInput {
  const { lat, lng } = formData;
  // Step 2 resolves the city before Next is enabled, so a missing place is a bug, not input.
  if (lat === null || lng === null) throw new Error("No resolved place to save the trip at");

  return {
    userName: formData.userName,
    travellers: formData.travellers,
    ageRanges: formData.ageRanges,
    pace: formData.pace,
    passport: formData.passport || null,
    type: formData.type,
    city: formData.city,
    country: formData.country,
    countryCode: formData.countryCode,
    lat,
    lng,
    startDate: new Date(formData.startDate),
    endDate: new Date(formData.endDate),
    luggageSize: formData.luggageSize,
    accommodation: formData.accommodation,
    transport: formData.transport,
    budget: formData.budget,
    requiredItems: formData.requiredItems.filter((item) => item.trim() !== ""),
    interests: formData.interests,
    note: formData.note || null,
    agreement: formData.agreement,
    byWeather: formData.byWeather,
    tripUrl,
    tripImages: imageData?.tripImages ?? [],
    placeholder: imageData?.placeholder ?? null,
    saved,
    title: tripData.title,
    description: tripData.description,
    objectsList: tripData.objectsList as Prisma.InputJsonValue,
    mustHave: tripData.mustHave,
    tours: tripData.tours as Prisma.InputJsonValue,
    tip: tripData.tip,
  };
}
