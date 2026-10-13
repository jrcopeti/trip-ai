import { expect, type Page } from "@playwright/test";

/**
 * The seven-step form, shared by `form.spec` and the trip journey. The country list
 * (flagcdn) is stubbed here; the city check runs on the server, which answers from
 * the GeoNames fixture under `E2E_FIXTURES=1`.
 */

export const COUNTRIES = { br: "Brazil", pt: "Portugal", es: "Spain" };

export async function stubLookups(page: Page) {
  await page.route("https://flagcdn.com/en/codes.json", (route) =>
    route.fulfill({ json: COUNTRIES }),
  );
}

export const heading = (page: Page) => page.getByRole("heading", { level: 1 });
export const next = (page: Page) => page.getByRole("button", { name: "Next" }).click();
/** Chips are labels around a visually hidden input; click what a person clicks. */
export const chip = (page: Page, name: string) =>
  page.locator("label", { hasText: new RegExp(`^${name}$`) }).click();

export async function pickCountry(page: Page, field: RegExp, name: string) {
  const combo = page.getByRole("combobox", { name: field });
  await expect(combo).toBeEnabled();
  await combo.click();
  await combo.pressSequentially(name.slice(0, 4));
  await page.getByRole("option", { name }).click();
}

export async function noHorizontalScroll(page: Page) {
  const overflows = await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
  );
  expect(overflows).toBe(false);
}

/** Step 1: the name, who's going, one age range and a passport. */
export async function fillStepOne(page: Page, name = "Ana") {
  await page.getByRole("textbox", { name: /name/i }).fill(name);
  await chip(page, "Couple");
  await chip(page, "18–34");
  await pickCountry(page, /passport/i, "Brazil");
}

/** Fills every step and stops at an enabled "Plan my trip". */
export async function walkAllSteps(page: Page, name = "Ana") {
  await expect(heading(page)).toHaveText("Personal information");
  await expect(page.getByText("Step 1 of 7")).toBeVisible();
  await fillStepOne(page, name);
  await noHorizontalScroll(page);
  await next(page);

  await expect(heading(page)).toHaveText("Destination");
  await pickCountry(page, /country/i, "Portugal");
  await page.getByRole("textbox", { name: /city/i }).fill("Lisbon");
  // Next waits for the city check, debounced by a second.
  await expect(page.getByRole("button", { name: "Next" })).toBeEnabled({ timeout: 10_000 });
  await expect(page.getByText("Found Lisbon, Portugal")).toBeVisible();
  await noHorizontalScroll(page);
  await next(page);

  await expect(heading(page)).toHaveText("Travel details");
  for (const option of ["Cultural", "Balanced", "Hotel", "Carry-on", "Plane", "Comfort"]) {
    await chip(page, option);
  }
  await expect(page.getByRole("radio", { name: "Cultural" })).toBeChecked();
  await noHorizontalScroll(page);
  await next(page);

  await expect(heading(page)).toHaveText("Required items");
  await page.getByRole("textbox", { name: "Item 1" }).fill("camera");
  await noHorizontalScroll(page);
  await next(page);

  await expect(heading(page)).toHaveText("Dates and weather");
  await page.locator("label", { hasText: "Plan around the weather" }).click();
  await expect(page.getByText(/follow the forecast/)).toBeVisible();
  await noHorizontalScroll(page);
  await next(page);

  await expect(heading(page)).toHaveText("Interests and notes");
  await chip(page, "Architecture");
  await page.getByRole("textbox", { name: /notes/i }).fill("a day trip to Sintra");
  await noHorizontalScroll(page);
  await next(page);

  await expect(heading(page)).toHaveText("Review and submit");
  await expect(page.getByText("Step 7 of 7")).toBeVisible();
  // Exact, or it also matches the city check's toast if that is still up.
  await expect(page.getByText("Lisbon, Portugal", { exact: true })).toBeVisible();
  const submit = page.getByRole("button", { name: "Plan my trip" });
  await expect(submit).toBeDisabled();
  await page.locator("label", { hasText: /I agree/ }).click();
  await expect(submit).toBeEnabled();
  await noHorizontalScroll(page);
}
