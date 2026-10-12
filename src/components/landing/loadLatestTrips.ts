import { getLatestSavedTrips, type LatestTrip } from "@/db/actions";

/**
 * How long the landing waits for its deck before rendering without it. The page
 * awaits the query before anything is sent, and Prisma's own limits (5s to
 * connect, 10s for a pooled connection) are far too long to hold the front door
 * blank for a decorative deck. Long enough for most of a Neon wake-up.
 */
export const LATEST_TRIPS_TIMEOUT_MS = 1500;

/**
 * The hero deck's trips, or none if the database cannot be read in time: the
 * landing is the front door and must render without it. The failure is logged,
 * not hidden.
 */
async function loadLatestTrips(): Promise<LatestTrip[]> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(
      () => reject(new Error(`timed out after ${LATEST_TRIPS_TIMEOUT_MS}ms`)),
      LATEST_TRIPS_TIMEOUT_MS,
    );
  });

  try {
    // A query that loses the race carries on and settles unobserved; `race`
    // has already attached its handlers, so a late rejection is not unhandled.
    return await Promise.race([getLatestSavedTrips(), timeout]);
  } catch (error) {
    console.error("Landing: could not load the latest saved trips", error);
    return [];
  } finally {
    clearTimeout(timer);
  }
}

export default loadLatestTrips;
