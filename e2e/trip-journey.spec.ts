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
 * - It writes only through the server this run starts, which `playwright.config.ts`
 *   points at `E2E_DATABASE_URL`. Against PLAYWRIGHT_BASE_URL that database is
 *   unknown — the deployed site writes to production — so it skips; and like the
 *   seed script it refuses a non-local e2e database.
 */

loadEnvConfig(process.cwd());

/** Names only this spec uses, so its rows are the only ones it touches. */
const SAVER = "Journeysave";
const DISCARDER = "Journeydiscard";
const LEAVER = "Journeyleave";

test.skip(
  !!process.env.PLAYWRIGHT_BASE_URL,
  "Writes trips: only through the server this run starts, never PLAYWRIGHT_BASE_URL",
);
test.skip(
  !mayWriteToDatabase(process.env.DATABASE_URL),
  "Writes trips: needs a local E2E_DATABASE_URL (or ALLOW_REMOTE_E2E_SEED=1)",
);

async function deleteOwnRows() {
  const prisma = new PrismaClient();
  try {
    await prisma.trip.deleteMany({
      where: { userName: { in: [SAVER, DISCARDER, LEAVER].map((n) => n.toLowerCase()) } },
    });
  } finally {
    await prisma.$disconnect();
  }
}

/** The `saved` flag of each of `name`'s rows. */
async function savedFlags(name: string) {
  const prisma = new PrismaClient();
  try {
    const rows = await prisma.trip.findMany({ where: { userName: name.toLowerCase() } });
    return rows.map((row) => row.saved);
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

  await expect(page).toHaveURL(/\/trips\/[0-9a-f]{12}$/);
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

    // Back restores the trip page from the router's cache, which must know it's saved:
    // asking again would fail, as the row is no longer unsaved. Before any reload,
    // which would refill that cache from the server.
    await page.getByRole("link", { name: "View saved trips" }).click();
    await expect(page).toHaveURL(/\/saved-trips$/);
    await page.goBack();
    await expect(page.getByRole("heading", { name: "What next?" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Yes, save it" })).toHaveCount(0);

    // The answer is on the row, so a refresh doesn't ask again.
    await page.reload();
    await expect(page.getByRole("heading", { name: "What next?" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Yes, save it" })).toHaveCount(0);

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
    // The walk picks a cultural trip planned around the forecast.
    await expect(page.getByText("A cultural trip · 5 days")).toBeVisible();
    // Its real dates stay, with a note that the forecast set them.
    await expect(page.getByText("Planned by the forecast")).toBeVisible();

    // A trip that comes back clears the form's draft, so coming back to it starts afresh.
    await page.getByRole("link", { name: "New trip" }).first().click();
    await expect(page).toHaveURL(/\/form$/);
    await expect(page.getByText("Step 1 of 7")).toBeVisible();
    await expect(page.getByRole("textbox", { name: /name/i })).toHaveValue("");
  });

  test("a discarded trip does not", async ({ page }) => {
    // Reduced motion, so the carousel is not measured mid-entrance or mid-slide.
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.setViewportSize({ width: 390, height: 844 });
    await generateTrip(page, DISCARDER);
    // The trip is the row the server wrote, not client memory: a refresh keeps it.
    await page.reload();
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(tripDataFixture.title!);
    await noHorizontalScroll(page);

    // The tours are a carousel: one at a time, Next brings the second.
    const tours = tripDataFixture.tours as unknown as {
      title: string;
      kind: string;
      description: string;
    }[];
    const of = (n: number) => `${n} of ${tours.length}`;
    const carousel = page.getByRole("region", { name: "Suggested tours" });
    await expect(carousel.getByRole("group", { name: of(1) })).toContainText(
      tours[0].description,
    );
    await expect(carousel.getByRole("group", { name: of(1) })).toContainText(tours[0].kind);
    await expect(carousel.getByRole("heading", { level: 3 })).toHaveText(tours[0].title);
    // The fixture's tours wrap to different heights at 390. The card is sized to
    // the longest, so stepping through them must not change the carousel's
    // height — or move the rest of the page below it.
    const nextTour = carousel.getByRole("button", { name: "Next tour" });
    const height = async () => (await carousel.boundingBox())!.height;
    const before = await height();
    for (const [i, tour] of tours.slice(1).entries()) {
      await nextTour.click();
      await expect(carousel.getByRole("group", { name: of(i + 2) })).toHaveText(
        new RegExp(`${tour.kind}.*${tour.title}.*${tour.description}`),
      );
      expect(await height()).toBe(before);
    }
    await noHorizontalScroll(page);

    // Every photo shows on a phone too — the details and closing photos used to
    // be desktop-only.
    const sections = page.locator("main > section");
    for (const section of [sections.nth(-2), sections.last()]) {
      const photo = section.locator("img").last(); // the details also hold the flag
      await photo.scrollIntoViewIfNeeded();
      await expect(photo).toBeVisible();
    }

    await page.getByRole("button", { name: "No, thanks" }).click();
    // The answer is written either way; wait for it before looking.
    await expect(page.getByRole("heading", { name: "What next?" })).toBeVisible();

    // Generation wrote the row; the answer only left it unsaved.
    expect(await savedFlags(DISCARDER)).toEqual([false]);

    await page.goto("/saved-trips");
    await searchSavedTrips(page, DISCARDER);
    await expect(page.getByText("No trips found")).toBeVisible();
  });

  test("leaving mid-generation keeps it, and a toast opens the trip", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await stubLookups(page);
    // A soft navigation into /form, so the page's JS keeps running throughout.
    await page.goto("/about");
    await page.getByRole("link", { name: "New trip" }).first().click();
    await expect(page).toHaveURL(/\/form$/);
    await walkAllSteps(page, LEAVER);

    // Generation is a server action, a POST to /form; hold it until the traveller is away.
    let release = () => {};
    const held = new Promise<void>((r) => (release = r));
    await page.route("**/form", async (route) => {
      if (route.request().method() === "POST") await held;
      await route.continue();
    });
    await page.getByRole("button", { name: "Plan my trip" }).click();
    await expect(
      page.getByText("You can keep browsing while we plan your trip but reloading or closing the tab stops it."),
    ).toBeVisible();

    // The loader covers the nav; its link is the way out, a soft navigation.
    await page.getByRole("link", { name: "Browse saved trips" }).click();
    await expect(page).toHaveURL(/\/saved-trips$/);
    const planning = page.getByRole("status").filter({ hasText: "Your trip is being planned" });
    await expect(planning).toBeVisible();
    await expect(planning.getByRole("button", { name: "Stop" })).toBeVisible();
    await noHorizontalScroll(page);

    // The planning toast's View goes back to the loader; the toast gives way to it there.
    await planning.getByRole("link", { name: "View" }).click();
    await expect(page).toHaveURL(/\/form$/);
    await expect(page.getByRole("link", { name: "Browse saved trips" })).toBeVisible();
    await expect(planning).toBeHidden();
    await page.getByRole("link", { name: "Browse saved trips" }).click();
    await expect(page).toHaveURL(/\/saved-trips$/);
    await expect(planning).toBeVisible();

    release();
    const ready = page.getByRole("status").filter({ hasText: "Your trip has been generated!" });
    const view = ready.getByRole("link", { name: "View" });
    await expect(view).toBeVisible();
    // Nobody is moved without asking.
    await expect(page).toHaveURL(/\/saved-trips$/);

    await view.click();
    await expect(page).toHaveURL(/\/trips\/[0-9a-f]{12}$/);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(tripDataFixture.title!);
    await expect(view).toBeHidden();
  });
});
