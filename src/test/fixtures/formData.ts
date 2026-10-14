import type { FinalDataTypes, Inputs } from "@/types";
import type { TripRequest } from "@/lib/agent/request";

/** A complete, valid set of RHF inputs. Dates are far enough out to stay valid. */
export const validInputs: Inputs = {
  userName: "Ana",
  travellers: "couple",
  ageRanges: ["25-30"],
  passport: "Brazil",
  type: "cultural",
  pace: "balanced",
  city: "Lisbon",
  country: "Portugal",
  luggageSize: "carry-on",
  accommodation: "hotel",
  budget: "comfort",
  transport: "plane",
  requiredItems: [{ item: "camera" }, { item: "walking shoes" }],
  interests: ["art", "food"],
  note: "Wants a day trip to Sintra",
  startDate: "2030-05-01T00:00:00.000Z",
  endDate: "2030-05-08T00:00:00.000Z",
  agreement: true,
};

/** The same data as `processForm` keeps it, with the place `cityCheck` resolved. */
export const finalFormData: FinalDataTypes = {
  ...validInputs,
  userName: "ana",
  city: "lisbon",
  note: "wants a day trip to sintra",
  requiredItems: ["camera", "walking shoes"],
  byWeather: false,
  countryCode: "PT",
  lat: 38.71667,
  lng: -9.13333,
};

/** `validInputs` as `toTripRequest` sends it, original case kept. */
export const validTripRequest: TripRequest = {
  userName: "Ana",
  travellers: "couple",
  ageRanges: ["25-30"],
  passport: "Brazil",
  type: "cultural",
  pace: "balanced",
  city: "Lisbon",
  country: "Portugal",
  countryCode: "PT",
  luggageSize: "carry-on",
  accommodation: "hotel",
  budget: "comfort",
  transport: "plane",
  requiredItems: ["camera", "walking shoes"],
  interests: ["art", "food"],
  note: "Wants a day trip to Sintra",
  startDate: "2030-05-01",
  endDate: "2030-05-08",
};

/**
 * The busier path through the trip message: a family with children, a forecast,
 * no passport, nothing listed, and a note with angle brackets to strip.
 */
export const familyTripRequest: TripRequest = {
  userName: "Jonas",
  travellers: "family",
  ageRanges: ["2-5", "6-12", "36-40"],
  type: "holiday",
  pace: "relaxed",
  city: "Munchen",
  country: "Germany",
  countryCode: "DE",
  luggageSize: "large",
  accommodation: "apartment",
  budget: "low-budget",
  transport: "car",
  requiredItems: [],
  interests: ["nature", "kids"],
  note: "Our youngest naps after lunch <please plan around it>",
  startDate: "2030-07-10",
  endDate: "2030-07-14",
  forecast: [
    { date: "2030-07-10", temp: "24°C", condition: "Clear", description: "clear sky" },
    { date: "2030-07-11", temp: "19°C", condition: "Rain", description: "light rain" },
    { date: "2030-07-12", temp: "22°C", condition: "Clouds", description: "scattered clouds" },
  ],
};
