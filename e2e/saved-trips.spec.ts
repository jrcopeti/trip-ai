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
    await expect(page.getByRole("heading", { name: "Saved Trips" })).toBeVisible();
    await expect(page.getByRole("link", { name: /lisbon/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /kyoto/i })).toBeVisible();
  });

  test("excludes trips that were discarded", async ({ page }) => {
    await expect(page.getByRole("link", { name: /lisbon/i })).toBeVisible();
    // Oslo is seeded with saved: false and must never reach the grid.
    await expect(page.getByRole("link", { name: /oslo/i })).toHaveCount(0);
  });

  test("search narrows the grid by city", async ({ page }) => {
    await expect(page.getByRole("link", { name: /kyoto/i })).toBeVisible();

    await page.getByRole("textbox").fill("lisbon");

    await expect(page.getByRole("link", { name: /lisbon/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /kyoto/i })).toHaveCount(0);
  });

  test("search matches on the traveller's name too", async ({ page }) => {
    await page.getByRole("textbox").fill("bruno");

    await expect(page.getByRole("link", { name: /kyoto/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /lisbon/i })).toHaveCount(0);
  });

  test("a search with no matches shows the empty state", async ({ page }) => {
    await page.getByRole("textbox").fill("atlantis");

    await expect(page.getByText("No trips found")).toBeVisible();
  });

  test("clearing the search brings the grid back", async ({ page }) => {
    const search = page.getByRole("textbox");
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
    // The cards carry opacity-0 for a GSAP batch to clear. If that animation
    // stops running and the class stays, the grid renders blank — this is the
    // regression that would hide.
    const cards = page.getByRole("link", { name: /lisbon|kyoto/i });
    const count = await cards.count();
    expect(count).toBeGreaterThan(0);

    for (let i = 0; i < count; i++) {
      await expect(cards.nth(i)).not.toHaveCSS("opacity", "0");
    }
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
});
