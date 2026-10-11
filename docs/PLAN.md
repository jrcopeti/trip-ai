# PLAN

Working plan for whatever is currently in progress. Tracked, so it is visible in the
Explorer and in diffs, and it travels with the repo.

Keep it current: read it at the start of a task, update it as the shape of the work
changes, and clear finished items out rather than letting them pile up. Churn here is
expected and fine — it is a plan, not a record. If a decision turns out to be durable it
belongs in `docs/design-notes.md` (visual system) or `CLAUDE.md` (rules), not here.

---

## Now

**Step 4 — `/form`.** See the step list below.

## Done

- **Step 3 — `/saved-trips` and the polaroid.** ✅ On `sorbet-saved-trips`. `Polaroid`
  (both sizes) in `sorbet/`, the grid in `saved-trips/`, GSAP and Locomotive gone from
  the route. 47 new unit tests (291 total); `saved-trips.spec.ts` updated plus two new
  e2e (no tilt at 390px, the trip count).

- **Step 2 — `/about`.** ✅ On `sorbet-about`. Server component with a server-side
  photo pick, canvas → white → lime → ink. 12 new unit tests (244 total), 2 new e2e
  (`about-404.spec.ts`).

- **Step 1 — the shared shell.** ✅ Landed on `sorbet-shell`. `SiteNav` on every route
  with a mobile disclosure menu, `SiteFooter`, `MotionProvider` app-wide, the three
  general-purpose components moved to `src/components/sorbet/`, and the loaders, 404,
  toasters and back button restyled. 22 new unit tests (232 total), 8 new e2e
  (`site-nav.spec.ts`).

- **Step 0 — test harness and backfill.** ✅ Landed on `test-harness`. 210 unit tests
  across 13 files; 24 e2e tests across 3 specs, of which 15 (`landing`, `about-404`)
  ran locally against a production build and 9 (`saved-trips`) run in CI, where the
  seeded throwaway database lives.

  These e2e specs are page-level checks, not journeys — render, navigate, filter,
  no overflow at 390px, reduced motion does not blank the page. The multi-step
  journeys come with the steps that restyle those routes: the seven-step form walk
  in step 4, and form → trip → save/discard in step 5.

## Next

Steps 5–6 in order.

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
2. Read `docs/design-notes.md` "Migrating a page" (the 12-point checklist) and its
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

## Step 0 — Test harness and backfill · `test-harness` ✅

No visual changes. This is the regression net the migration leans on.

**Landed.** What the plan did not anticipate, recorded because the next steps inherit it:

- `@types/node` moved from `^20` to `^24` — Vitest 5 requires it, and both CI and the
  local machine already run Node 24.
- `vite-tsconfig-paths` is not needed: Vite 8 resolves `@/` from `tsconfig.json`
  natively via `resolve.tsconfigPaths`.
- The image stub is **keyed by filename**, not shared. A single stub makes all ten
  weather PNGs identical and every branch of `placeWeatherIcons` indistinguishable.
- Without `globals: true`, RTL's auto-cleanup never registers; `src/test/setup.ts` calls
  `cleanup()` itself. Removing it makes every render accumulate in one document.
- **Local time, not UTC.** `findStartIndex`, `placeWeatherIcons` and the schema's date
  refinements all compare against local time. Fixtures and `vi.setSystemTime` are
  anchored to local `Date`s (`FIXTURE_NOW`), verified across four timezones — a
  UTC-anchored fixture passes here and fails in CI.
- `tsx` was added so CI can run the seed script.
- `scripts/seed-e2e.ts` **refuses any host but localhost** unless
  `ALLOW_REMOTE_E2E_SEED=1`. It opens with `deleteMany()`, and `.env` points at the
  production Neon database.
- `handleNoAnswer` omits `placeholder` where `handleYesAnswer` sets it. **Correct as
  written, not a bug:** a discarded trip is written to the DB but never read back —
  `getAllTrips` and `getSingleSavedTrip` both filter `saved: true` — so no blur
  placeholder is ever rendered for it. Pinned by a test so step 5 does not "fix" it.

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
content, nav links work, no console errors, no horizontal scroll at 390px, reduced
motion does not blank the page), `about-404.spec.ts`, and `saved-trips.spec.ts` against
the seeded DB (grid renders, search filters by city and by traveller, the empty state
appears, a card opens its detail page, no card is left at `opacity: 0`). These are
written against the *current* UI and updated by the steps that restyle it — that is the
point.

The `saved-trips` spec needs the seeded throwaway database, so it runs in CI rather than
locally against `.env`. The other two were verified locally against a production build.

## Step 1 — Shared shell · `sorbet-shell` ✅

**Landed.** What the plan did not anticipate, recorded because the later steps inherit it:

