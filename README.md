# Trip AI

https://trip-ai-weld.vercel.app/

Trip AI plans a trip around you and the weather. Tell it who is going, where, how you
like to travel and what you care about; it comes back with a titled itinerary, five tours
for the city — each named and tagged with the kind of tour it is — the weather for your
dates, and a packing list that follows that weather. Keep the trips you like, and they
stay on a wall of polaroids for anyone to browse.

![The landing page](public/screenshots/desktop-landing-hero.png)

## How it works

1. **The form** (`/form`) — seven short steps: who you are, the destination (checked
   against GeoNames as you type), the kind of trip, things you must bring, dates, your
   interests, and a review. If you are leaving now, you can let the forecast set the
   dates instead of choosing them.
2. **The trip** (`/trips/[tripUrl]`) — Claude (via the Anthropic API, using tool use for
   structured output) writes the title, a description, five tours with a kind for each,
   a tip, and a nine-item packing list. Unsplash supplies photos of the city; OpenWeather
   supplies the 5-day forecast or the current weather. You choose whether to keep it.
3. **Saved trips** (`/saved-trips`) — every kept trip as a polaroid, searchable by city,
   country or name. Each opens to the full trip, with the weather it was planned for.
   The landing page deals the three newest onto its hero.

## Screenshots

A real trip: Claude, Unsplash and OpenWeather answering for a cultural week in
Barcelona. The landing hero is at the top of this page.

<p>
  <img src="public/screenshots/desktop-landing-tours.png" alt="The landing: five sample tours under a photo band" width="49%">
  <img src="public/screenshots/desktop-form-step-3.png" alt="Form step 3: travel details" width="49%">
</p>

<p>
  <img src="public/screenshots/desktop-form-step-5.png" alt="Form step 5: dates, planned around the weather" width="49%">
  <img src="public/screenshots/desktop-trip-hero.png" alt="A generated trip: the polaroid and details" width="49%">
</p>

<p>
  <img src="public/screenshots/desktop-trip-tours.png" alt="Suggested tours, one at a time" width="49%">
  <img src="public/screenshots/desktop-trip-packing-list.png" alt="The packing list, with quantities" width="49%">
</p>

<p>
  <img src="public/screenshots/desktop-trip-forecast.png" alt="The next five days" width="49%">
  <img src="public/screenshots/desktop-saved-trips.png" alt="Saved trips as polaroids" width="49%">
</p>

<p>
  <img src="public/screenshots/desktop-about.png" alt="About Trip AI" width="49%">
</p>

### On a phone

<p>
  <img src="public/screenshots/mobile-landing-hero.png" alt="The landing page on a phone" width="19%">
  <img src="public/screenshots/mobile-form-step-1.png" alt="Form step 1 on a phone" width="19%">
  <img src="public/screenshots/mobile-form-step-3.png" alt="Form step 3 on a phone" width="19%">
  <img src="public/screenshots/mobile-trip-hero.png" alt="A generated trip on a phone" width="19%">
  <img src="public/screenshots/mobile-trip-tours.png" alt="The tours carousel on a phone" width="19%">
</p>

<p>
  <img src="public/screenshots/mobile-trip-packing-list.png" alt="The packing list on a phone" width="19%">
  <img src="public/screenshots/mobile-trip-weather.png" alt="The weather on a phone" width="19%">
  <img src="public/screenshots/mobile-trip-tip.png" alt="The tip on a phone" width="19%">
  <img src="public/screenshots/mobile-saved-trips.png" alt="Saved trips on a phone" width="19%">
  <img src="public/screenshots/mobile-about.png" alt="About on a phone" width="19%">
</p>

## Design

Every page is built on one design system, **sorbet**: pastel lime, orchid, lavender and
blush on a warm cream canvas, with ink for text. The face is
[Rubik](https://fonts.google.com/specimen/Rubik), with
[Caveat](https://fonts.google.com/specimen/Caveat) for the handwritten polaroid captions.
Tokens live CSS-first in the `@theme` block of `src/app/globals.css`, and the shared
pieces — polaroids, cards, stickers, the logo — in `src/components/sorbet/`.

Motion is Framer Motion only, and it respects `prefers-reduced-motion`: animations stop,
nothing is left hidden.

The palette, type scale, layout rhythm, motion rules, component inventory and the
mistakes already made are written up in [`docs/design-notes.md`](docs/design-notes.md).

## Tech stack

- **Next.js 16** and **React 19** — App Router, server actions, server components.
- **TypeScript** throughout.
- **Tailwind CSS v4** — design tokens defined CSS-first in `globals.css`.
- **HeroUI v3** — accessible base components, themed to sorbet.
- **Framer Motion** — transitions, reveals and the landing intro.
- **TanStack Query** — the API calls and the saved-trips queries.
- **React Context** — form, trip, weather and image state.
- **React Hook Form** and **Zod** — the form and its validation.
- **Prisma** and **Postgres** — saved trips.
- **Anthropic API** (Claude) — the itinerary, the tours and the packing list.
- **Unsplash API** — destination photos, with plaiceholder blurs.
- **OpenWeather API** — current weather and the forecast.
- **GeoNames** — city validation in the form.
- **Vitest**, **React Testing Library** and **Playwright** — unit and end-to-end tests.

## Running locally

```bash
npm install
npm run dev
```

The following environment variables are required in `.env.local`:

| Variable | Used for |
| --- | --- |
| `DATABASE_URL` | Postgres connection string |
| `ANTHROPIC_API_KEY` | Itinerary generation |
| `UNSPLASH_API_KEY` | Destination photography |
| `OPEN_WEATHER_KEY` | Weather and forecast |
| `GEONAMES_USERNAME` | City validation (server-only) |

## Tests

```bash
npx tsc --noEmit   # the type check (run `npx next typegen` first on a clean checkout)
npm test           # unit suite — Vitest + React Testing Library
npm run test:e2e   # end-to-end — Playwright, against a production build
```

The unit suite needs no network, database or keys: the database and the three API
modules are mocked at the module edge.

### End-to-end, locally

The e2e suite runs `npm run start` on port 3100 with `E2E_FIXTURES=1`, so the
Anthropic, Unsplash and OpenWeather calls answer from fixtures and need no keys. It does
need a database, and **the seed deletes every trip first** — so point it at a throwaway
Postgres, never a real one. The seed script and the one spec that writes both refuse a
non-local host.

```bash
docker run -d --name trip-ai-e2e-pg -p 5432:5432 \
  -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=trip_ai_e2e postgres:16

export DATABASE_URL=postgresql://postgres:postgres@localhost:5432/trip_ai_e2e
npx prisma db push
npm run seed:e2e
npm run build
npx playwright install chromium
npm run test:e2e
```

## Continuous integration

Every pull request runs four required checks (`.github/workflows/ci.yml`):

- **Typecheck** — `next typegen`, then `tsc --noEmit`.
- **Build** — `prisma generate` + `next build`. Needs no secrets.
- **Unit tests** — `npm test`.
- **E2E** — a Postgres service container, schema pushed and seeded, then the Playwright
  suite with `E2E_FIXTURES=1`. Needs no secrets either.

A **Claude Code Review** workflow also posts an automated review as inline comments when
a PR opens; comment `@claude review` to ask for another.

`npm run lint` is not part of CI: `next lint` was removed in Next.js 16 and the ESLint
config predates the flat-config format.
