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

## Commands

```bash
npm run dev          # start dev server
npm run build        # prisma generate && next build --webpack
npx tsc --noEmit     # the type check — use this, not lint
```

There are no tests in this project **yet**. Step 0 of `docs/PLAN.md` lands the harness —
Vitest + React Testing Library (`npm test`), a small chromium `@playwright/test` suite
(`npm run test:e2e`), and both as required CI jobs. Until that merges, `npx tsc --noEmit`
is the only check; after it, read the testing section of `docs/PLAN.md` before adding a
test so the mocking boundaries stay consistent.

Browser verification during a migration step is done with the **Playwright MCP** tools
(navigate, resize to 1440/768/390, emulate `prefers-reduced-motion`, read console
messages), not by asking for a manual pass.

`npm run lint` is broken and has been for a while: it calls `next lint`, which Next 16
removed, and running `npx eslint` directly fails in `@eslint/eslintrc` with
`TypeError: Converting circular structure to JSON`. This is pre-existing and unrelated
to any current change — don't try to fix it in passing, and don't treat its failure as
a regression. **`npx tsc --noEmit` is the check that works.** Moving ESLint to flat
config is parked work.

`build` passes `--webpack`, opting out of Turbopack. Dev still uses Turbopack, which
caches CSS aggressively — see the stale-cache note in `docs/design-notes.md`.

CI runs `typecheck` and `build` on every PR (`.github/workflows/ci.yml`); both are
required to merge. `tsc` needs `npx next typegen` first on a clean checkout, because
`next-env.d.ts` carries the image-import types and is gitignored.

After any Prisma schema change: `npx prisma generate` (already included in `build`). To push schema changes to the DB: `npx prisma db push`.

## Docs

- **`docs/design-notes.md`** — the `sorbet` design system: tokens, type scale, layout,
  motion rules, component inventory, and the gotchas that have already cost debugging
  time. **Read it before styling anything.** Tracked in git.
- **`docs/PLAN.md`** — the current working plan. Tracked. Read it at the start of a task
  and keep it updated as the work changes shape; churn there is expected.

  It currently carries the **sorbet migration**: numbered steps 0–6 that finish the
  redesign, each one a branch off `main` with its own PR. If you are picking up a step,
  read that step's section plus the "Per-step contract" above it — the contract is where
  the per-step checks, the Playwright MCP pass and the "don't commit" rule live. The
  polaroid spec for saved trips and the testing approach are also there, and both are
  binding.

Durable decisions belong in `design-notes.md` (visual system) or this file (rules and
architecture). `PLAN.md` is for work in flight.

## Environment Variables

Required in `.env.local`:
- `DATABASE_URL` — PostgreSQL connection string
- `ANTHROPIC_API_KEY` — used in `src/app/api/anthropicApi.ts`
- `UNSPLASH_API_KEY` — used in `src/app/api/unsplashApi.ts`
- `OPEN_WEATHER_KEY` — used in `src/app/api/openWeatherApi.ts`
- `NEXT_PUBLIC_GEONAMES_USERNAME` — used in `useGeoNames`

## Architecture

### User flow
1. `/form` — multi-step form (7 steps, managed by `FormContext`)
2. On submit: Anthropic API call → redirect to `/trips/[tripUrl]` (random 5-char UUID)
3. On the trip page: user chooses to save or discard → Prisma writes to DB
4. `/saved-trips` — lists all saved trips; `/saved-trips/[id]` — single saved trip

### State management: four Context providers (nested in `src/app/providers.tsx`)
- **`FormContext`** (`src/context/FormContext.tsx`) — owns the entire multi-step form: RHF instance, Zod validation (`FormDataSchema`), step navigation (`next`/`prev`), and triggers weather/image fetches on the appropriate steps.
- **`TripContext`** (`src/context/TripContext.tsx`) — holds the Anthropic API response (`tripData`) and the TanStack Query mutation that calls `fetchResponseAI`. Redirects to `/trips/[tripUrl]` on success.
- **`WeatherContext`** (`src/context/WeatherContext.tsx`) — three separate TanStack Query mutations: current weather, 5-day forecast, and daily forecast.
- **`ImageContext`** (`src/context/ImageContext.tsx`) — TanStack Query mutation calling `fetchTripImage` (Unsplash).

