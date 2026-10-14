# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Working agreement

**Never run `git commit`, `git push`, or `gh pr create` on your own initiative.** Finish
the work, `git add` it so it shows up in the VS Code diff, say what changed — and stop
there. Every diff is reviewed in the editor *before* it becomes a commit. No exceptions
for "it's only docs", "it's only a config file", or a change you are confident about.

**The review comes first even when the instruction that started the work mentioned
committing.** A sentence written before the diff existed cannot approve a diff nobody has
seen yet. So:

- "Make the change", "do X", "branch off and do X" — not permission to commit.
- "Write the plan, then commit and push it" — the *work* is authorised; the commit is
  not yet. Do the work, stage it, report, wait.
- Only "commit" / "push" / "open a PR" arriving **after** the changes are sitting staged
  in the working tree is permission — and it covers that diff only, not the next one.
- Permission does not carry across steps, branches, or turns. Ask again each time.

If you believe something genuinely has to be committed before it can be reviewed, say so
and wait for an answer instead of committing.

**Code review findings are reported, not fixed.** After a review (`/code-review` or any
other), present each finding with its severity and scenario, propose a fix for each, and
stop. The user decides which findings to fix and how; only then make the change. "Commit
and review" authorises the commit and the review — not fixes for what the review finds.

**Work in the main working tree, on the branch, so the diff is visible.** Create the
branch with `git checkout -b <name>` in the repository root — the directory the editor is
open on — rather than in a separate worktree. Work done in a detached worktree (under
`/tmp`, say) cannot be reviewed, because the editor never sees it. If a worktree is genuinely
needed (reproducing a clean-checkout build, for instance), it is for verification only;
the change itself still lands here.

**Leave the branch checked out when you are done**, so the next session and the editor
agree on where the work is.

Corollary for anything outward-facing — pushing, PR bodies, PR comments, repository
settings, deploys: same rule, and ask first. Reading is always fine.

## Per-branch checklist

Every piece of work is one branch off `main`, one PR:

1. `git checkout main && git pull && git checkout -b <branch>` in the repo root — not a
   worktree (see the working agreement above).
2. Before touching styling, read `docs/design-notes.md` — at least "Building a page"
   and "Gotchas that cost real time".
3. Do the work, and write its tests in the same PR — a failing test first for a bug.
4. Green: `npx next typegen && npx tsc --noEmit`, `npm test`, `npm run build`, and
   `npm run test:e2e` when the change touches a covered flow. `npm run lint` is broken
   and is not a signal.
5. When the change is visible, verify it in the browser with the **Playwright MCP**
   tools: `browser_navigate`, `browser_resize` at 1440 / 768 / **390**,
   `browser_emulate_media` with `prefers-reduced-motion: reduce`,
   `browser_console_messages` for hydration errors, `browser_snapshot` for the a11y
   tree, `browser_take_screenshot` for the record.
6. Update the work's plan (`docs/<topic>/PLAN.md`), and `docs/design-notes.md` when the
   visual system changed.
7. **Stage the work and stop.** No commit, no push, no PR — see the working agreement.
   Leave the branch checked out.

### Keep PRs small

A PR is sized to be reviewed in one sitting: **one concern per branch**. A step that
spans several (data model + form UI + an external API + a prompt) is split into
sub-branches — `1a`, `1b`, … — each green and mergeable on its own, with dependencies
going one way.

- Split **before writing code**: when starting a plan step, write the split into its
  `PLAN.md` (what each sub-branch holds, and the order) and say it in a line.
- A sub-branch may leave a temporary bridge for the next one (an old call site adapted,
  not rewritten) — name it in the plan so the next branch removes it.
- If a branch grows past its concern mid-work, stop, propose a split, and move the rest
  to the next sub-branch rather than finishing it here.

## Code comments

Up to three lines, saying *why* — a constraint, a trap, a decision — with enough context
that a reader doesn't have to go and look it up. Not what the code already says, and not
how it got there (that is the commit message and the plan). No multi-paragraph docblocks:
if it needs more than three lines, write it in `docs/design-notes.md` or the plan and leave
a one-line pointer in the code.

## Commands

```bash
npm run dev          # start dev server
npm run build        # prisma generate && next build --webpack
npx tsc --noEmit     # the type check — use this, not lint
npm test             # vitest run — the unit suite
npm run test:watch   # vitest in watch mode
npm run test:e2e     # playwright test (chromium); needs a seeded DB
npm run db:push:e2e  # push the Prisma schema to the e2e database
npm run seed:e2e     # seed the e2e database — DESTRUCTIVE, see below
```

### Tests

