import { getLatestSavedTrips, type LatestTrip } from "@/db/actions";

/**
 * The hero deck's trips, or none if the database cannot be read: the landing is
 * the front door and must render without it. The failure is logged, not hidden.
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
