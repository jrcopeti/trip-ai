import { useContext } from "react";
import { TripContext } from "@/context/TripContext";

export function useTrip() {
  const context = useContext(TripContext);
  if (!context) {
    throw new Error("useTrip must be used within a TripProvider");
  }
  return context;
}

