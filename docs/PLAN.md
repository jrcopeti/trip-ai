# PLAN

Working plan for whatever is currently in progress. Tracked, so it is visible in the
Explorer and in diffs, and it travels with the repo.

Keep it current: read it at the start of a task, update it as the shape of the work
changes, and clear finished items out rather than letting them pile up. Churn here is
expected and fine — it is a plan, not a record. If a decision turns out to be durable it
belongs in `docs/design-notes.md` (visual system) or `CLAUDE.md` (rules), not here.

---

## Now

**Step 0 — test harness and backfill.** See the step list below.

## Next

Step 1 — the shared shell. Then steps 2–6 in order.

## Open questions

_None._

---

# The sorbet migration

## Why

`/` ships the `sorbet` system and is the reference implementation; `/form`,
`/trips/[tripUrl]`, `/saved-trips`, `/saved-trips/[id]` and `/about` still run the
previous look (old palettes, `Container`/`GridContainer`/`GradientBg` full-viewport
panels, GSAP + Locomotive Scroll, HeroUI defaults). `docs/design-notes.md` records the
system; it does not say in what order the rest of the app gets migrated or how each
route is executed. This is that order.

The project also has **no tests** — no runner, no test files, and CI gates only
`typecheck` and `build`. Restyling every route with no regression net is how the form's
data lifecycle or the save/discard flow breaks silently, so the suite lands first (step
0) and grows with each step after it.

## Decisions

| Decision | Choice |
| --- | --- |
| Order | Test harness + backfill → shared shell → `/about` → `/saved-trips` → `/form` → trip pages → cleanup |
| Tests | Vitest + React Testing Library. Step 0 backfills the existing app, then every step ships tests for what it touches |
| E2E | Committed `@playwright/test` suite, chromium, in CI; Playwright **MCP** for iteration inside each step |
| Mocking | `vi.mock` at the module boundary — `@/db/actions`, `@/db`, and the three `"use server"` API modules |
| HeroUI | Keep the primitives, restyle them; never HeroUI `Button` on a migrated page |
| Trip pages | Rip out GSAP + Locomotive; rebuild as normal scrolling sorbet sections |
| Delivery | One branch + PR per step, off `main`, green `tsc` + `test` + `build` before the next |
| Polaroid | White frame, ink shadow, fan tilt, handwriting caption, `Reveal` in / straighten on hover |
| Polaroid scope | The `/saved-trips` grid **and the title of both trip routes**. Landing `PhotoBand` is left alone |
| Mobile nav | `SiteNav` gets a real disclosure menu below `md` |

## The polaroid (non-negotiable)

New shared component `src/components/sorbet/Polaroid.tsx`. Every value already exists in
the system; the only inventions are the caption face and a white token.

```tsx
// Frame — white paper, the system's single ink-tinted shadow, card-tier radius
"rounded-2xl bg-white p-3 pb-0 shadow-[0_18px_40px_-24px_rgba(48,46,45,0.55)]"
// Photo — square inset, radius one tier below the frame
"relative aspect-square overflow-hidden rounded-xl"
// Caption lip — the fat bottom edge that makes it a polaroid
"flex items-end justify-between gap-2 px-1 pb-4 pt-3"
```

- **Caption** — `font-sorbet-hand text-2xl leading-none text-sorbet-ink`
  (`{city}, {country}`). Caveat's x-height is small; never below `text-xl`.
- **Byline** — stays Rubik, meta-label idiom:
  `text-xs font-medium uppercase tracking-[0.12em] text-sorbet-ink/45` (`by {userName}`).
- **Arrow** — the standard chip-size disc, `size-8`, `aria-hidden`, bottom-right of the lip.
- **Tilt** — deterministic fan by index, reusing the Hero deck's vocabulary:
  `["sm:-rotate-2", "sm:rotate-1", "sm:-rotate-1", "sm:rotate-2"]`. **No tilt below
  `sm`** — at 390px a rotated card overflows the gutter.
- **Hover** — `transition-transform hover:rotate-0 hover:-translate-y-2` (the deck's
  existing hover value) plus `motion-reduce:transition-none`.
