"use client";
import { useEffect, useSyncExternalStore } from "react";
import { useQueries } from "@tanstack/react-query";
import { isTripOpen } from "@/db/actions";
import { forgetOpenTrip, readOpenTrips, subscribeOpenTrip } from "@/lib/openTrip";

const NONE: readonly string[] = [];

/**
 * The url of this browser's newest unanswered trip, which holds back the next one, or null. Each
 * stored trip is checked once with `isTripOpen`, and one with no row or a saved row is cleared;
 * until its check answers, or if it fails, it counts as open. Null on the server and first render.
 */
export function useOpenTrip(): string | null {
  const trips = useSyncExternalStore(subscribeOpenTrip, readOpenTrips, () => NONE);
  const checks = useQueries({
    queries: trips.map((tripUrl) => ({
      queryKey: ["open-trip", tripUrl],
      queryFn: () => isTripOpen(tripUrl),
      // Answers happen in this browser and other tabs are heard through storage: a refocus learns nothing.
      refetchOnWindowFocus: false,
    })),
  });
  const closed = trips.filter((_, i) => checks[i]?.data === false);
  // A string, so the effect runs when the set changes rather than on every render's new array.
  const closedKey = closed.join(" ");

  useEffect(() => {
    if (closedKey) closedKey.split(" ").forEach(forgetOpenTrip);
  }, [closedKey]);

  return trips.findLast((tripUrl) => !closed.includes(tripUrl)) ?? null;
}
