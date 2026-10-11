import { getAllTrips } from "@/db/actions";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useDebouncedValue } from "./useDebouncedValue";

/** How long typing has to pause before the search hits the database. */
export const SEARCH_DEBOUNCE_MS = 300;

export function useSavedTrips() {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const debouncedSearchTerm = useDebouncedValue(searchTerm, SEARCH_DEBOUNCE_MS);
  const {
    data: savedTrips,
    isPending: isPendingSavedTrips,
    isPlaceholderData,
    isFetching,
    error: savedTripsError,
  } = useQuery({
    queryKey: ["trips", debouncedSearchTerm],
    queryFn: () => getAllTrips(debouncedSearchTerm),
    // Keep the last result on screen while the next search loads, so the grid
    // does not drop to the spinner on every keystroke.
    placeholderData: keepPreviousData,
  });

  return {
    savedTrips,
    isPendingSavedTrips,
    /** Showing the previous search's trips while the new one loads. */
    isSearchingSavedTrips: isPlaceholderData && isFetching,
    savedTripsError,
    setSearchTerm,
    searchTerm,
  };
}
