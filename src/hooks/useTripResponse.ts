import { useContext } from "react";
import { TripContext } from "@/context/TripContext";

export function useTripResponse() {
  const context = useContext(TripContext);
  if (!context) {
    throw new Error("useTrip must be used within a TripProvider");
  }
  return context;
}
