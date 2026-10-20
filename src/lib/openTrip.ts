import { TRIP_URL } from "@/lib/constants";

// Bump the version if what's stored changes shape.
const OPEN_TRIP_KEY = "trip-ai:open-trip:v1";

const listeners = new Set<() => void>();
const notify = () => listeners.forEach((listener) => listener());

/**
 * The url of the last trip this browser generated and hasn't answered, or null. localStorage, so
 * it survives reloads and is shared by every tab; anything but a trip url reads as null. Every
 * access can throw (storage blocked, private mode), and a lost value only means nothing is blocked.
 */
export function readOpenTrip(): string | null {
  try {
    const value = window.localStorage.getItem(OPEN_TRIP_KEY);
    return value && TRIP_URL.test(value) ? value : null;
  } catch {
    return null;
  }
}

/** Stores `tripUrl` as the open trip, replacing any other. */
export function rememberOpenTrip(tripUrl: string) {
  try {
    window.localStorage.setItem(OPEN_TRIP_KEY, tripUrl);
  } catch {
    // Nothing to do: the next trip just isn't held back.
  }
  notify();
}

/** Clears the open trip if it is `tripUrl`; a newer trip stays open. */
export function forgetOpenTrip(tripUrl: string) {
  try {
    if (window.localStorage.getItem(OPEN_TRIP_KEY) !== tripUrl) return;
    window.localStorage.removeItem(OPEN_TRIP_KEY);
  } catch {
    return;
  }
  notify();
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

export { OPEN_TRIP_KEY };