### Server-side modules (all marked `"use server"`)
- `src/app/api/anthropicApi.ts` — calls Claude (claude-sonnet-4-6) via tool use with a `tripData` tool schema; returns structured JSON (title, objectsList, mustHave, requiredItems, description, tours, tip).
- `src/app/api/unsplashApi.ts` — fetches 5 city photos + generates a base64 plaiceholder blur for the first image.
- `src/app/api/openWeatherApi.ts` — fetches current weather and forecast from OpenWeather.
- `src/db/actions.ts` — Prisma server actions: `createTripInDB`, `getAllTrips`, `getSingleSavedTrip`.
- `src/db/index.ts` — singleton Prisma client.

### Form data lifecycle
`Inputs` (RHF shape, `requiredItems` as `{item: string}[]`) → `FinalDataTypes` (flattened to `string[]`) via `transformInputsToFinalData`. Both types are derived from/extend the Zod schema in `src/lib/schema.ts`. The trip is assembled in `useCreateTrip` by merging `formData` + `tripData` (AI response) + `imageData`.

### Key custom hooks
- `useCreateTrip` — assembles the final DB payload and calls `createTripInDB`; `handleYesAnswer`/`handleNoAnswer` set `saved: true/false`
- `useFormData`, `useTripResponse`, `useImage` — context consumers
- `useCountries` — fetches country list (flag URLs, ISO codes) for the autocomplete
- `useGeoNames` — validates city existence via GeoNames API

### Styling

**Two visual systems coexist right now.** The app is mid-redesign: `/` uses the new
`sorbet` system, every other route still uses the previous look. Both are live and both
must keep working. The order the remaining routes get migrated in, and what each step
changes, is `docs/PLAN.md` — don't migrate a route ad hoc.

- **Tailwind CSS v4**, configured CSS-first — design tokens live in the `@theme` block
  of `src/app/globals.css`, not in a JS config. A `tailwind.config.ts` file exists but
  is an empty stub (`const config: Config = {}`) — nothing is configured there, so don't
  add tokens to it expecting them to apply.
- **HeroUI v3** (`@heroui/react`) for accessible base components, with its stylesheets
  imported at the top of `globals.css` and its semantic colours overridden in `:root`
  (`--accent` → neptune teal). There is no `HeroUIProvider`.
- **`daisyui` is installed but never loaded** — no `@plugin "daisyui"`, no `data-theme`
  in `src/`. Ignore it; it is a dependency to be removed, not a system in use.
- **Fonts** — `src/app/layout.tsx`. `Red Hat Display` on `<body>` is the old body font.
  `Rubik` is the new display face, exposed as `font-sorbet` and opted into per page;
  its CSS variable must stay on `<html>` (design-notes explains why).
- **Motion** — Framer Motion for anything new. GSAP (`src/hooks/useScrollTrigger.ts`)
  and Locomotive Scroll are wired into the trip pages only; don't extend them and don't
  mix them into a redesigned page.

**Tokens are additive.** The `sorbet` block is appended to `@theme`; the older palettes
(`gallery`, `neptune`, `tuna`, `shark`, `yellorange`, `deeporange`, `cabaret`, `violay`)
are load-bearing for unmigrated pages. Add tokens, never change an existing value.

For the full system — palette roles, type scale, layout rhythm, the reduced-motion
rules, and the mistakes already made — see **`docs/design-notes.md`**.

### Path aliases
`@/` maps to `src/` (configured in `tsconfig.json`).

### Image handling
Remote images from Unsplash (`images.unsplash.com`) are whitelisted in
`next.config.mjs`. The DALL-E host (`oaidalleapiprodscus.blob.core.windows.net`) is also
still whitelisted but unused — image generation was removed with the OpenAI migration.
Plaiceholder generates base64 blur placeholders server-side.

`src/data/index.ts`'s `homepageImages` has fabricated `city` labels, and entries 10–16
all share `city: "Sydney"`, `alt: "tenth"` and one blur placeholder. **Never caption an image from
that array using its `city` field.**

### Database
Single `Trip` model (Postgres via Prisma). `relationMode = "prisma"` is set for PlanetScale/edge compatibility. All trips are written immediately (saved or not); `saved: boolean` distinguishes them.
