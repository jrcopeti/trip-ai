# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # start dev server
npm run build        # prisma generate + next build
npm run lint         # eslint via next lint
```

There are no tests in this project.

After any Prisma schema change: `npx prisma generate` (already included in `build`). To push schema changes to the DB: `npx prisma db push`.

## Environment Variables

Required in `.env.local`:
- `DATABASE_URL` — PostgreSQL connection string
- `ANTHROPIC_API_KEY` — used in `src/app/api/openaiApi.ts`
- `UNSPLASH_API_KEY` — used in `src/app/api/unsplashApi.ts`
- `NEXT_PUBLIC_OPENWEATHER_API_KEY` — used in weather hooks
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
- `src/app/api/openaiApi.ts` — calls Claude (claude-sonnet-4-6) via tool use with a `tripData` tool schema; returns structured JSON (title, objectsList, mustHave, requiredItems, description, tours, tip).
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
Tailwind CSS + DaisyUI + NextUI (v2). Google Fonts loaded in `src/app/layout.tsx` (`Red Hat Display` is the body font). Animations use GSAP (`@gsap/react`) for scroll-triggered effects and Framer Motion for page transitions. Locomotive Scroll (`v5 beta`) drives smooth scrolling.

### Path aliases
`@/` maps to `src/` (configured in `tsconfig.json`).

### Image handling
Remote images from Unsplash (`images.unsplash.com`) and DALL-E (`oaidalleapiprodscus.blob.core.windows.net`) are whitelisted in `next.config.mjs`. Plaiceholder generates base64 blur placeholders server-side.

### Database
Single `Trip` model (Postgres via Prisma). `relationMode = "prisma"` is set for PlanetScale/edge compatibility. All trips are written immediately (saved or not); `saved: boolean` distinguishes them.
