import { expect, test } from "@playwright/test";

test.describe("landing page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("renders the hero without the intro blocking it", async ({ page }) => {
    // The intro overlays the page rather than gating it, so the hero is in the
    // DOM from the first byte. If that regresses, this fails before the curtain
    // would have lifted.
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });

  test("shows the nav wordmark", async ({ page }) => {
    await expect(page.locator("[data-wordmark]")).toHaveText("trip ai");
  });

  test("keeps the intro-measuring hook the wordmark animation depends on", async ({
    page,
  }) => {
    await expect(page.locator("[data-wordmark]")).toHaveCount(1);
  });

  test("the primary call to action reaches the form", async ({ page }) => {
    await page.getByRole("link", { name: "Plan a trip" }).first().click();
    await expect(page).toHaveURL(/\/form$/);
  });

  test.describe("navigation", () => {
    for (const { name, path } of [
      { name: "New trip", path: "/form" },
      { name: "Saved trips", path: "/saved-trips" },
      { name: "About", path: "/about" },
    ]) {
      test(`the ${name} link reaches ${path}`, async ({ page }) => {
        await page.getByRole("link", { name, exact: true }).first().click();
        await expect(page).toHaveURL(new RegExp(`${path}$`));
      });
    }
  });

  test.describe("hero deck", () => {
    // Runs against `scripts/seed-e2e.ts`: Lisbon and Kyoto saved, Oslo discarded.
    // Seeded in one statement, so they share `createdAt` and the higher id leads.
    test("deals the saved trips as polaroids, newest first", async ({ page }) => {
      const deck = page.getByRole("list", { name: "Latest saved trips" });
      const cards = deck.getByRole("link");
      await expect(cards).toHaveCount(2);
      await expect(cards.nth(0)).toHaveAccessibleName(/^kyoto, Japan/i);
      await expect(cards.nth(1)).toHaveAccessibleName(/^lisbon, Portugal/i);
    });

    test("never deals a discarded trip", async ({ page }) => {
      const deck = page.getByRole("list", { name: "Latest saved trips" });
      await expect(deck.getByRole("link")).toHaveCount(2);
      await expect(deck.getByRole("link", { name: /oslo/i })).toHaveCount(0);
    });

    test("a polaroid opens its saved trip", async ({ page }) => {
      const first = page.getByRole("list", { name: "Latest saved trips" }).getByRole("link").first();
      const href = await first.getAttribute("href");
      expect(href).toMatch(/^\/saved-trips\/\d+$/);

      await first.click();
      await expect(page).toHaveURL(new RegExp(`${href}$`));
      await expect(page.getByRole("heading", { level: 1 })).toContainText(/kyoto/i);
    });
  });

  test("shows five sample tours under the band, each with its kind", async ({ page }) => {
    const heading = page.getByRole("heading", { level: 2, name: /^What comes back:/ });
    const section = page.locator("section").filter({ has: heading });
    const tours = section.getByRole("article");
    await expect(tours).toHaveCount(5);
    for (const kind of ["Nature", "History", "Art", "Food", "Nightlife"]) {
      await expect(section.getByText(kind, { exact: true })).toBeVisible();
    }
  });

  test("picks the band photo per request, from the bundled set", async ({ page }) => {
    const band = page.locator("section").filter({
      has: page.getByRole("heading", { level: 2, name: /^What comes back:/ }),
    });
    const alts = new Set<string>();
    for (let i = 0; i < 8; i++) {
      await page.goto("/");
      alts.add((await band.getByRole("img").first().getAttribute("alt")) ?? "");
    }
    // Eight loads of a random pick from the set: one photo every time would
    // mean it was fixed at build time.
    expect(alts.size).toBeGreaterThan(1);
  });

  test("does not scroll horizontally at 390px", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");

    const overflows = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
    );
    expect(overflows).toBe(false);
  });

  test("renders with reduced motion without going blank", async ({ page }) => {
    // The failure this guards: a reduced-motion branch leaving the server's
    // opacity: 0 in the DOM with no animation left to clear it.
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");

    const heading = page.getByRole("heading", { level: 1 });
    await expect(heading).toBeVisible();
    await expect(heading).not.toHaveCSS("opacity", "0");
  });

  test("logs no console errors", async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (message) => {
      if (message.type() === "error") errors.push(message.text());
    });

    await page.goto("/");
    await page.waitForLoadState("networkidle");

    expect(errors).toEqual([]);
  });
});