**Unit — Vitest + React Testing Library**, jsdom, config in `vitest.config.mts`.
Tests live beside the code as `*.test.ts(x)` under `src/`. `describe`/`it`/`expect` are
imported explicitly rather than enabled as globals, so `tsconfig.json` needs no `types`
entry — and because that also disables RTL's auto-cleanup, `src/test/setup.ts` registers
the unmount itself. Don't remove it: without it every render piles up in one document.
`setup.ts` also loads `jest-dom`'s matchers and polyfills `matchMedia` and
`ResizeObserver`, which react-aria (under HeroUI) needs and jsdom lacks.

Shared helpers in `src/test/`:

- `render.tsx` — `renderWithProviders`, wrapping `QueryClientProvider` (retries off) and
  `MotionProvider`. Use it for anything that touches a query or a motion component.
- `fixtures/` — `Trip` rows, the `submit_trip` trip (`tripDataFixture`), a valid `TripRequest`, OpenWeather payloads,
  an Unsplash payload, and valid form inputs. One source of truth; extend rather than
  inventing a local literal.
- `stubs/next.tsx` — `next/navigation` spies and a passthrough `next/image`.
- `imageStub.ts` — static image imports resolve to an object with `.src`, keyed by
  filename. `src/lib/utils.ts` reads `sun.src` on ten weather PNGs, so a bare string
  (Vite's default) would make every branch of `placeWeatherIcons` return `undefined`.

**Boundaries are mocked at the module edge**, never deeper: `vi.mock("@/db")` for the
Prisma singleton, `vi.mock("@/db/actions")` for components, and `vi.mock` on
`anthropicApi`, `unsplashApi`, `openWeatherApi`. No network, no database, no keys.

Two limits to work with rather than fight: `whileInView` never fires in jsdom, so assert
that `Reveal`'s children render, never that an animation ran; and async server components
cannot be rendered by RTL, so cover their logic as a pure helper and the page itself in
Playwright.

**Fake timers plus Framer Motion needs two things**, both of them learned the hard way in
`LoaderResponseAI.test.tsx`:

- `requestAnimationFrame` is not in Vitest's default `toFake` list. Without it Framer's
  frame loop never runs, so an `AnimatePresence mode="wait"` swap never completes and the
  component is frozen on its first state however far you advance the clock. Pass an
  explicit `toFake` including `requestAnimationFrame`, `cancelAnimationFrame` and
  `performance`.
- That frame loop is a **module-level singleton**, and it will not restart under a fresh
  fake clock while it still thinks a frame is pending. So `afterEach` must `cleanup()`,
  then `vi.runOnlyPendingTimers()`, and only then `vi.useRealTimers()` — otherwise the
  *second* test in the file is the one that mysteriously fails.
- Don't assert an animated swap at an exact timestamp. Advance in small steps until the
  expected content is on screen, with a budget; that still pins the order, which is what
  the behaviour actually is.

**Anything reading the clock must pin it.** `placeWeatherIcons`, `findStartIndex` and the
schema's date refinements all compare against local time, so a UTC-anchored fixture
passes here and fails in CI. Use `vi.setSystemTime` with a *local* `Date`, and
`FIXTURE_NOW` from the weather fixture for forecast work.

**E2E — `@playwright/test`**, chromium only, specs in `e2e/`. `webServer` runs
`npm run start` on **port 3100**, so it tests a production build — and never reuses a
server: not a `npm run dev` on 3000, which reads the production database from `.env`, and
not one already on 3100, which fails the run (stop it first). With `PLAYWRIGHT_BASE_URL`
set, no server starts and the trip journey skips, since that site's database is unknown. The one production concession to
testing: the four `"use server"` modules return a fixture when `E2E_FIXTURES=1`
(`src/app/api/e2eFixtures.ts`) — those calls are server-side, so `page.route` cannot
reach them, and the alternative is live API keys in CI.

**The e2e database is `E2E_DATABASE_URL`**, defaulting to the local `trip-ai-e2e-pg`
container at CI's address (`scripts/localDatabase.ts`, which loads the `.env` files the way
Next does, so it can be set in `.env.local`). The Playwright config, the seed and the push
script all use it, so `.env`'s `DATABASE_URL` (production) never reaches a run.
Once per machine, then after each schema change:

```bash
docker run -d --name trip-ai-e2e-pg -p 5432:5432 -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=trip_ai_e2e postgres:16
npm run db:push:e2e && npm run seed:e2e && npm run build && npm run test:e2e
```

`saved-trips.spec.ts` asserts against the rows in `scripts/seed-e2e.ts`.
`trip-journey.spec.ts` (form → trip → save/discard) is the one spec that **writes**: it
runs as its own Playwright project after the rest, serially, deletes its own rows before
and after, and skips unless the database is local (`scripts/localDatabase.ts`). **The
seed script deletes every trip before seeding**, so it and the push script refuse any host
but localhost unless `ALLOW_REMOTE_E2E_SEED=1`. Run the e2e suite against a throwaway
Postgres, never the real one.

