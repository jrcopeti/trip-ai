import type { FinalDataTypes, Inputs } from "@/types";

/** A complete, valid set of RHF inputs. Dates are far enough out to stay valid. */
export const validInputs: Inputs = {
  userName: "Ana",
  age: "31",
  nationality: "Brazilian",
  type: "cultural",
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
  weatherForecast: "",
  agreement: true,
  flagUrl: "https://flagcdn.com/pt.svg",
};

/** The same data after `transformInputsToFinalData`. */
export const finalFormData: FinalDataTypes = {
  ...validInputs,
  userName: "ana",
  city: "lisbon",
  note: "wants a day trip to sintra",
  requiredItems: ["camera", "walking shoes"],
  weatherForecast: "",
};
