# PLAN — the landing refresh

## Context

The sorbet migration is done, but the landing page still carries placeholders from
before the app existed in its current form: a sample card deck, a meta list
("Model / Weather / Photos / Steps in the form") that says nothing a visitor cares
about, a fixed balloon photo with a fake chip, copy that overpromises ("a day you
could actually walk"), and a logo tile that just says "ai". This pass makes the
landing show the real product: real saved trips, real features, the real tour shape
(title, kind, description), and a real logo built from `src/assets/logo.png`.
Then the README, screenshots and a demo video catch up.

Work follows CLAUDE.md's per-branch checklist: one branch per PR, failing test first
for behaviour, `tsc` / `npm test` / build / e2e, Playwright MCP pass at 1440/768/390 +
reduced motion, stage and stop. This file is the plan.

Decided with the user:
- Logo: ink glyph on the orchid tile, colour from tokens.
- Section 6 heading: "What comes back: tours for the city, the weather for your
  dates, and what to pack." ("weather", not "forecast": only the "plan around the
  weather" option fetches a forecast; chosen dates get the usual weather.)
- Section 7 heading: "Three steps. That's the app."
- Demo video: recorded walkthrough with a **real** API call.

## Now

- **Branch 1** · `landing-copy` — merged (#178).
- **Branch 2** · `landing-polaroids` — merged (#179).
- **Branch 3** · `sorbet-logo` — staged for review.

## Branch 1 — `landing-copy` (items 2, 4, 5, 6, 7)

Copy and static content; no data dependencies beyond the photo pick.

- **2. Hero eyebrow** (`landing/Hero.tsx`): drop the white pill with the indigo dot;
  keep "Your new travel friend" as the system's meta-label eyebrow
  (`text-sm font-medium uppercase tracking-[0.18em] text-sorbet-ink/50`, as
  `WordmarkBlock` uses). `WordmarkBlock`'s own eyebrow says the same words, so it
  becomes "What it does" to introduce the features below it. `sorbet-indigo` then has
  no use — note it in design-notes' palette table (keep the token).
- **4. Features instead of meta** (`landing/WordmarkBlock.tsx` → `content.ts`):
  replace the Model/Weather/Photos/Steps `dl` with four product features, same `dl`
  layout, `dt` the feature, `dd` one line:
  - Checks the weather — the 5-day forecast if you're leaving now, the usual weather
    if you're not, and a packing list that follows it.
  - Uses real photos — pictures of your destination from Unsplash, not stock art.
  - Five tours, by kind — each with a title and what kind of tour it is.
  - Keeps what you save — saved trips stay, with the weather they were planned for.
- **5. Random band photo** (`landing/PhotoBand.tsx`): pick from `travelPhotos` per
  request, like `/about`. Move `components/about/pickAboutImage.ts` (and its test) to
  a shared `src/lib/pickTravelPhoto.ts`; `/about` and the landing both use it.
  `src/app/page.tsx` becomes `async`, calls `await connection()` (as
  `src/app/about/page.tsx` does) and passes the photo down. Remove the overlaid
  chip; `photos.band` leaves `content.ts`.
- **6. Five mini tour cards** (`PhotoBand.tsx`): heading becomes the decided
  wording (two-tone, as now). The four `itineraryCards` become five sample tours in
  `content.ts` (`{ title, kind, description }`, one city, kinds from `TOUR_KINDS`),
  rendered with the existing `TripCard` (`chip` = kind, `Icon` = `kindIcon(kind)`,
  `body` = description, `interactive={false}`, tints from `CARD_TINTS`). Grid
  `sm:grid-cols-2 lg:grid-cols-5`, short descriptions so five fit the measure.
  - design-notes says page directories don't import from each other, so
    `trips/kinds.ts` (`kindIcon`) and `trips/tints.ts` (`CARD_TINTS`) move to
    `src/components/sorbet/` with their tests; `trips/` imports update.
- **7. Steps heading** (`landing/HowItWorks.tsx`): "Three steps. That's the app."
  Step 02's body mentions five tours to match.
- All landing copy touched here moves into `landing/content.ts` (design-notes: copy
  lives in `content.ts`).

Tests: `pickTravelPhoto` (moved), a `WordmarkBlock` test (four features, no
"Model"), a `PhotoBand` test (five cards, each with its kind chip and icon; the photo
it is given), a `Hero` test (eyebrow is not a pill — no chip markup). `landing.spec`
gains: five tour cards render; no horizontal scroll at 390 still holds.

## Branch 2 — `landing-polaroids` (item 3)

- `src/db/actions.ts`: `getLatestSavedTrips()` — `saved: true`, `orderBy createdAt
  desc, id desc`, `take: 3`, count fixed server-side like `getSavedTripsPage`.
- `src/app/page.tsx` (already dynamic from branch 1) fetches them and passes them to
  `Hero`; a DB error is caught and treated as no trips, so the landing never fails on
  the database.
- `Hero.tsx`: the `heroDeck` of `TripCard`s becomes `Polaroid` cards — same props as
  `SavedTripsDisplay` (`href /saved-trips/{id}`, `image ?? image1`,
  `placeholder ?? defaultPlaceholder`, caption `{city}, {country}`, `username`,
  `index`). Keep the deck's overlap layout and intro-gated entrance; drop the deck's
  own `fan` rotations, since `Polaroid` already tilts by `index` (and never below
  `sm`). Fewer than three saved trips: show what there is; none: no deck.
  `heroDeck` and the old `itineraryCards` sample data are gone after branches 1–2.
- As built: the action `select`s only the polaroid's fields (`LatestTrip`), so the
  client component is not handed whole rows. The catch lives in
  `landing/loadLatestTrips.ts`, which logs the error and returns `[]` — a pure
  helper, since RTL cannot render the async page. It also gives up after 1.5s
  (`LATEST_TRIPS_TIMEOUT_MS`): the page awaits the deck before sending anything,
  and Prisma's own limits (5s connect, 10s pool) would hold the landing blank.
  A `<Suspense>` deck with a loader was considered and passed over — more
  restructuring for a decorative deck. The cost: a Neon wake-up slower than 1.5s
  means that one visitor gets no deck. Below `md` the deck still
  overlaps, but each card sits *under* the one before (`z-30/20/10`): stacked the
  other way, the overlap hid the caption on the card above. The deck is a `<ul>`
  named "Latest saved trips".
- Tests: action (mocked `@/db`: ordering, `take`, `saved`), `Hero` (three polaroids
  linking to their trips; none when empty), the loader (passes trips through; a
  database error becomes `[]` and is logged). `landing.spec`: the seed has two saved
  trips → two polaroids, the first opens `/saved-trips/{id}`; the discarded one
  never appears.

## Branch 3 — `sorbet-logo` (item 1)

- `src/components/sorbet/Logo.tsx`: the orchid rounded tile (sizes for nav and
  lockup) with the glyph drawn as `bg-sorbet-ink` masked by `logo.png`
  (`mask-image` from the static import's `.src`, `mask-size: contain`). Decorative
  (`aria-hidden`); the wordmark text stays the accessible name.
- Replace the "ai" tile in `ui/SiteNav.tsx` and the "trip ai" tile in
  `landing/WordmarkBlock.tsx`. `[data-wordmark]` and the intro flight are untouched.
- Favicon: a one-off script (`scripts/`, using `sharp`, already installed with Next)
  renders the same tile + ink glyph to `src/app/icon.png` and
  `src/app/apple-icon.png`; delete the old `favicon.ico`.
- design-notes: record `Logo` in the component inventory, and that orchid is the
  logo tile's colour.
- Tests: `Logo` renders the tile and the mask; nav still has the wordmark
  (`landing.spec`'s existing checks cover the intro hook).
- As built: the mask is Tailwind's (`mask-(--logo-mask) mask-contain mask-center
  mask-no-repeat`) with the URL in a `--logo-mask` custom property — jsdom drops
  `mask-*` set as inline style, so the test could not see it, and the utilities read
  like the rest of the code. The script is `scripts/render-icons.mjs`; it reads lime
  and ink from `globals.css`. The tile was planned orchid and changed to lime in
  review; the nav tile grew to 32px (`size-8`) at the same time. `icon.png` is 512px with the lockup's corner ratio
  (a quarter); `apple-icon.png` is a full 180px square, since iOS rounds it and
  blackens transparent corners. Glyph inset a sixth each side, as the lockup's `p-4`.
  Nav and lockup tests assert the glyph is present and adds no text: the home link's
  name is still "trip ai", and the lockup no longer repeats it.

## Branch 4 — `readme-demo` (item 8, last, once the look is final)

- README rewrite: drop the "work in progress" banner, the old palettes paragraph,
  Swiper/GSAP from the stack, the "Previous design" section; describe the finished
  app (form → trip with titled, kinded tours → saved polaroids), the sorbet system in
  brief (pointing at `docs/design-notes.md`), CI as it is now (typecheck, build,
  test, e2e), how to run e2e locally.
- Screenshots: Playwright MCP at 1440 and 390 of landing, form, trip page, saved
  trips → `public/screenshots/` (replace `redesign/`; delete the old `desktop/` and
  `mobile/` sets).
- Demo video with a real API call: `npm run build && npm run start` with
  `.env.local`'s real keys but `DATABASE_URL` pointed at the local throwaway
  Postgres (so the save doesn't write to production), no `E2E_FIXTURES`. A small
  Playwright script with `video: on` records landing → form (seven steps) → the
  generated trip → save → saved trips. One real Anthropic call (plus Unsplash and
  OpenWeather). Output to `public/demo/`. For an inline README preview, a short GIF
  needs ffmpeg — ask before `brew install ffmpeg`; without it, commit the `.webm` and
  link it.

## Later — when the intro stops repeating

Not part of this plan's branches; recorded so it is not lost.

- **Planned:** remember a visitor's first view so the intro plays once.
- **Then move the hero deck to `<Suspense>`.** The 1.5s timeout (branch 2) holds the
  whole landing blank while the query runs, because the page awaits it before
  sending any HTML — the intro never hid that wait, since it starts only once the
  HTML arrives. Without the intro, the better shape is: the deck as its own
  server component fetching `getLatestSavedTrips`, passed into `Hero` inside
  `<Suspense>` with a `SquiggleLoader` fallback in a box of the deck's height. The
  page then renders at once and the loader shows only when the database is slow.
  Keep the 1.5s limit inside it, so a down database cannot spin the loader for
  Prisma's 5–10s.
- **Use a cookie for "intro seen", not localStorage.** The server cannot read
  localStorage, so it would render the intro overlay and the client would remove
  it after hydration — a flash on every repeat visit. A cookie lets the server
  skip the overlay.

## Verification (each branch)

- `npx next typegen && npx tsc --noEmit`, `npm test`, `npm run build`.
- `npm run seed:e2e` + `npm run test:e2e` with `DATABASE_URL` on the local
  `trip-ai-e2e-pg` container; check port 3100 is free first, and stop any server
  started for the browser pass by port.
- Playwright MCP: landing at 1440/768/390, reduced motion, console errors, a11y
  snapshot; branch 2 also clicks a polaroid through to its saved trip; branch 3
  checks the nav tile, the lockup and the favicon in the tab.
- Stage, report, wait for review before any commit.
