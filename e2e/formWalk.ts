import { expect, type Page } from "@playwright/test";

/**
 * The seven-step form, shared by `form.spec` and the trip journey. The form's two
 * browser-side lookups are stubbed so a walk needs no network and no keys: the
 * country list (flagcdn) and the city check (GeoNames).
 */

export const COUNTRIES = { br: "Brazil", pt: "Portugal", es: "Spain" };
export const LISBON = {
  totalResultsCount: 1,
  geonames: [{ name: "Lisbon", toponymName: "Lisboa", population: 517802 }],
};

export async function stubLookups(page: Page) {
  await page.route("https://flagcdn.com/en/codes.json", (route) =>
    route.fulfill({ json: COUNTRIES }),
  );
  await page.route("https://secure.geonames.org/**", (route) => route.fulfill({ json: LISBON }));
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

/** Fills every step and stops at an enabled "Plan my trip". */
export async function walkAllSteps(page: Page, name = "Ana") {
  await expect(heading(page)).toHaveText("Personal information");
  await expect(page.getByText("Step 1 of 7")).toBeVisible();
  await page.getByRole("textbox", { name: /name/i }).fill(name);
  await page.getByRole("textbox", { name: /age/i }).fill("31");
  await pickCountry(page, /nationality/i, "Brazil");
  await noHorizontalScroll(page);
  await next(page);

  await expect(heading(page)).toHaveText("Destination");
  await page.getByRole("textbox", { name: /city/i }).fill("Lisbon");
  await pickCountry(page, /country/i, "Portugal");
  // Next waits for the (stubbed) city check, debounced by a second.
  await expect(page.getByRole("button", { name: "Next" })).toBeEnabled({ timeout: 10_000 });
  await noHorizontalScroll(page);
  await next(page);

  await expect(heading(page)).toHaveText("Travel details");
  for (const option of ["Cultural", "Hotel", "Carry-on", "Plane", "Comfort"]) {
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
  await expect(page.getByText("Lisbon, Portugal")).toBeVisible();
  const submit = page.getByRole("button", { name: "Plan my trip" });
  await expect(submit).toBeDisabled();
  await page.locator("label", { hasText: /I agree/ }).click();
  await expect(submit).toBeEnabled();
  await noHorizontalScroll(page);
}