- **Link + focus** — the whole card is a `<Link>` around an `<article>`, with
  `rounded-2xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sorbet-ink`.
- **Entrance** — wrapped in the shared `Reveal`, `delay={0.06 * i}`.

Additive-only token and font work it needs:

- `--color-sorbet-white: #ffffff` in `@theme` — the name design-notes already reserves.
- `Caveat` (400, 600) loaded in `src/app/layout.tsx` as `variable: "--font-caveat"`,
  **added to the `<html>` className** next to `rubik.variable` (gotcha #1 — a font
  variable declared one level lower fails silently), with
  `--font-sorbet-hand: var(--font-caveat), ui-rounded, cursive` appended to `@theme`.
  This is an exception to "Rubik is the display face"; design-notes must record it.

**Large variant** (`size="lg"`) for the trip title, used by *both* trip routes: same
frame, `max-w-md`, caption is the trip title at
`text-[clamp(1.75rem,4vw,2.75rem)] text-balance`, no byline, no arrow. `TitleSection`
renders it unconditionally — no variant prop, no fork.

## The mobile nav menu

`SiteNav` is a client component (it needs `usePathname` anyway):

- Trigger: `rounded-full` ink-outline pill, `md:hidden`, `aria-label="Menu"`,
  `aria-expanded`, `aria-controls="site-menu"`, focus triad.
- Panel: `id="site-menu"`, canvas sheet under the sticky bar, stacked pill links at
  `text-lg`, the "Plan a trip" ink pill last. Framer Motion height/opacity — reduced
  motion is already handled centrally by `MotionProvider`.
- Behaviour: Escape closes and returns focus to the trigger; clicking a link closes; a
  `pathname` change closes; the trigger is not rendered above `md`.

## Testing approach

`vitest.config.mts` + `src/test/setup.ts`, jsdom, `@vitejs/plugin-react`,
`vite-tsconfig-paths` for `@/`. Explicit `import { describe, it, expect } from "vitest"`
rather than `globals: true`, so `tsconfig.json` needs no `types` entry.

Shared helpers in `src/test/`:

- `setup.ts` — `@testing-library/jest-dom/vitest`, plus `matchMedia` and
  `ResizeObserver` polyfills (react-aria, under HeroUI, needs both).
- `render.tsx` — `renderWithProviders`, wrapping `QueryClientProvider` (retries off) and
  `MotionProvider`.
- `imageStub.ts` — aliased for `*.jpg|png|webp|svg` imports. **Required**: Vite returns a
  bare string for an image import, but `src/lib/utils.ts` reads `sun.src` on ten weather
  PNGs, so without the stub (`{ src, width, height, blurDataURL }`) those helpers return
  `undefined`.
- `stubs/next.tsx` — `next/navigation` (`useRouter`, `usePathname`, `useParams`,
  `notFound`) and a passthrough `next/image`.
- `fixtures/` — a `Trip` fixture matching the Prisma model, an Anthropic `tripData`
  response, OpenWeather current + daily payloads, an Unsplash payload.

Boundaries are mocked at the module edge: `vi.mock("@/db")` for the Prisma singleton,
`vi.mock("@/db/actions")` for components, and `vi.mock` on `anthropicApi`,
`unsplashApi`, `openWeatherApi`. No network, no database, no keys.

Two limits to work with rather than fight: `whileInView` never fires in jsdom, so assert
that `Reveal`'s children render, never that an animation ran; and async server components
cannot be rendered by RTL, so `/about`'s server-side random pick is tested as a pure
helper with the page itself covered by Playwright.

E2E lives in `e2e/`, chromium only, `webServer` running `npm run start`. The one
production concession: the three `"use server"` modules check
`process.env.E2E_FIXTURES === "1"` and return a fixture instead of calling out — those
calls are server-side, so `page.route` cannot reach them. No visual snapshot baselines
initially; assertions are behavioural.

## Per-step contract

Every step is one branch off `main`, one PR:

1. `git checkout main && git pull && git checkout -b <branch>` in the repo root — not a
   worktree (see the working agreement in `CLAUDE.md`).
2. Read `docs/design-notes.md` "Migrating a page" (the 10-point checklist) and its
   Gotchas section before touching styling.
