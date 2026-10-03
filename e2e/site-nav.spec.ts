import { expect, test, type Page } from "@playwright/test";

const MOBILE = { width: 390, height: 844 };
const DESKTOP = { width: 1440, height: 900 };

/**
 * The nav bar itself. Every locator here is scoped to it: the footer carries
 * links with the same names, so an unscoped `getByRole("link")` matches two.
 */
function nav(page: Page) {
  return page.locator("header nav");
}

test.describe("the shared nav", () => {
  test("is on every route, not just the landing", async ({ page }) => {
    await page.setViewportSize(DESKTOP);

    for (const path of ["/", "/about", "/form", "/saved-trips"]) {
      await page.goto(path);
      await expect(page.locator("[data-wordmark]")).toHaveText("trip ai");
    }
  });

  test("marks the route you are on", async ({ page }) => {
    await page.setViewportSize(DESKTOP);
    await page.goto("/about");

    await expect(
      nav(page).getByRole("link", { name: "About", exact: true }),
    ).toHaveAttribute("aria-current", "page");
    await expect(
      nav(page).getByRole("link", { name: "New trip", exact: true }),
    ).not.toHaveAttribute("aria-current", "page");
  });

  test("shows the links and hides the menu trigger above md", async ({ page }) => {
    await page.setViewportSize(DESKTOP);
    await page.goto("/");

    await expect(
      nav(page).getByRole("link", { name: "Saved trips", exact: true }),
    ).toBeVisible();
    await expect(page.getByRole("button", { name: "Menu" })).toBeHidden();
  });
});

test.describe("the mobile menu at 390px", () => {
  test.use({ viewport: MOBILE });

  test("hides the links behind the trigger", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByRole("button", { name: "Menu" })).toBeVisible();
    await expect(
      nav(page).getByRole("link", { name: "Saved trips", exact: true }),
    ).toBeHidden();
  });

  test("opens, navigates, and closes behind it", async ({ page }) => {
    await page.goto("/");
    const trigger = page.getByRole("button", { name: "Menu" });

    await trigger.click();
    await expect(trigger).toHaveAttribute("aria-expanded", "true");

    await page.locator("#site-menu").getByRole("link", { name: "Saved trips" }).click();

    await expect(page).toHaveURL(/\/saved-trips$/);
    // The pathname change closes it; the panel does not survive the navigation.
    await expect(page.getByRole("button", { name: "Menu" })).toHaveAttribute(
      "aria-expanded",
      "false",
    );
  });

  test("Escape closes it and focus lands back on the trigger", async ({ page }) => {
    await page.goto("/");
    const trigger = page.getByRole("button", { name: "Menu" });

    await trigger.click();
    await page.keyboard.press("Escape");

    await expect(trigger).toHaveAttribute("aria-expanded", "false");
    await expect(trigger).toBeFocused();
  });

  test("reaches the form from the panel's pill", async ({ page }) => {
    await page.goto("/about");

    await page.getByRole("button", { name: "Menu" }).click();
    await page.locator("#site-menu").getByRole("link", { name: "Plan a trip" }).click();

    await expect(page).toHaveURL(/\/form$/);
  });

  test("does not make the page scroll sideways when open", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Menu" }).click();
    await expect(page.locator("#site-menu")).toBeVisible();

    const overflows = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
    );
    expect(overflows).toBe(false);
  });
});
