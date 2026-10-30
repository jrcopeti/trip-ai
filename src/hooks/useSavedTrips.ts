import { getSavedTripsPage } from "@/db/actions";
import { keepPreviousData, useInfiniteQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
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
    error,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
    isFetchNextPageError,
  } = useInfiniteQuery({
    // A new search is a new key, so it starts again from the first page.
    queryKey: ["trips", debouncedSearchTerm],
    queryFn: ({ pageParam }) => getSavedTripsPage(debouncedSearchTerm, pageParam),
    initialPageParam: 0,
    // Counts distinct ids: a repeat (see `savedTrips`) counted twice would end
    // the paging one short. An empty page ends it, as a trip saved mid-browse
    // sits on a loaded page and the offsets run out under the total.
    getNextPageParam: (lastPage, pages) => {
      const loaded = new Set(pages.flatMap((page) => page.trips.map((trip) => trip.id))).size;
      return lastPage.trips.length > 0 && loaded < lastPage.total ? pages.length : undefined;
    },
    // Keep the last result on screen while the next search loads, so the grid
    // does not drop to the spinner on every keystroke.
    placeholderData: keepPreviousData,
  });

  // Offset paging can hand back a trip twice: if a trip is saved between two
  // pages, every row shifts down one and the last of page n reappears first on
  // page n + 1. Keep the first sighting of each id.
  const savedTrips = useMemo(() => {
    if (!data) return undefined;
    const seen = new Set<number>();
    return data.pages
      .flatMap((page) => page.trips)
      .filter((trip) => {
        if (seen.has(trip.id)) return false;
        seen.add(trip.id);
        return true;
      });
  }, [data]);

  return {
    savedTrips,
    /** Every saved trip matching the search, loaded or not. */
    totalSavedTrips: data?.pages[0]?.total ?? 0,
    isPendingSavedTrips,
    /** Showing the previous search's trips while the new one loads. */
    isSearchingSavedTrips: isPlaceholderData && isFetching,
    /**
     * Fatal only when there is nothing to show. A failed "Show more" or a failed
     * background refetch keeps the trips already loaded on screen.
     */
    savedTripsError: data ? null : error,
    /** The last "Show more" failed; clicking it again retries. */
    loadMoreFailed: isFetchNextPageError,
    hasMoreSavedTrips: hasNextPage,
    loadMoreSavedTrips: fetchNextPage,
    isLoadingMoreSavedTrips: isFetchingNextPage,
    setSearchTerm,
    searchTerm,
  };
}