E2E assertions are behavioural; there are no visual snapshot baselines.

Browser verification is done with the **Playwright MCP** tools (see the per-branch
checklist), not by asking for a manual pass.

`npm run lint` is broken and has been for a while: it calls `next lint`, which Next 16
removed, and running `npx eslint` directly fails in `@eslint/eslintrc` with
`TypeError: Converting circular structure to JSON`. This is pre-existing and unrelated
to any current change — don't try to fix it in passing, and don't treat its failure as
a regression. **`npx tsc --noEmit` is the check that works.** Moving ESLint to flat
config is parked work.

`build` passes `--webpack`, opting out of Turbopack. Dev still uses Turbopack, which
caches CSS aggressively — see the stale-cache note in `docs/design-notes.md`.

CI runs `typecheck`, `build`, `test` and `e2e` on every PR
(`.github/workflows/ci.yml`); all four are required to merge. `tsc` needs
`npx next typegen` first on a clean checkout, because `next-env.d.ts` carries the
image-import types and is gitignored — Vitest does not, as it stubs image imports itself.
The `e2e` job brings up a `postgres` service container, pushes the schema, seeds it and
runs the suite with `E2E_FIXTURES=1`, so it needs no secrets.

After any Prisma schema change: `npx prisma generate` (already included in `build`). To push schema changes to the DB: `npx prisma db push`.

## Docs

- **`docs/design-notes.md`** — the `sorbet` design system: tokens, type scale, layout,
  motion rules, component inventory, and the gotchas that have already cost debugging
  time. **Read it before styling anything.** Tracked in git.
- **`docs/<topic>/PLAN.md`** — one folder and plan per piece of work. Tracked. Read
  the relevant plan at the start of a task and keep it updated as the work changes
  shape; churn there is expected. A new piece of work gets a new folder.

- **`docs/sorbet-migration/PLAN.md`** — the finished **sorbet migration** (steps 0–6,
  one branch and PR each) and the **follow-ups** it left. A record now: what it set
  that still binds lives in this file (the per-branch checklist, the testing rules)
  and in `design-notes.md` (the polaroid).
- **`docs/landing-refresh/PLAN.md`** — the finished **landing refresh** (branches
  1–6): real saved trips, features and logo on the landing, the once-a-day intro,
  and its copy in `content.ts`. A record now; what binds is in `design-notes.md`.
- **`docs/grounded-agent/PLAN.md`** — the **grounded agent**, in flight. Branch 1
  (new form fields, the city check and the prompt on the server, `claude-sonnet-5-5`) is
  finished; branches 2–7 (server-owned trip, metrics, tools, refine, evals, MCP) are next.

Durable decisions belong in `design-notes.md` (visual system) or this file (rules and
architecture). A plan is for work in flight.

## Environment Variables

`.env.example` lists them all. Required in `.env.local`:
- `DATABASE_URL` — PostgreSQL connection string
- `ANTHROPIC_API_KEY` — used in `src/app/api/anthropicApi.ts`
- `UNSPLASH_API_KEY` — used in `src/app/api/unsplashApi.ts`
- `OPEN_WEATHER_KEY` — used in `src/app/api/openWeatherApi.ts`
- `GEONAMES_USERNAME` — server-only, used in `src/app/api/geoNamesApi.ts`

## Architecture

### User flow
1. `/form` — multi-step form (7 steps, managed by `FormContext`)
2. On submit: Anthropic API call → redirect to `/trips/[tripUrl]` (random 5-char UUID)
3. On the trip page: user chooses to save or discard → Prisma writes to DB
4. `/saved-trips` — lists all saved trips; `/saved-trips/[id]` — single saved trip

### State management: four Context providers (nested in `src/app/providers.tsx`, inside `MotionProvider`)
- **`FormContext`** (`src/context/FormContext.tsx`) — owns the entire multi-step form: RHF instance, Zod validation (`FormDataSchema`), step navigation (`next`/`prev`), and triggers weather/image fetches on the appropriate steps.
- **`TripContext`** (`src/context/TripContext.tsx`) — holds the Anthropic API response (`tripData`) and the TanStack Query mutation that sends a `TripRequest` to `generateTrip`. Redirects to `/trips/[tripUrl]` on success.
- **`WeatherContext`** (`src/context/WeatherContext.tsx`) — three separate TanStack Query mutations: current weather, 5-day forecast, and daily forecast.
- **`ImageContext`** (`src/context/ImageContext.tsx`) — TanStack Query mutation calling `fetchTripImage` (Unsplash).