- **The canvas ground moved to `<body>`.** The nav is `bg-sorbet-canvas/90`, and once it
  sits above the page wrapper rather than inside it, those 10% show white through. An
  unmigrated route paints its own opaque full-viewport gradient over this, so nothing
  there changed.
- **The nav is `h-16`, the old one was `h-14`.** Every `calc(100dvh-3.5rem)` became
  `calc(100dvh-4rem)` (`Container`'s default plus three call sites). Those pages are all
  rewritten in steps 2, 4 and 5, but until then they would have bought a scrollbar.
- **`MotionProvider` is in `providers.tsx` only** — the plan said to keep the landing's
  too, but a second identical `MotionConfig` is noise that invites someone to "fix" one
  of the two. One place handles reduced motion; that is the rule in design-notes.
- **`--color-sorbet-alert: #c2150c` landed here, not in step 4.** `NotFoundComponent` and
  `ErrorToaster` both needed the red, and a hard-coded hex in the shared shell is worse
  than pulling one additive token forward. Step 4's `FieldError` can just use it.
- **Below `md` the bar is wordmark + trigger only** — the "Plan a trip" pill is in the
  panel, as specced. The landing does not lose its mobile CTA: `Hero` has its own.
- **`LandingNav` and `LandingFooter` are gone**, not kept alongside. `SiteNav` is the
  rewrite, `SiteFooter` is `git mv`'d; leaving the originals would have left two navs
  one of which nothing rendered.
- **Fake timers and Framer Motion fight each other.** `requestAnimationFrame` is not in
  Vitest's default `toFake`, and Framer's frame loop is a module-level singleton that
  will not restart under a fresh fake clock while a frame is still pending — so the
  *second* test in a file is the one that fails. Written up in CLAUDE.md; step 5 will
  need it.
- E2E locators must be scoped to `header nav`: the footer carries links with the same
  names, so an unscoped `getByRole("link", { name: "Saved trips" })` matches two.

The original plan for this step follows.


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

## Step 2 — `/about` · `sorbet-about` ✅

**Landed.** What the plan did not anticipate, recorded because the later steps inherit it:

- **The page calls `await connection()`** (from `next/server`). Without it Next
  prerenders `/about` at build time, `Math.random()` runs once, and every visitor sees
  the same "random" photo. It is now `ƒ` in the build output.
- **`src/app/about/loading.tsx` is deleted.** The page awaits nothing, and a route-level
  `loading` would just bring back the `Loader` flash the rewrite removes.
- **`src/test/setup.ts` gains an inert `IntersectionObserver`.** This is the first unit test
  to render a `Reveal`, and Framer's `whileInView` constructs one on mount. It never
  reports an intersection, which matches the "assert children, not animation" rule.
- **The photo array was fixed here, not in step 6**, and renamed `homepageImages` →
  `travelPhotos` (the homepage no longer uses it), with its folder moved from
  `src/assets/homepage/` to `src/assets/travel-photos/` — not into the existing
  `assets/travel/`, which holds the trip pages' illustrations. Rather than work around its
  fabricated `city` labels with a neutral alt, it was rewritten: `city` and
  `title` are gone, every photo has a real `alt`, a `tripType` from the form's values
  and a freshly generated blur (only 3 of the 16 old blurs matched their file). It is
  typed as `TravelPhoto`; `types` became `as const` so `tripType` is checked, and
  `sortedTypes` now sorts a copy instead of mutating `types`. The dead
  `SwiperWithThumbs` lost its `title` caption to keep compiling. `generatePlaceholder.mjs`
  had the same fake labels and only 10 of the 16 files; it now reads the whole folder.
- The helper is `pickAboutImage(random?)` in `src/components/about/`; it returns the
  `TravelPhoto` and the page renders its `alt`.
- **Page copy moved to `about/content.ts`**, following `landing/content.ts`, and that is
  now a rule for every remaining step (design-notes, "Copy lives in `content.ts`"). For
  step 3 it means the `/saved-trips` heading, search label and empty state; step 4 the
  form's step titles, labels and help text (the option lists stay in `src/data`); step 5
  the section headings and the save/discard copy around the AI's `tripData`.
- `priority` was dropped from the photo after `/code-review`: it sits in a `Reveal` and
  below the fold, so the preload competed with what was on screen. Also now a checklist
  item.
- `AboutComponent` is a plain (non-async) server component that takes the image as a
  prop, so RTL renders it directly; only the async `page.tsx` is e2e-only.

The original plan for this step follows.


- Rewrite `AboutComponent`: drop `Container`/`GridContainer`/`GradientBg` and the
  `isMounted` + `Loader` flash; pick the random image **server-side** so there is no
  mount gate and no hydration branch.
- Sections, alternating grounds: canvas intro (page-h1 clamp, two-tone heading, lead at
  `/75`) → white photo section (`rounded-[2rem]` frame, `Reveal`) → lime closing CTA with
  an ink pill to `/form`.
- Keep the José Copeti credit, with the focus triad on the link.
- **Never caption the image from `homepageImages[i].city`** (gotcha #8) — neutral alt.
  _(Superseded: the data was fixed instead — see "Landed" above.)_

**Tests** — the image-pick helper returns an in-range index and a defined placeholder;
heading, lead and credit link render; the rendered `alt` is the neutral string, never a
`city` value. E2E: `/about` at 390px has no horizontal scroll, CTA reaches `/form`.

## Step 3 — `/saved-trips` · `sorbet-saved-trips` · the polaroid ✅

**Landed.** What the plan did not anticipate, recorded because the later steps inherit it:

- **The grid sits on `offwhite`, not white.** On a white ground the white frame vanishes
  and only the shadow marks where a card ends. Grounds are canvas header → offwhite
  grid → ink footer, and the empty state is the white card the plan asked for (on white
  it would have been invisible too).
- **The page keeps an h1.** The plan said "two-tone h2", but the old page's h1 was its only
  heading; it is now the page-h1 two-tone (`header` in `saved-trips/content.ts`), and the
  polaroid captions are h2s inside the list.
- **`Polaroid` takes `size="lg"` already**, to the spec, with its caption as the h1, not a
  link and not tilted. Step 5's `TitleSection` only has to render it. The caller wraps
  either size in `Reveal`; the component itself has no motion and stays a server
  component.
- **The tilt is on the `<Link>`**, so the focus outline turns with the card. Hover is
  `sm:hover:rotate-0`, not `hover:rotate-0`, so it outranks the `sm:` tilt at every width.
- **The stagger is `0.06 * (i % 3)`**, along the row. Rows enter the viewport one at a
  time, so `0.06 * i` held the twentieth card back more than a second after it scrolled in.
  There are 74 saved trips in production.
- **The search is `type="search"`**, so it is a `searchbox` by role. The e2e locators
  moved from `textbox` to `searchbox` by label. Chrome draws its native clear button in
  blue; left as it is.
- **The search is debounced and keeps the last result.** `useSavedTrips` queries on a
  `useDebouncedValue(searchTerm, 300)` (new, `src/hooks/`) with
  `placeholderData: keepPreviousData`. The old page fired a query per keystroke and
  dropped the grid to the spinner each time; now the spinner is first-load only, and
  while a search is in flight the stale grid is `aria-busy` at `opacity-60`.
- **Typing reveals the results.** At laptop height (1280×720) the header filled the
  screen, so a search changed a grid nobody could see. Typing now scrolls the search up
  under the nav (`scroll-mt-24`, smooth unless reduced motion) once, when it sits below
  96px; the grid's top padding is down to `pt-16` so the first row peeks on load; and a
  new `SquiggleArrow` in `sorbet/` hangs from the search into the grid, pointing down.
  `src/test/setup.ts` gains an inert `scrollIntoView` — jsdom has none.
- **Paged, 18 at a time, behind "Show more trips".** `getAllTrips` became
  `getSavedTripsPage(searchTerm, page)` → `{ trips, total }`, with the page size fixed
  server-side (`SAVED_TRIPS_PAGE_SIZE` in `src/lib/constants.ts`; a `"use server"` module
  can only export async functions) and `id` as an order tiebreak — four trips share
  Paris, and `city` alone let `skip` repeat or drop one. `useSavedTrips` is a
  `useInfiniteQuery`; a new search restarts at page 0. Under the grid: an ink pill and a
  live "18 of 74 trips" count. Ordering puts accented cities after plain ones ("málaga"
  after "munich") — the database collation, unchanged from before.
- **A sticker fills the header's right side.** An orchid `StickerBadge` ("trips worth
  keeping", camera) sits bottom-right from `md`, dropped to straddle the header and the
  grid opposite the squiggle. `StickerBadge` moved from `landing/` to `sorbet/` to allow
  it, with the three landing imports updated.
- **Two HeroUI overrides** — the unlayered global `.label` colour and `outline-none`
  breaking the focus triad. Both are design-notes gotcha #9; step 4 hits them on every
  field.
- `SavedTripsDisplay` moved to `src/components/saved-trips/` with a `content.ts`.
  **`SavedTripCard` is gone**: it only mapped a `Trip` to `Polaroid`'s props, so the
  display renders `Polaroid` directly and its tests moved into
  `SavedTripsDisplay.test.tsx`. `SavedTripsContainer`, `useScrollingSavedTrips` and
  `useWindowSize` (nothing else used it) are deleted, with `SavedTripsContainerProps`.
- The `saved-trips` e2e spec could not run locally (no Postgres, Docker not running); it
  runs in CI as before. The Playwright MCP pass was against a production build reading
  the real trips.

The original plan for this step follows.


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
