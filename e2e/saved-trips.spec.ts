import { expect, test } from "@playwright/test";

/**
 * Runs against the rows in `scripts/seed-e2e.ts`: Lisbon and Kyoto saved, Oslo
 * not. Seed before running (CI does it in the `e2e` job).
 */
test.describe("/saved-trips", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/saved-trips");
  });

  test("renders the seeded saved trips", async ({ page }) => {
    await expect(
      page.getByRole("heading", { level: 1, name: /where people went/i }),
    ).toBeVisible();
    await expect(page.getByRole("link", { name: /lisbon/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /kyoto/i })).toBeVisible();
  });

  test("counts the trips and offers no more when they all fit", async ({ page }) => {
    // Two saved seeds, well under a page of 18.
    await expect(page.getByText("2 of 2 trips")).toBeVisible();
    await expect(page.getByRole("button", { name: "Show more trips" })).toHaveCount(0);
  });

  test("excludes trips that were discarded", async ({ page }) => {
    await expect(page.getByRole("link", { name: /lisbon/i })).toBeVisible();
    // Oslo is seeded with saved: false and must never reach the grid.
    await expect(page.getByRole("link", { name: /oslo/i })).toHaveCount(0);
  });

  test("search narrows the grid by city", async ({ page }) => {
    await expect(page.getByRole("link", { name: /kyoto/i })).toBeVisible();

    await page.getByRole("searchbox", { name: "Search for a trip" }).fill("lisbon");

    await expect(page.getByRole("link", { name: /lisbon/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /kyoto/i })).toHaveCount(0);
  });

  test("search matches on the traveller's name too", async ({ page }) => {
    await page.getByRole("searchbox", { name: "Search for a trip" }).fill("bruno");

    await expect(page.getByRole("link", { name: /kyoto/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /lisbon/i })).toHaveCount(0);
  });

  test("a search with no matches shows the empty state", async ({ page }) => {
    await page.getByRole("searchbox", { name: "Search for a trip" }).fill("atlantis");

    await expect(page.getByText("No trips found")).toBeVisible();
  });

  test("clearing the search brings the grid back", async ({ page }) => {
    const search = page.getByRole("searchbox", { name: "Search for a trip" });
    await search.fill("atlantis");
    await expect(page.getByText("No trips found")).toBeVisible();

    await search.fill("");

    await expect(page.getByRole("link", { name: /lisbon/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /kyoto/i })).toBeVisible();
  });

  test("a card opens its detail page", async ({ page }) => {
    await page.getByRole("link", { name: /lisbon/i }).click();

    await expect(page).toHaveURL(/\/saved-trips\/\d+$/);
    await expect(page.getByText(/lisbon/i).first()).toBeVisible();
  });

  test("every card is visible rather than left at opacity 0", async ({ page }) => {
    // The old cards carried opacity-0 for a GSAP batch to clear, and each
    // polaroid now starts at opacity 0 inside a `Reveal`. If either entrance
    // stops running, the grid renders blank — this is the regression that
    // would hide.
    //
    // `toHaveCount` rather than `count()`: the grid is client-rendered from a
    // TanStack query, so at navigation there are no cards yet. `count()` does
    // not retry and would read that empty first paint; the web-first assertion
    // polls until the query resolves. Pinning the number also asserts both
    // seeded saved trips arrive and the discarded one stays out.
    const cards = page.getByRole("link", { name: /lisbon|kyoto/i });
    await expect(cards).toHaveCount(2);

    for (let i = 0; i < 2; i++) {
      await expect(cards.nth(i)).not.toHaveCSS("opacity", "0");
    }
  });

  test("the polaroids are not tilted at 390px", async ({ page }) => {
    // A rotated card overflows the 20px gutter on a phone, so the fan only
    // starts at `sm`.
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/saved-trips");
    const card = page.getByRole("link", { name: /lisbon/i });
    await expect(card).toBeVisible();

    await expect(card).toHaveCSS("rotate", "none");
  });

  test("does not scroll horizontally at 390px", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/saved-trips");
    await expect(page.getByRole("link", { name: /lisbon/i })).toBeVisible();

    const overflows = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
    );
    expect(overflows).toBe(false);
  });

  test.describe("at 390px", () => {
    test.beforeEach(async ({ page }) => {
      await page.setViewportSize({ width: 390, height: 844 });
      await page.goto("/saved-trips");
    });

    // The arrow was reported missing on a phone. Its draw-on is triggered from
    // the <svg>'s own box, not from the paths inside it: both paths must end
    // fully drawn (dash offset 0 on a dash of the whole length).
    test("draws the squiggle arrow under the search", async ({ page }) => {
      const arrow = page.locator("[data-squiggle-arrow]");
      await expect(arrow).toBeVisible();
      const paths = arrow.locator("path");
      await expect(paths).toHaveCount(2);
      for (const path of await paths.all()) {
        await expect(path).toHaveAttribute("stroke-dasharray", "1 1");
        await expect(path).toHaveAttribute("stroke-dashoffset", "0");
      }
    });

    test("keeps one sticker on a phone, clear of the search and inside the screen", async ({
      page,
    }) => {
      const sticker = page.locator('[data-sticker="phone"]');
      await expect(sticker).toBeVisible();
      const s = (await sticker.boundingBox())!;
      const search = (await page.getByRole("searchbox").boundingBox())!;
      expect(s.y).toBeGreaterThanOrEqual(search.y + search.height);
      expect(s.x + s.width).toBeLessThanOrEqual(390);

      // And clear of the arrow it shares the row with.
      const arrow = (await page.locator("[data-squiggle-arrow]").boundingBox())!;
      expect(s.x).toBeGreaterThanOrEqual(arrow.x + arrow.width);
    });
  });
});
