import type { TripRequest } from "@/lib/agent/request";
import { TRIP_URL } from "@/lib/constants";

/**
 * Asks `POST /api/trip` for a trip and resolves to its url; `signal` aborts the request. Rejects
 * on an error status, or on a success without a well-formed url.
 */
export async function requestTrip(
  request: TripRequest,
  signal: AbortSignal,
): Promise<{ tripUrl: string }> {
  const response = await fetch("/api/trip", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(request),
    signal,
  });
  if (!response.ok) throw new Error(`The trip could not be generated (${response.status})`);
  const { tripUrl } = await response.json();
  if (typeof tripUrl !== "string" || !TRIP_URL.test(tripUrl)) {
    throw new Error("The trip's url was not in the answer");
  }
  return { tripUrl };
}
