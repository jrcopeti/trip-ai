import { TRIP_URL } from "@/lib/constants";

// Bump the version if what's stored changes shape.
const OPEN_TRIP_KEY = "trip-ai:open-trip:v1";
// More than one only when tabs plan at once; the cap bounds a store nothing ever answers.
const MAX_OPEN_TRIPS = 10;

const listeners = new Set<() => void>();
const notify = () => listeners.forEach((listener) => listener());

const NONE: readonly string[] = Object.freeze([]);
let cached: { raw: string | null; trips: readonly string[] } = { raw: null, trips: NONE };

function readRaw(): string | null {
  try {
    return window.localStorage.getItem(OPEN_TRIP_KEY);
  } catch {
    return null;
  }
}

function parse(raw: string | null): readonly string[] {
  if (!raw) return NONE;
  try {
    const value: unknown = JSON.parse(raw);
    if (!Array.isArray(value)) return NONE;
    const trips = value.filter((url): url is string => typeof url === "string" && TRIP_URL.test(url));
    return trips.length ? Object.freeze(trips) : NONE;
  } catch {
    return NONE;
  }
}

function write(trips: readonly string[]) {
  try {
    if (trips.length) window.localStorage.setItem(OPEN_TRIP_KEY, JSON.stringify(trips));
    else window.localStorage.removeItem(OPEN_TRIP_KEY);
  } catch {
    // Nothing to do: the next trip just isn't held back.
  }
  notify();
}

/**
 * The trips this browser generated and hasn't answered, oldest first. localStorage, so they
 * survive reloads and are shared by every tab; anything but a list of trip urls reads as none.
 * The same array while storage is unchanged, as `useSyncExternalStore` needs. Never throws.
 */
export function readOpenTrips(): readonly string[] {
  const raw = readRaw();
  if (raw !== cached.raw) cached = { raw, trips: parse(raw) };
  return cached.trips;
}

/** Adds `tripUrl` as the newest open trip, keeping the others. */
export function rememberOpenTrip(tripUrl: string) {
  const trips = readOpenTrips().filter((url) => url !== tripUrl);
  write([...trips, tripUrl].slice(-MAX_OPEN_TRIPS));
}

/** Drops `tripUrl` from the open trips; the others stay. */
export function forgetOpenTrip(tripUrl: string) {
  const trips = readOpenTrips();
  if (!trips.includes(tripUrl)) return;
  write(trips.filter((url) => url !== tripUrl));
}

/** For `useSyncExternalStore`: calls `listener` on a change in this tab or another. */
export function subscribeOpenTrip(listener: () => void) {
  listeners.add(listener);
  // Fired only in the other tabs, so this tab's own writes go through `notify`.
  const onStorage = (event: StorageEvent) => {
    if (event.key === OPEN_TRIP_KEY || event.key === null) listener();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

export { MAX_OPEN_TRIPS, OPEN_TRIP_KEY };
