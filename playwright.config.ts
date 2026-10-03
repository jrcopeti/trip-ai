import { defineConfig, devices } from "@playwright/test";

const PORT = Number(process.env.PORT ?? 3000);
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
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],

  // Runs against a production build: `next dev` recompiles per route, which makes
  // the first navigation of each spec slow enough to trip the timeouts above.
  webServer: {
    command: "npm run start",
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    env: {
      // The three "use server" modules answer from fixtures instead of calling
      // Anthropic, Unsplash and OpenWeather — see src/app/api/e2eFixtures.ts.
      E2E_FIXTURES: "1",
    },
  },
});
