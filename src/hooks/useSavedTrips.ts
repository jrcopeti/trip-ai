import { getSavedTripsPage } from "@/db/actions";
import { keepPreviousData, useInfiniteQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useDebouncedValue } from "./useDebouncedValue";

/** How long typing has to pause before the search hits the database. */
export const SEARCH_DEBOUNCE_MS = 300;

export function useSavedTrips() {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const debouncedSearchTerm = useDebouncedValue(searchTerm, SEARCH_DEBOUNCE_MS);
  const {
    data,
    isPending: isPendingSavedTrips,
    isPlaceholderData,
    isFetching,
    error: savedTripsError,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    // A new search is a new key, so it starts again from the first page.
    queryKey: ["trips", debouncedSearchTerm],
    queryFn: ({ pageParam }) => getSavedTripsPage(debouncedSearchTerm, pageParam),
    initialPageParam: 0,
    getNextPageParam: (lastPage, pages) => {
      const loaded = pages.reduce((n, page) => n + page.trips.length, 0);
      return loaded < lastPage.total ? pages.length : undefined;
    },
    // Keep the last result on screen while the next search loads, so the grid
    // does not drop to the spinner on every keystroke.
    placeholderData: keepPreviousData,
  });

  return {
    savedTrips: data?.pages.flatMap((page) => page.trips),
    /** Every saved trip matching the search, loaded or not. */
    totalSavedTrips: data?.pages[0]?.total ?? 0,
    isPendingSavedTrips,
    /** Showing the previous search's trips while the new one loads. */
    isSearchingSavedTrips: isPlaceholderData && isFetching,
    savedTripsError,
    hasMoreSavedTrips: hasNextPage,
    loadMoreSavedTrips: fetchNextPage,
    isLoadingMoreSavedTrips: isFetchingNextPage,
    setSearchTerm,
    searchTerm,
  };
}