3. Do the work, and write the step's tests in the same PR.
4. Green: `npx next typegen && npx tsc --noEmit`, `npm test`, `npm run build`, and
   `npm run test:e2e` when the step touched a covered flow. `npm run lint` is broken and
   is not a signal.
5. Verify in the browser with the **Playwright MCP** tools: `browser_navigate`,
   `browser_resize` at 1440 / 768 / **390**, `browser_emulate_media` with
   `prefers-reduced-motion: reduce`, `browser_console_messages` for hydration errors,
   `browser_snapshot` for the a11y tree, `browser_take_screenshot` for the record.
6. Update the `docs/design-notes.md` Status row and tick the step here.
7. **Stage the work and stop.** No commit, no push, no PR — the diff is reviewed in the
   editor first, and permission to commit only counts once it arrives after the diff
   exists (see the working agreement in `CLAUDE.md`). Leave the branch checked out.

---

## Step 0 — Test harness and backfill · `test-harness`

No visual changes. This is the regression net the migration leans on.

**Setup**

- devDeps: `vitest`, `@vitejs/plugin-react`, `vite-tsconfig-paths`, `jsdom`,
  `@testing-library/react`, `@testing-library/user-event`, `@testing-library/jest-dom`,
  `@playwright/test`.
- `vitest.config.mts` (include `src/**/*.test.{ts,tsx}`, exclude `e2e/`), the
  `src/test/*` helpers above, `playwright.config.ts`, `scripts/seed-e2e.ts`.
- Scripts: `test` → `vitest run`, `test:watch` → `vitest`, `test:e2e` → `playwright test`.
- `.github/workflows/ci.yml`: a required `test` job (`npm ci`, `npm test`), and an `e2e`
  job with a `postgres` service container — `npx prisma db push`, seed, `npm run build`,
  `npx playwright install --with-deps chromium`, `npx playwright test` with
  `E2E_FIXTURES=1`.
- `CLAUDE.md`: replace the "no tests" note with the real commands.
- Enabling refactor: move `transformInputsToFinalData` out of
  `src/context/FormContext.tsx` into `src/lib/` and import it back. Pure function, no
  behaviour change, becomes directly testable.

**Backfill**

- `src/lib/schema.ts` — every required field, `startDate` not in the past, `endDate` not
  before `startDate`, `agreement` must be true, `interests` non-empty. `vi.setSystemTime`
  so the date refinements are deterministic.
- `src/lib/utils.ts` — `formatDate`, `durationInDays`, `displayDuration`,
  `findStartIndex`, `selectDailyForecasts`, and `placeWeatherIcons` across the day/night
  branch (fake timers) and each condition.
- `transformInputsToFinalData` — `{item: string}[]` flattens to `string[]`, optional
  fields survive.
- `src/context/FormContext.tsx` — `next()` blocks on invalid fields and advances on valid
  ones for each of the 7 steps, `prev()` floors at 0, the weather/image fetch triggers
  fire on the steps that own them.
- `src/context/TripContext.tsx`, `WeatherContext.tsx`, `ImageContext.tsx` — success and
  error paths with the API modules mocked.
- `src/hooks/useCreateTrip.tsx` — the merged DB payload (`formData` + `tripData` +
  `imageData`), `handleYesAnswer` → `saved: true`, `handleNoAnswer` → `saved: false`.
- `src/db/actions.ts` — `getAllTrips` search filtering, `createTripInDB` payload shape,
  `getSingleSavedTrip` miss, against a mocked `@/db`.
- `src/hooks/useSavedTrips.ts`, `useSingleSavedTrip.ts`, `useCountries.ts`,
  `useGeoNames.ts` — query wiring and the empty/error branches.

**E2E (first specs)** — `landing.spec.ts` (hero renders, the intro does not block
content, nav links work), `about-404.spec.ts`, and `saved-trips.spec.ts` against the
seeded DB (grid renders, search filters, a card opens its detail page). These are written
against the *current* UI and updated by the steps that restyle it — that is the point.

## Step 1 — Shared shell · `sorbet-shell`

