import { getLatestSavedTrips, type LatestTrip } from "@/db/actions";

/**
 * The hero deck's trips, or none if the database cannot be read: the landing is
 * the front door and must render without them. The failure is logged, not
 * hidden.
 *
 * No time limit of its own. The deck streams in inside a `<Suspense>`, so a slow
 * query holds only the deck's loader, never the page; how long to wait is left to
 * Prisma's defaults (5s to connect, 10s for a pooled connection).
 */
async function loadLatestTrips(): Promise<LatestTrip[]> {
  try {
    return await getLatestSavedTrips();
  } catch (error) {
    console.error("Landing: could not load the latest saved trips", error);
    return [];
  }
}

export default loadLatestTrips;
