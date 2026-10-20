import type { TripRequest } from "@/lib/agent/request";

/**
 * Asks `POST /api/trip` for a trip and resolves to its url; `signal` aborts the wait. A route,
 * not a server action: Next runs server actions one at a time, so a cancelled one would hold
 * every later one (the city check, the next try) until the server finished it.
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
  return response.json();
}
