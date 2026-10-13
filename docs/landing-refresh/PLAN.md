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
- **Branch 3** · `sorbet-logo` — merged (#180).
- **Branch 4** · `readme-demo` — merged (#181).
- **Branch 5** · `intro-once` — staged for review: the intro once a day, and the hero deck in `<Suspense>`.

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
- Favicon changed in review. A lime tile with the ink glyph was unreadable at
  16px; a vector redraw (suitcase centred, no wave or passport) was tried and
  rejected, and so were a white glyph with no tile and a white glyph on the
  lime tile, and a lime glyph with no tile. The favicons are now `logo.png` in
  its original colours (the teal gradient), no tile, transparent ground:
  `icon.png` 512px, `apple-icon.png` 180px. The page's `Logo` keeps the ink
  glyph on lime.

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
- As built: a demo was recorded (a Playwright script, one real generation) and
  then dropped in review — the user will record one by hand later. GitHub plays a
  README video only from an uploaded attachment URL on a line of its own, not
  from a file in the repo, and the attachment limit is 10MB on a free plan. No
  video and no recording script are committed.
- The old `desktop/` screenshots could not simply be deleted: `LOCAL_IMAGES` in
  `src/test/fixtures/trip.ts` (the seed rows, the e2e Unsplash fixture, the unit
  tests) pointed at them — which is also why the seeded polaroids showed the old
  UI. They now point at `public/fixtures/trip-{1..5}.jpg`, 1200px copies of five
  bundled travel photos, and `trip.test.ts` checks each exists under `public/`.
- Screenshots (Playwright MCP, reduced motion, 1440×900 and 390×844): ten
  desktop and ten phone, in one README section rather than one per route —
  trimmed in review from a 41-shot set. Landing, form steps, a real generated
  Barcelona trip (hero, tours, packing list, weather), saved trips, `/about`;
  `public/screenshots/{desktop,mobile}-*.png`, about 3.7MB. Tall sections were
  shot as elements with the nav hidden and after a scroll pass: the fixed nav
  lands mid-image, and `Reveal` content stays at opacity 0 until scrolled to.
  `redesign/`, `mobile/` and the root `screenshot.png` are gone.
- Fixed in review:
  - Generated titles shouted the name ("MARTA's …"): the tool schema asked for
    "the capitalized userName". It now asks for the name as a name, not in
    capitals, with a test on the schema text; a real call came back "Marta's".
  - The hero's cyan sticker sat at `left-[4%]` of the viewport, on top of "Plan
    the trip." at every width below ~1440px. It is now placed from the centre,
    1rem short of the content column, and shown from 85rem, where the gutter fits
    it.
  - The orchid sticker, at `top-[38%]` of the hero, tucked under "See saved
    trips". It is at `top-76` now, clear of the buttons at every `lg+` width.
  - Below `md` every sticker was hidden. The phone keeps one: the cyan sticker in
    the flow beside the squiggle (`data-sticker="phone"`), where a wrapping
    heading cannot reach it.
  - `landing.spec` pins all three: the cyan sticker clear of the heading and the
    orchid above the buttons at 768–1920, and the phone sticker visible below
    the heading at 390.

## Branch 5 — `intro-once` (the two follow-ups that were parked as "Later")

Parked while branches 1–4 were in flight; done together, because streaming the
deck only makes sense once the intro no longer plays over the wait.

- **The intro plays once a day.** `Intro` writes `trip-ai-intro-seen=1`
  (`landing/introCookie.ts`, `Max-Age` 24 hours, `Path=/`, `SameSite=Lax`) on
  mount, so leaving mid-curtain doesn't replay it. `src/app/page.tsx` reads it
  with `cookies()` and, when it is set, renders no `Intro` and starts
  `IntroProvider` with `skip` (`done: true`), so the hero's squiggle and deck play
  at once. A cookie, not localStorage: the server leaves the curtain out of the
  HTML, rather than sending it for the client to pull down after hydration.
  24 hours, not a year, was the user's call: a visitor coming back the next day is
  greeted again.
- **The hero deck streams in.** `Hero` takes the deck as a `deck` slot. The page
  passes `<Suspense fallback={<HeroDeckFallback />}><LatestTripsDeck /></Suspense>`:
  `LatestTripsDeck` (server) awaits `loadLatestTrips` and renders `HeroDeck`
  (client, the polaroid `<ul>` moved out of `Hero`). The fallback is
  a `SquiggleLoader` in an `h-80` box (about one polaroid) with a `role="status"`
  label; when no trips come back it collapses. Measured with an unreachable
  database: first byte 16ms (was 1.5s).
- **The 1.5s limit is gone** (changed in review). It existed because the page
  awaited the deck before sending anything; inside `<Suspense>` only the deck's
  loader waits, so `loadLatestTrips` no longer races a timer and Prisma's defaults
  (5s connect, 10s pool) decide when an unreachable database gives up. The cost it
  had — a Neon wake-up slower than 1.5s losing that visitor's deck — goes with it.
  The other side: with the database down, the loader spins and the stream stays
  open until Prisma gives up — measured with an unreachable host: first byte
  39ms, the stream closes at 5.0s (Prisma's connect timeout) with no deck and
  the error logged.
- Tests: `introCookie` (value, 24h lifetime), `Intro` (writes the cookie),
  `IntroProvider` (`skip` starts done), `HeroDeck` (the old deck tests, moved),
  `LatestTripsDeck` (loads and deals; nothing on `[]`; the fallback's status),
  `Hero` (renders the slot). `landing.spec`: the HTML has the curtain for a
  first visit and not for a repeat one, the cookie lasts a day, the deck still
  deals on a repeat visit. Asserted on the server's HTML, not the live DOM: the
  intro removes itself after ~3s, which a loaded runner passed before the first
  assertion (it failed that way under the parallel run).
- **Main merged in after #183**: #183 changed the phone deck from an
  overlap (`-mt-20`, `z-30/20/10`) to a column with a `mt-8` gap, in `Hero.tsx`.
  The deck lives in `HeroDeck.tsx` here, so the gap moved with it; without it the
  overlap comes back on phones, and #183's `landing.spec` test catches it.

## Verification (each branch)

- `npx next typegen && npx tsc --noEmit`, `npm test`, `npm run build`.
- `npm run seed:e2e` + `npm run test:e2e` with `DATABASE_URL` on the local
  `trip-ai-e2e-pg` container; check port 3100 is free first, and stop any server
  started for the browser pass by port.
- Playwright MCP: landing at 1440/768/390, reduced motion, console errors, a11y
  snapshot; branch 2 also clicks a polaroid through to its saved trip; branch 3
  checks the nav tile, the lockup and the favicon in the tab.
- Stage, report, wait for review before any commit.
