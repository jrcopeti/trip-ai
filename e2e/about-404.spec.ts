import { expect, test } from "@playwright/test";

test.describe("/about", () => {
  test("renders its heading and the author credit", async ({ page }) => {
    await page.goto("/about");

    await expect(page.getByRole("heading", { name: /about trip ai/i })).toBeVisible();
    await expect(
      page.getByRole("link", { name: "José Copeti" }),
    ).toHaveAttribute("href", "https://github.com/jrcopeti");
  });

  test("does not scroll horizontally at 390px", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/about");

    const overflows = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
    );
    expect(overflows).toBe(false);
  });

  test("renders the photo in the first byte, with a real alt", async ({ page }) => {
    await page.goto("/about");

    // Picked server-side now: no mount gate, so no loader before it.
    const photo = page.getByRole("main").getByRole("img");
    await expect(photo).toBeVisible();
    await expect(photo).toHaveAttribute("alt", /\S/);
  });

  test("the closing call to action reaches /form", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/about");

    // Scoped to main: the nav carries a "Plan a trip" pill of its own.
    await page.getByRole("main").getByRole("link", { name: "Plan a trip" }).click();
    await expect(page).toHaveURL(/\/form$/);
  });
});

test.describe("not found", () => {
  test("an unknown route shows the not-found page", async ({ page }) => {
    const response = await page.goto("/this-route-does-not-exist");

    expect(response?.status()).toBe(404);
    await expect(
      page.getByText("This page actually doesn't exist."),
    ).toBeVisible();
  });

  test("the not-found page links home", async ({ page }) => {
    await page.goto("/this-route-does-not-exist");

    await page.getByRole("link", { name: /back to home/i }).click();
    await expect(page).toHaveURL(/\/$/);
  });

  test("an unknown saved trip shows its own not-found page", async ({ page }) => {
    await page.goto("/saved-trips/999999");

    await expect(
      page.getByText("Seems that this trip doesn't exist."),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: /back to saved trips/i }),
    ).toBeVisible();
  });

  test("a saved trip id that isn't a number shows the same page", async ({ page }) => {
    await page.goto("/saved-trips/not-a-number");

    await expect(page.getByText("Seems that this trip doesn't exist.")).toBeVisible();
  });

  test("an unknown trip url shows the trip's not-found page", async ({ page }) => {
    await page.goto("/trips/ffffffffffff");

    await expect(page.getByText("This trip is no longer available.")).toBeVisible();
    await expect(page.getByRole("link", { name: /back to home/i })).toBeVisible();
  });
});
