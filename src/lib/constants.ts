const defaultPlaceholder =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAADCAIAAAA7ljmRAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAMElEQVR4nGNIL6799/f/jWfflazcGYwtrP+/ffj6yVMta2cGBn5JS3d/U48gBg5RAI1ZEFzy8ZYjAAAAAElFTkSuQmCC";

const getChosenHour = () => new Date().getHours();

/**
 * Saved trips per "Show more": 6 full rows at three columns, and it divides
 * evenly into two and one, so the last row is never ragged. Lives here, not in
 * `src/db/actions.ts`: a "use server" module may only export async functions.
 */
const SAVED_TRIPS_PAGE_SIZE = 18;

/** A trip's url, as `generateTrip` makes it from 6 random bytes: 12 hex characters. */
const TRIP_URL = /^[0-9a-f]{12}$/;

export { defaultPlaceholder, getChosenHour, SAVED_TRIPS_PAGE_SIZE, TRIP_URL };
