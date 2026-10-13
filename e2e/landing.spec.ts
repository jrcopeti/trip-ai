import { expect, test, type BrowserContext } from "@playwright/test";

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

  test.describe("intro", () => {
    // The intro writes its cookie on mount, after hydration: wait for it.
    const introCookie = async (context: BrowserContext) => {
      await expect
        .poll(async () => (await context.cookies()).some((c) => c.name === "trip-ai-intro-seen"))
        .toBe(true);
      return (await context.cookies()).find((c) => c.name === "trip-ai-intro-seen")!;
    };

    // Asserted on the server's HTML, not the live DOM: the intro removes itself
    // after ~3s, which a loaded runner can pass before the first assertion.
    test("is sent to a first-time visitor, who is then remembered for a day", async ({
      context,
      request,
    }) => {
      // `request` carries no cookies: a first visit.
      expect(await (await request.get("/")).text()).toContain("landing-intro");

      const cookie = await introCookie(context);
      expect(cookie.value).toBe("1");
      // A day, so a visitor coming back tomorrow is greeted again.
      const lifetime = cookie.expires - Date.now() / 1000;
      expect(lifetime).toBeGreaterThan(24 * 60 * 60 - 60);
      expect(lifetime).toBeLessThanOrEqual(24 * 60 * 60);
    });

    test("is left out of the HTML on a repeat visit", async ({ page, context }) => {
      await introCookie(context);
      // The cookie is read on the server, so the curtain is never sent rather
      // than sent and pulled down after hydration. `page.request` carries the
      // cookie the first visit set.
      expect(await (await page.request.get("/")).text()).not.toContain("landing-intro");

      await page.reload();
      await expect(page.locator(".landing-intro")).toHaveCount(0);
      // Without the intro to wait for, the hero's deck deals straight away.
      const deck = page.getByRole("list", { name: "Latest saved trips" });
      await expect(deck.getByRole("link").first()).toBeVisible();
    });
  });

  test("shows the nav wordmark", async ({ page }) => {
    await expect(page.locator("[data-wordmark]")).toHaveText("trip ai");
  });

  test("keeps the intro-measuring hook the wordmark animation depends on", async ({
    page,
  }) => {
    await expect(page.locator("[data-wordmark]")).toHaveCount(1);
  });

  // As in the nav and footer: centred beside the word, a touch taller than its
  // line. At two-thirds of the word it read too small on a phone.
  for (const width of [390, 768, 1440]) {
    test(`the lockup tile sits beside the wordmark at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto("/");

      const row = page.locator("[data-logo-lockup]");
      await row.scrollIntoViewIfNeeded();

      // Both boxes in one call: `Reveal` is still sliding the block up, and two
      // separate reads would land on different frames.
      const { fontSize, word, tile } = await row.evaluate((el) => {
        const box = (e: Element) => {
          const r = e.getBoundingClientRect();
          return { right: r.right, left: r.left, middle: r.top + r.height / 2, height: r.height };
        };
        const word = el.firstElementChild!;
        return {
          fontSize: parseFloat(getComputedStyle(word).fontSize),
          word: box(word),
          tile: box(el.querySelector("span[aria-hidden]")!),
        };
      });
      expect(Math.abs(tile.height - fontSize * 0.9)).toBeLessThanOrEqual(2);
      expect(tile.left).toBeGreaterThan(word.right);
      expect(Math.abs(tile.middle - word.middle)).toBeLessThanOrEqual(2);
    });
  }

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

    test("separates the polaroids on a phone instead of overlapping them", async ({ page }) => {
      await page.setViewportSize({ width: 390, height: 844 });
      await page.goto("/");

      const cards = page.getByRole("list", { name: "Latest saved trips" }).getByRole("listitem");
      await expect(cards).toHaveCount(2);
      const [a, b] = [(await cards.nth(0).boundingBox())!, (await cards.nth(1).boundingBox())!];
      expect(b.y).toBeGreaterThanOrEqual(a.y + a.height);
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
  test("keeps a sticker on a phone, clear of the heading", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");

    const sticker = page.locator('[data-sticker="phone"]');
    await expect(sticker).toBeVisible();
    const s = (await sticker.boundingBox())!;
    const h1 = (await page.getByRole("heading", { level: 1 }).boundingBox())!;
    expect(s.y).toBeGreaterThanOrEqual(h1.y + h1.height);
    expect(s.x + s.width).toBeLessThanOrEqual(390);
  });

  // The cyan sticker sat at a fixed 4% from the viewport edge, which landed on
  // "Plan the trip." at every width the gutter is narrower than the sticker.
  // Each is shown only where it fits: cyan from 85rem, orchid from lg. Below that
  // the test asserts it is hidden, so neither can pass by disappearing.
  for (const width of [768, 1024, 1280, 1360, 1440, 1920]) {
    test(`the go-anywhere sticker stays clear of the heading at ${width}px`, async ({ page }) => {
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.setViewportSize({ width, height: 900 });
      await page.goto("/");

      const sticker = page.locator(".parallax-drift", { hasText: "go anywhere" });
      if (width < 1360) return await expect(sticker).toBeHidden();
      await expect(sticker).toBeVisible();
      const s = (await sticker.boundingBox())!;
      const h1 = (await page.getByRole("heading", { level: 1 }).boundingBox())!;
      expect(s.x).toBeGreaterThanOrEqual(0);
      expect(s.x + s.width).toBeLessThanOrEqual(h1.x);
    });

    // The orchid one, at a percentage of the hero's height, tucked under the buttons.
    test(`the pack-light sticker stays above the hero buttons at ${width}px`, async ({ page }) => {
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.setViewportSize({ width, height: 900 });
      await page.goto("/");

      const sticker = page.locator(".parallax-drift", { hasText: "pack light" });
      if (width < 1024) return await expect(sticker).toBeHidden();
      await expect(sticker).toBeVisible();
      const s = (await sticker.boundingBox())!;
      const button = (await page
        .locator("section")
        .first()
        .getByRole("link", { name: "See saved trips" })
        .boundingBox())!;
      expect(s.y + s.height).toBeLessThanOrEqual(button.y);
    });
  }
});
