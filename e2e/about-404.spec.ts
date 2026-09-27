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

    // The route renders, then calls notFound() from a client component once the
    // query resolves empty — so the response is a 200 carrying the 404 UI.
    await expect(
      page.getByText("Seems that this trip doesn't exist."),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: /back to saved trips/i }),
    ).toBeVisible();
  });
});
