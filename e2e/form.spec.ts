import { expect, test } from "@playwright/test";
import {
  LISBON,
  chip,
  heading,
  next,
  pickCountry,
  stubLookups,
  walkAllSteps,
} from "./formWalk";

/**
 * The seven-step form, walked in the browser, with its lookups stubbed (see
 * `formWalk.ts`). Submitting — and the trip that comes back — is
 * `trip-journey.spec`.
 */

test.describe("/form", () => {
  test.beforeEach(async ({ page }) => {
    await stubLookups(page);
  });

  test("blocks a premature Next and shows why", async ({ page }) => {
    await page.goto("/form");
    await next(page);

    await expect(page.getByText("Name is required")).toBeVisible();
    await expect(page.getByText("Nationality is required")).toBeVisible();
    await expect(heading(page)).toHaveText("Personal information");
    await expect(page.getByText("Step 1 of 7")).toBeVisible();
  });

  test("walks all seven steps at 1440", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/form");
    await walkAllSteps(page);
  });

  test("walks all seven steps at 390", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/form");
    await walkAllSteps(page);
  });

  test("choosing a chip does not move any chip", async ({ page }) => {
    // The check mark used to sit inline, so a chosen chip grew and could push
    // its neighbours onto the next line — and back again when unchosen.
    // Reduced motion drops the step's slide-in, so the first measurement is not
    // taken mid-slide.
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/form");
    await page.getByRole("textbox", { name: /name/i }).fill("Ana");
    await page.getByRole("textbox", { name: /age/i }).fill("31");
    await pickCountry(page, /nationality/i, "Brazil");
    await next(page);
    await page.getByRole("textbox", { name: /city/i }).fill("Lisbon");
    await pickCountry(page, /country/i, "Portugal");
    await expect(page.getByRole("button", { name: "Next" })).toBeEnabled({ timeout: 10_000 });
    await next(page);
    await expect(heading(page)).toHaveText("Travel details");

    const boxes = () =>
      page.locator("label:has(input[type=radio])").evaluateAll((labels) => {
        // Relative to the step heading: clicking scrolls the chip into view,
        // which moves everything against the viewport without anything shifting.
        const top = document.querySelector("h1")!.getBoundingClientRect().y;
        return labels.map((l) => {
          const r = l.getBoundingClientRect();
          return [Math.round(r.x), Math.round(r.y - top), Math.round(r.width)];
        });
      });
    const before = await boxes();

    for (const option of ["Adventure", "Business", "Cultural", "Bed and Breakfast"]) {
      await chip(page, option);
      expect(await boxes()).toEqual(before);
    }
  });

  test("the city check does not move the layout", async ({ page }) => {
    // The check's squiggle used to be a block under the fields: it pushed the
    // buttons down while checking and back after, so a quick check was a jump.
    await page.unroute("https://secure.geonames.org/**");
    await page.route("https://secure.geonames.org/**", async (route) => {
      await new Promise((r) => setTimeout(r, 1500));
      await route.fulfill({ json: LISBON });
    });
    await page.goto("/form");
    await page.getByRole("textbox", { name: /name/i }).fill("Ana");
    await page.getByRole("textbox", { name: /age/i }).fill("31");
    await pickCountry(page, /nationality/i, "Brazil");
    await next(page);
    await expect(heading(page)).toHaveText("Destination");

    const nextButton = page.getByRole("button", { name: "Next" });
    const top = async () => (await nextButton.boundingBox())!.y;
    await pickCountry(page, /country/i, "Portugal");
    const idle = await top();

    await page.getByRole("textbox", { name: /city/i }).fill("Lisbon");
    const checking = page.getByRole("status", { name: "Checking the city" });
    await expect(checking).toBeVisible();
    // Inside the city field, not below the grid.
    await expect(page.getByRole("textbox", { name: /city/i }).locator("..").getByRole("status")).toBeVisible();
    expect(await top()).toBe(idle);

    await expect(checking).toBeHidden();
    expect(await top()).toBe(idle);
  });

  test("Back keeps what was entered", async ({ page }) => {
    await page.goto("/form");
    await page.getByRole("textbox", { name: /name/i }).fill("Ana");
    await page.getByRole("textbox", { name: /age/i }).fill("31");
    await pickCountry(page, /nationality/i, "Brazil");
    await next(page);
    await expect(heading(page)).toHaveText("Destination");

    await page.getByRole("button", { name: "Back" }).click();

    await expect(heading(page)).toHaveText("Personal information");
    await expect(page.getByRole("textbox", { name: /name/i })).toHaveValue("Ana");
    await expect(page.getByRole("combobox", { name: /nationality/i })).toHaveValue("Brazil");
  });
});
