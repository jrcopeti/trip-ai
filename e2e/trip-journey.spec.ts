import { expect, test, type Page } from "@playwright/test";
import { loadEnvConfig } from "@next/env";
import { PrismaClient } from "@prisma/client";
import { tripDataFixture } from "../src/test/fixtures/tripData";
import { mayWriteToDatabase } from "../scripts/localDatabase";
import { noHorizontalScroll, stubLookups, walkAllSteps } from "./formWalk";

/**
 * Form → generated trip → save or discard → `/saved-trips`. With E2E_FIXTURES=1
 * the trip, its photos and the weather are the unit-test fixtures, so the trip
 * page's polaroid is captioned with the fixture's title.
 *
 * This is the one spec that writes: each run adds a trip per test. Two
 * consequences, both handled here and in `playwright.config.ts`:
 *
 * - It runs in its own project, after every other spec, so `saved-trips.spec`
 *   counts the seeded rows and nothing else. And it deletes its own rows before
 *   and after, so a second run against the same seed starts clean too.
 * - It refuses a remote database, like the seed script. The server reads
 *   DATABASE_URL the way Next does — the environment, then `.env.local`, then
 *   `.env`, which points at production — so the same lookup is done here.
 */

loadEnvConfig(process.cwd());

/** Names only this spec uses, so its rows are the only ones it touches. */
const SAVER = "Journeysave";
const DISCARDER = "Journeydiscard";

test.skip(
  !mayWriteToDatabase(process.env.DATABASE_URL),
  "Writes trips: needs a local DATABASE_URL (or ALLOW_REMOTE_E2E_SEED=1)",
);

async function deleteOwnRows() {
  const prisma = new PrismaClient();
  try {
    await prisma.trip.deleteMany({
      where: { userName: { in: [SAVER, DISCARDER].map((n) => n.toLowerCase()) } },
    });
  } finally {
    await prisma.$disconnect();
  }
}


/** Walks the form as `name`, submits, and waits for the generated trip. */
async function generateTrip(page: Page, name: string) {
  await stubLookups(page);
  await page.goto("/form");
  await walkAllSteps(page, name);
  await page.getByRole("button", { name: "Plan my trip" }).click();

  await expect(page).toHaveURL(/\/trips\/[\w-]{5}$/);
  // The polaroid's caption is the page's h1.
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(tripDataFixture.title!);
}

async function searchSavedTrips(page: Page, term: string) {
  await page.getByRole("searchbox", { name: "Search for a trip" }).fill(term);
}

test.describe("trip journey", () => {
  // One worker, in order: the cleanup hooks delete both tests' rows, and with a
  // worker each, one test's afterAll deleted the other's trip mid-search.
  test.describe.configure({ mode: "serial" });

  // Seven form steps, a debounced city check, generation and a save: the
  // default 30s is mostly spent before the part under test begins.
  test.slow();

  test.beforeAll(deleteOwnRows);
  test.afterAll(deleteOwnRows);

  test("a saved trip shows up in /saved-trips", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await generateTrip(page, SAVER);

    await page.getByRole("button", { name: "Yes, save it" }).click();
    await expect(page.getByRole("heading", { name: "What next?" })).toBeVisible();

    await page.getByRole("link", { name: "View saved trips" }).click();
    await expect(page).toHaveURL(/\/saved-trips$/);
    await searchSavedTrips(page, SAVER);

    const card = page.getByRole("link", { name: new RegExp(SAVER, "i") });
    await expect(card).toBeVisible();
    // The grid re-renders when the search settles; click the settled card.
    await expect(page.getByText("1 of 1 trips")).toBeVisible();

    // And it opens as a saved trip, under the same polaroid title.
    await card.click();
    await expect(page).toHaveURL(/\/saved-trips\/\d+$/);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(tripDataFixture.title!);
    await expect(page.getByText("A saved trip")).toBeVisible();
  });

  test("a discarded trip does not", async ({ page }) => {
    // Reduced motion, so the carousel is not measured mid-entrance or mid-slide.
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.setViewportSize({ width: 390, height: 844 });
    await generateTrip(page, DISCARDER);
    await noHorizontalScroll(page);

    // The tours are a carousel: one at a time, Next brings the second.
    const tours = tripDataFixture.tours as unknown as string[];
    const carousel = page.getByRole("region", { name: "Suggested tours" });
    await expect(carousel.getByRole("group", { name: "1 of 3" })).toContainText(tours[0]);
    // No titles from the AI yet: the title slot holds the placeholder.
    await expect(carousel.getByRole("heading", { level: 3 })).toHaveText("Tour title");
    // The fixture's tours wrap to different heights at 390. The card is sized to
    // the longest, so stepping through them must not change the carousel's
    // height — or move the rest of the page below it.
    const nextTour = carousel.getByRole("button", { name: "Next tour" });
    const height = async () => (await carousel.boundingBox())!.height;
    const before = await height();
    for (const [i, tour] of tours.slice(1).entries()) {
      await nextTour.click();
      await expect(carousel.getByRole("group", { name: `${i + 2} of 3` })).toHaveText(
        new RegExp(tour),
      );
      expect(await height()).toBe(before);
    }
    await noHorizontalScroll(page);

    await page.getByRole("button", { name: "No, thanks" }).click();
    // The answer is written either way; wait for it before looking.
    await expect(page.getByRole("heading", { name: "What next?" })).toBeVisible();

    await page.goto("/saved-trips");
    await searchSavedTrips(page, DISCARDER);
    await expect(page.getByText("No trips found")).toBeVisible();
  });
});
