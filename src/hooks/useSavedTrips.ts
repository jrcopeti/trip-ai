import { getAllTrips } from "@/db/actions";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

export function useSavedTrips() {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const {
    data: savedTrips,
    isPending: isPendingSavedTrips,
    error: savedTripsError,
  } = useQuery({
    queryKey: ["trips", searchTerm],
    queryFn: () => getAllTrips(searchTerm),
  });

  return {
    savedTrips,
    isPendingSavedTrips,
    savedTripsError,
    setSearchTerm,
    searchTerm,
  };
}