### Server-side modules (all marked `"use server"`)
- `src/app/api/anthropicApi.ts` — `generateTrip(request)`: re-validates the `TripRequest` (`src/lib/agent/request.ts`), resolves the city again with `resolvePlace`, builds the prompt on the server (`src/lib/agent/prompt.ts`) and calls `claude-sonnet-5-5` with the strict `submit_trip` tool (`src/lib/agent/submitTrip.ts`) and `tool_choice: auto`. A refusal, `max_tokens`, a missing call or output that fails `TripDataSchema` all throw. Returns title, objectsList, mustHave, description, tours, tip; the traveller's own `requiredItems` come from the form.
- `src/app/api/unsplashApi.ts` — fetches 5 city photos + generates a base64 plaiceholder blur for the first image.
- `src/app/api/openWeatherApi.ts` — fetches current weather and forecast from OpenWeather at
  the coordinates `resolvePlace` returns for `{ city, countryCode }`.
- `src/app/api/geoNamesApi.ts` — `resolvePlace(city, countryCode)`: GeoNames search plus `matchCity` (`src/lib/place.ts`); returns the canonical place or a typed `not-found`/`unavailable`.
- `src/db/actions.ts` — Prisma server actions: `createTripInDB`, `getSavedTripsPage` (18 saved trips per page plus the total, for the "Show more" grid), `getSingleSavedTrip`, `getLatestSavedTrips` (the landing hero's three newest).
- `src/db/index.ts` — singleton Prisma client.

### Form data lifecycle
`Inputs` (RHF shape, `requiredItems` as `{item: string}[]`) → `FinalDataTypes` (flattened to `string[]`) via `transformInputsToFinalData`; on submit, `processForm` also sends `toTripRequest(inputs, countryCode, forecast)` — the original spelling, calendar-day dates — to `generateTrip`. Both types are derived from/extend the Zod schema in `src/lib/schema.ts`. The trip is assembled in `useCreateTrip` by merging `formData` + `tripData` (AI response) + `imageData`.

### Key custom hooks
- `useCreateTrip` — assembles the final DB payload and calls `createTripInDB`; `handleYesAnswer`/`handleNoAnswer` set `saved: true/false`
- `useFormData`, `useTripResponse`, `useImage` — context consumers
- `useCountries` — fetches country list (flag URLs, ISO codes) for the autocomplete
- `useGeoNames` — debounced city check, through the `resolvePlace` server action; run once in
  `FormProvider`, which hands it out as `cityCheck`

### Styling

**Every route is on the `sorbet` system, and it is the only one.** The previous look —
its palettes, layout panels and the `gsap`/`locomotive-scroll`/`swiper`/`daisyui`/
`react-spinners` packages — is gone, and `src/test/hygiene.test.ts` keeps it gone.

- **Tailwind CSS v4**, configured CSS-first — design tokens live in the `@theme` block
  of `src/app/globals.css`, not in a JS config. A `tailwind.config.ts` file exists but
  is an empty stub (`const config: Config = {}`) — nothing is configured there, so don't
  add tokens to it expecting them to apply.
- **HeroUI v3** (`@heroui/react`) for accessible base components, with its stylesheets
  imported at the top of `globals.css` and its semantic colours mapped to sorbet on
  `:root` (`--accent` → ink). There is no `HeroUIProvider`.
- **Fonts** — `src/app/layout.tsx`. `Rubik` is the face, exposed as `font-sorbet` and
  set on `<body>`.
  `Caveat` is the handwriting face, exposed as `font-sorbet-hand`, for polaroid captions
  only. Both CSS variables must stay on `<html>` (design-notes explains why).
- **Motion** — Framer Motion only.

For the full system — palette roles, type scale, layout rhythm, the reduced-motion
rules, and the mistakes already made — see **`docs/design-notes.md`**.

### Path aliases
`@/` maps to `src/` (configured in `tsconfig.json`).

### Image handling
Remote images from Unsplash (`images.unsplash.com`) are whitelisted in
`next.config.mjs`.
Plaiceholder generates base64 blur placeholders server-side.

`src/data/index.ts`'s `travelPhotos` is the bundled photo set: `{ src, alt, tripType,
placeholder }` per photo, typed as `TravelPhoto`. `alt` describes what is in frame and
claims no place; `tripType` is one of the form's trip-type values; `placeholder` is the
plaiceholder blur of that file, regenerated with `node generatePlaceholder.mjs`.
`src/data/index.test.ts` keeps alts and blurs unique. `pickTravelPhoto` (`src/lib/`)
picks one at random on the server — `/about`'s photo and the landing's band — so both
pages call `await connection()` to render per request.

### Database
Single `Trip` model (Postgres via Prisma). `relationMode = "prisma"` is set for PlanetScale/edge compatibility. All trips are written immediately (saved or not); `saved: boolean` distinguishes them.
