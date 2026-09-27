import {
  forecastListFixture,
  imageDataFixture,
  tripDataFixture,
  weatherFixture,
} from "@/test/fixtures";

/**
 * The one concession production code makes to testing.
 *
 * The three API modules are `"use server"`, so their outbound calls happen on the
 * server and Playwright's `page.route` cannot intercept them. Without this the
 * e2e suite would need live Anthropic, Unsplash and OpenWeather keys in CI — a
 * worse trade than a single environment-variable branch.
 *
 * Off unless `E2E_FIXTURES=1` is set explicitly, which nothing but the Playwright
 * `webServer` does. The payloads are the same fixtures the unit tests use, so the
 * two suites cannot drift apart.
 */
export const useE2EFixtures = process.env.E2E_FIXTURES === "1";

export {
  forecastListFixture,
  imageDataFixture,
  tripDataFixture,
  weatherFixture,
};
