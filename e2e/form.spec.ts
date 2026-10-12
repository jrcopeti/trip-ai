import { expect, test, type Page } from "@playwright/test";

/**
 * The seven-step form, walked in the browser. The form's two browser-side
 * lookups are stubbed so the run needs no network and no keys: the country list
 * (flagcdn) and the city check (GeoNames). Submitting — and the trip that comes
 * back — is the step 5 journey, so the walk stops at an enabled Submit.
 */

const COUNTRIES = { br: "Brazil", pt: "Portugal", es: "Spain" };
const LISBON = {
  totalResultsCount: 1,
  geonames: [{ name: "Lisbon", toponymName: "Lisboa", population: 517802 }],
};

async function stubLookups(page: Page) {
  await page.route("https://flagcdn.com/en/codes.json", (route) =>
    route.fulfill({ json: COUNTRIES }),
  );
  await page.route("https://secure.geonames.org/**", (route) => route.fulfill({ json: LISBON }));
}

const heading = (page: Page) => page.getByRole("heading", { level: 1 });
const next = (page: Page) => page.getByRole("button", { name: "Next" }).click();
/** Chips are labels around a visually hidden input; click what a person clicks. */
const chip = (page: Page, name: string) =>
  page.locator("label", { hasText: new RegExp(`^${name}$`) }).click();

async function pickCountry(page: Page, field: RegExp, name: string) {
  const combo = page.getByRole("combobox", { name: field });
  await expect(combo).toBeEnabled();
  await combo.click();
  await combo.pressSequentially(name.slice(0, 4));
  await page.getByRole("option", { name }).click();
}

async function noHorizontalScroll(page: Page) {
  const overflows = await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
  );
  expect(overflows).toBe(false);
}

async function walkAllSteps(page: Page) {
  await expect(heading(page)).toHaveText("Personal information");
  await expect(page.getByText("Step 1 of 7")).toBeVisible();
  await page.getByRole("textbox", { name: /name/i }).fill("Ana");
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
