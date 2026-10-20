import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import {
  forecastListFixture,
  geoNamesSearchFixture,
  imageDataFixture,
  tripDataFixture,
  weatherFixture,
} from "@/test/fixtures";

/**
 * The one concession production code makes to testing.
 *
 * The API modules run on the server, so their outbound calls happen there and Playwright's `page.route` cannot intercept them. Without this the
 * e2e suite would need live Anthropic, Unsplash, OpenWeather and GeoNames keys in CI — a
 * worse trade than a single environment-variable branch.
 *
 * Off unless `E2E_FIXTURES=1` is set explicitly, which nothing but the Playwright
 * `webServer` does. The payloads are the same fixtures the unit tests use, so the
 * two suites cannot drift apart.
 */
export const useE2EFixtures = process.env.E2E_FIXTURES === "1";

dayjs.extend(utc);

/** How long the fixture trip takes to come back, so a Cancel can land while it is in flight. */
export const E2E_TRIP_HOLD_MS = 2000;

/** The fixture trip, after `E2E_TRIP_HOLD_MS`; rejects with the signal's reason as it aborts. */
export function heldTripDataFixture(signal?: AbortSignal) {
  return new Promise<typeof tripDataFixture>((resolve, reject) => {
    const timer = setTimeout(() => resolve(tripDataFixture), E2E_TRIP_HOLD_MS);
    signal?.addEventListener(
      "abort",
      () => {
        clearTimeout(timer);
        reject(signal.reason);
      },
      { once: true },
    );
  });
}

/**
 * The forecast fixture moved to start at the last three-hour mark in UTC, as a real one does:
 * a trip planned around the weather keeps only the days inside its dates, which start today.
 */
export function forecastFixtureFromNow(now = dayjs()) {
  const utcNow = now.utc();
  const start = utcNow.startOf("hour").subtract(utcNow.hour() % 3, "hour").unix();
  const shift = start - forecastListFixture[0].dt;
  return forecastListFixture.map((reading) => ({
    ...reading,
    dt: reading.dt + shift,
    dt_txt: dayjs.unix(reading.dt + shift).utc().format("YYYY-MM-DD HH:mm:ss"),
  }));
}

export {
  forecastListFixture,
  geoNamesSearchFixture,
  imageDataFixture,
  tripDataFixture,
  weatherFixture,
};
