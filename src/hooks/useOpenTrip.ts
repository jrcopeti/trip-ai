"use client";
import { useEffect, useSyncExternalStore } from "react";
import { useQuery } from "@tanstack/react-query";
import { isTripOpen } from "@/db/actions";
import { forgetOpenTrip, readOpenTrip, subscribeOpenTrip } from "@/lib/openTrip";

/**
 * The url of this browser's unanswered trip, which holds back the next one, or null. A stored
 * url with no row, or a saved row, is cleared once `isTripOpen` says so; until it answers,
 * or if it fails, the trip counts as open. Null on the server and in the first render.
 */
export function useOpenTrip(): string | null {
  const tripUrl = useSyncExternalStore(subscribeOpenTrip, readOpenTrip, () => null);
  const { data: isOpen } = useQuery({
    queryKey: ["open-trip", tripUrl],
    queryFn: () => isTripOpen(tripUrl as string),
    enabled: tripUrl !== null,
  });

  useEffect(() => {
    if (tripUrl && isOpen === false) forgetOpenTrip(tripUrl);
  }, [tripUrl, isOpen]);

  return isOpen === false ? null : tripUrl;
}