- New `src/components/sorbet/` — move `Reveal.tsx`, `MotionProvider.tsx`, `TripCard.tsx`
  out of `landing/` (design-notes already marks these three general-purpose); update
  landing imports; move the `ItineraryCard` type into `TripCard.tsx` and have
  `landing/content.ts` import it from there.
- New `src/components/ui/SiteNav.tsx` — `LandingNav` generalised: same pill links and
  canvas/blur bar, `usePathname` active state (`bg-sorbet-ink/5`), plus the mobile menu
  above. **Keep `data-wordmark`** — `Intro` measures it to fly the wordmark into place.
- New `src/components/ui/SiteFooter.tsx` — `LandingFooter`, visually unchanged.
- `src/app/layout.tsx` — render `SiteNav` for every route; load Caveat; add
  `--font-caveat` to the `<html>` className.
- `src/app/page.tsx` — use the shared nav/footer; keep `MotionProvider` + `IntroProvider`.
- `src/app/providers.tsx` — wrap in `MotionProvider` so every route gets
  `MotionConfig reducedMotion="user"`.
- Delete `src/components/ui/NavbarComponent.tsx` and with it the `pathname === "/"` guard
  (gotcha #7 disappears rather than being extended).
- Restyle: `Loader` and `LoaderResponseAI` (canvas ground, ink spinner, section-h2 scale,
  keep `useConfirmOnPageExit`); `NotFoundComponent` (HeroUI `Button` → ink pill,
  `min-h-dvh grid place-items-center` instead of `fixed … overflow-hidden`);
  `ButtonBackOutlined` (plain ink disc, add the missing `aria-label="Go back"`);
  `CustomToaster` / `ErrorToaster` (white `rounded-2xl` card, ink text, red glyph kept).
- `globals.css` — append `--color-sorbet-white` and `--font-sorbet-hand`.

**Tests** — `SiteNav`: active route marked, mobile trigger toggles `aria-expanded`,
Escape closes and restores focus, link click closes, panel absent above `md`.
`NotFoundComponent`: message and link by role and accessible name. `LoaderResponseAI`:
messages rotate under fake timers. `ButtonBackOutlined`: accessible name, calls
`router.back`. E2E: mobile menu navigation at 390px.

**Gotchas** — the font variable must sit on `<html>`; if new tokens look inert it is
Turbopack's stale CSS cache (`rm -rf .next`); unmigrated routes wear a sorbet nav over
old-palette bodies until step 5, which is intended.

## Step 2 — `/about` · `sorbet-about`

- Rewrite `AboutComponent`: drop `Container`/`GridContainer`/`GradientBg` and the
  `isMounted` + `Loader` flash; pick the random image **server-side** so there is no
  mount gate and no hydration branch.
- Sections, alternating grounds: canvas intro (page-h1 clamp, two-tone heading, lead at
  `/75`) → white photo section (`rounded-[2rem]` frame, `Reveal`) → lime closing CTA with
  an ink pill to `/form`.
- Keep the José Copeti credit, with the focus triad on the link.
- **Never caption the image from `homepageImages[i].city`** (gotcha #8) — neutral alt.

**Tests** — the image-pick helper returns an in-range index and a defined placeholder;
heading, lead and credit link render; the rendered `alt` is the neutral string, never a
`city` value. E2E: `/about` at 390px has no horizontal scroll, CTA reaches `/form`.

## Step 3 — `/saved-trips` · `sorbet-saved-trips` · the polaroid

- Build `src/components/sorbet/Polaroid.tsx` to the spec above, plus the Caveat load and
  the two token additions if step 1 didn't land them.
- `SavedTripCard.tsx` → renders `Polaroid` (`trip.image`, `trip.placeholder` blur,
  `{city}, {country}`, `by {userName}`, href `/saved-trips/{id}`). Delete the
  `h-[40vh] w-[40vh] … rounded-sm bg-gallery-100` geometry.
- **Delete `opacity-0` from the card class.** It exists only because the GSAP batch set
  it; leave it in and every card renders invisible.
- `SavedTripsDisplay.tsx` — sorbet section shell (`px-5 py-20 sm:px-8 md:py-28`,
  `mx-auto max-w-6xl`), two-tone h2, HeroUI `TextField`/`Input` kept but restyled as a
  pill on white with the focus triad, empty state as `ink/70` copy in a white card, grid
  `sm:grid-cols-2 lg:grid-cols-3`, `Reveal delay={0.06 * i}`.
- `src/app/saved-trips/page.tsx` — drop `Container`, `GradientBg`,
  `SavedTripsContainer`; keep the `HydrationBoundary`.
- Remove `useScrollingSavedTrips` and delete `src/hooks/useScrollingSavedTrips.ts`;
  delete `useWindowSize` if nothing else uses it. GSAP and Locomotive stay in
  `package.json` until step 6 — the trip pages still need them.
- Grounds: canvas header → white grid → ink footer.

**Tests** — `Polaroid`: caption and byline text, `href`, arrow is `aria-hidden`, tilt
class is the `sm:`-prefixed form and never bare, focus triad present, index 4 wraps to
the first fan angle. `SavedTripCard`: **no `opacity-0`** (the regression that would blank
the grid). `SavedTripsDisplay`: one card per trip, empty state on `[]`, typing in search
updates the query term, error state renders. E2E: grid renders seeded trips, search
narrows, a polaroid opens its detail page, 390px has no horizontal scroll.

## Step 4 — `/form` · `sorbet-form`

- `src/app/form/page.tsx` — drop `Container`/`GradientBg`; canvas page with one
  `max-w-3xl` white `rounded-3xl` surface (a narrower inner measure inside the
  `max-w-6xl` rule is fine). `FormContainer` becomes that surface or goes away.
- **Scope the HeroUI override, don't edit `:root`.** `--accent` is globally neptune and
  unmigrated pages still depend on it: add
  `[data-sorbet] { --accent: …; --accent-foreground: …; }` and put `data-sorbet` on the
  form wrapper. Step 6 flips it globally.
- `Progress.tsx` — HeroUI `ProgressBar` restyled (ink fill on `ink/15` track) plus an
  eyebrow-styled "Step _n_ of 7".
- `FormButtons.tsx` — plain ink and lime pills, focus triad; RHF `next`/`prev` wiring
  untouched.
- `FormStep1–7`, `CustomCheckbox`, `DatePicker`, `ReviewForm` — grounds and type scale
  only: labels in the meta-label idiom, help text `ink/70`, selectable checkbox/radio
  cards as pastel tints (`lavender`, `blush`, `lime-punch`), `rounded-full` on anything
  pill-shaped, `DatePicker`'s `Popover` as a white `rounded-3xl` card.
- Add `--color-sorbet-alert: #c2150c` (the red already in use) as an additive token for
  `FieldError` instead of hard-coded hex.

**Tests** — step 0's `FormContext` navigation tests must still pass unchanged; that is
the contract. Plus: each step's invalid submit shows the Zod message and does not
advance; `DatePicker` opens on click and selects a date (`user-event`); the review step
lists the entered values; buttons expose the right accessible names. E2E: walk all seven
steps at 1440 and 390, assert validation blocks a premature "next".

## Step 5 — Trip pages · `sorbet-trip-pages`

`/trips/[tripUrl]` and `/saved-trips/[id]` share all ten section components, so they
migrate together — and both get the polaroid title.

- Remove `useScrollTrigger(...)` from `TripResponse.tsx` and
  `SavedTripsPageComponent.tsx`; delete `src/hooks/useScrollTrigger.ts` and
  `src/hooks/useLocomotiveScroll.ts`; delete the class hooks they targeted
  (`.trip-description`, `.plane`, `.title-tours`, `.tour-item`, `.objects-list`,
  `.pack-ready`, `.stamps`, `.weather-card`, `.forecast-card`, `.final-card`, and the
  `*-section` wrappers).
- Replace every `Container` + `GradientBg` + `GridContainer` panel with
  `<section className="bg-… px-5 py-20 sm:px-8 md:py-28"><div className="mx-auto max-w-6xl">`
  plus asymmetric splits (`lg:grid-cols-[1.6fr_1fr]`, `md:grid-cols-[1.15fr_1fr]`) where
  copy pairs with an image. Nothing keeps `h-[calc(100dvh-3.5rem)]`.
- Grounds, top to bottom, never repeating: Title `canvas` → Description `white` → Tours
  `offwhite` → PackReady `white` → Objects `canvas` → MustHave `white` → Weather
  `offwhite` → Forecast `white` → FormDetails `canvas` → Save/Final `lime` → ink footer.
- `TitleSection.tsx` — large `Polaroid` with the trip title as the handwritten caption,
  on both routes; drop `useLocomotiveScroll`.
- Tours / Objects / MustHave lists → `TripCard` on pastel tints; packing list on
  `lavender` per design-notes; `<ol>`/`<ul>`, `<dl>` and `<article>` semantics kept.
- `WeatherSection.tsx` is the origin of the icon-breakout pattern — keep the
  negative-margin overflow, align values with `WeatherPacking`, keep weather icons
  `alt="" aria-hidden` with the condition in adjacent text.
- `ForecastSectionCard.tsx` — drop the `21vh` squares for `grid-cols-2 lg:grid-cols-5`
  white cards.
- `SaveSection` / `FinalSection` — HeroUI `Button`/`ButtonGroup` → ink and lime pills;
  `useCreateTrip`'s `handleYesAnswer` / `handleNoAnswer` wiring unchanged.
- `Reveal` for entrances; `useConfirmOnPageExit`, `notFound()` and the `trip === null` /
  `undefined` branches in `TripResponse` stay exactly as they are.

**Tests** — each section renders its fields from the `tripData`/`Trip` fixture (ten small
component tests); `TitleSection` renders the large polaroid with the title as caption on
both routes; `TripResponse` shows the loader while pending, the error component on
`null`, and calls `notFound()` on `undefined`; `SaveSection` yes/no calls through to the
mocked `createTripInDB` with the right `saved` flag. E2E happy path with
`E2E_FIXTURES=1`: form → generated trip → polaroid title → save → the trip appears in
`/saved-trips`; and discard → it does not.

## Step 6 — Cleanup and docs · `sorbet-cleanup`

Every deletion gated on a grep showing zero uses.

- Delete `src/components/home/` (4 unreferenced components) and
  `src/components/ui/SwiperComponent.tsx` (also unreferenced); then `Container.tsx`,
  `GridContainer.tsx`, `GradientBg.tsx`, `Gradient1.tsx`, `GradientConic.tsx`,
  `SavedTripsContainer.tsx` and their types in `src/types/index.ts`.
- Remove now-unused deps: `gsap`, `@gsap/react`, `locomotive-scroll`, `swiper`, `daisyui`
  (never loaded), `react-spinners` if the loaders no longer use it.
- Flip the HeroUI `:root` semantic overrides to sorbet and delete the `[data-sorbet]`
  scope from step 4.
- **Only now** delete the old palettes from `@theme` (`neptune`, `tuna`, `shark`,
  `gallery`, `yellorange`, `deeporange`, `cabaret`, `violay`) — the first moment touching
  them is safe.
- `next.config.mjs` — drop the unused DALL-E host.
- Fix `src/data/index.ts`'s fabricated `city` labels and the duplicated `alt: "tenth"`
  and shared placeholder on entries 10–16.
- `docs/design-notes.md` — Status all Migrated, drop the "two systems coexist" framing,
  record the polaroid, `font-sorbet-hand` and the mobile menu as part of the system,
  clear the resolved Known-debt items.
- This file — reset `Now`/`Next`.

**Tests** — repo-hygiene specs: a source scan asserting no `gsap` / `locomotive-scroll` /
`swiper` import and no old-palette class prefix remains in `src/`; `package.json` no
longer lists the removed deps. Full `npm test` and `npm run test:e2e` green.

---

## Assumptions

Called out because they were judgement calls, not requirements:

- `ReviewForm` and `FormDetailsSection` keep their current information design —
  restyled, not restructured.
- `E2E_FIXTURES` is the only production-code concession to testing. The alternative
  (live API keys in CI) is worse.
- No visual regression baselines in the committed Playwright suite yet; assertions are
  behavioural, screenshots are for the record.

---

## Parked

Known work, not scheduled. Detail in `docs/design-notes.md` under "Known debt".

- Move ESLint to flat config so `lint` can rejoin CI
