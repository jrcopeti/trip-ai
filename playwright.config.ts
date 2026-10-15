import { defineConfig, devices } from "@playwright/test";
import { E2E_DATABASE_URL } from "./scripts/localDatabase";

// Before anything reads it: the server and the journey spec's own Prisma client both
// use the e2e database, not `.env`'s production one. Real env beats `.env` files in Next.
process.env.DATABASE_URL = E2E_DATABASE_URL;

// Not 3000, where `npm run dev` runs on `.env` — the production database.
const PORT = Number(process.env.PORT ?? 3100);
const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? `http://localhost:${PORT}`;

export default defineConfig({
  testDir: "./e2e",
  // Every assertion is behavioural; there are no screenshot baselines to match,
  // so a failure here is a real one rather than a rendering difference.
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : [["list"]],
  timeout: 30_000,
  expect: { timeout: 10_000 },

  use: {
    baseURL,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },

  // Chromium only. The suite guards behaviour, not cross-engine rendering.
  //
  // The trip journey is the one spec that writes to the database, so it is its
  // own project and runs after the rest: `saved-trips.spec` counts the seeded
  // rows, and a saved trip landing mid-run would make that count flaky.
  projects: [
    {
      name: "chromium",
      testIgnore: /trip-journey\.spec\.ts/,
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "journey",
      testMatch: /trip-journey\.spec\.ts/,
      dependencies: ["chromium"],
      use: { ...devices["Desktop Chrome"] },
    },
  ],

  // Runs against a production build: `next dev` recompiles per route, which makes
  // the first navigation of each spec slow enough to trip the timeouts above.
  // Only a server this run starts is known to use the e2e database, so none is reused:
  // a stray one on the port fails the run. Against PLAYWRIGHT_BASE_URL nothing starts,
  // and the trip journey skips itself.
  webServer: process.env.PLAYWRIGHT_BASE_URL
    ? undefined
    : {
        command: "npm run start",
        url: baseURL,
        reuseExistingServer: false,
        timeout: 120_000,
        env: {
          // The server-side API modules answer from fixtures instead of calling
          // Anthropic, Unsplash and OpenWeather — see src/app/api/e2eFixtures.ts.
          E2E_FIXTURES: "1",
          PORT: String(PORT),
          DATABASE_URL: E2E_DATABASE_URL,
        },
      },
});
