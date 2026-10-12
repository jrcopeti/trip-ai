# PLAN: trip-ai as a grounded agent

## Context

Today a trip is one forced `tripData` tool call on `claude-sonnet-4-6`. The prompt string is built
**in the browser** (`processForm`, `src/context/FormContext.tsx:212-241`) and passed as free text to
the `fetchResponseAI(prompt)` server action (`src/app/api/anthropicApi.ts`). The model has no outside
data except a raw forecast dump, so tours, prices and "average weather" are its guesses.

The goal: an agent that looks things up (weather, climate, real places, the web, entry rules),
returns the same trip page with sources, and can revise a trip on request. It should be measured
(cost, latency, quality) and reachable over MCP.

### Audit of the current prompt and output

1. **The server action accepts any string.** Server actions are public POST endpoints, so anyone can
   spend the API key with their own prompt. The prompt must be built server-side from validated fields.
2. **The prompt contradicts the schema.** It asks for "three must-do activities" while the schema asks
   for five tours. The tool description says to "validate the city using a reliable data source" (there
   isn't one) and to return `{trip: null}` (not in the schema). GeoNames already validates the city.
3. **The weather is pasted in raw.** About 40 three-hourly OpenWeather entries in Kelvin, thousands of
   noisy tokens. With no forecast, the prompt says "the average weather" and gives no data.
4. **Noise in the prompt:** lowercased name/city/note, "he/she", typos, and the same instruction
   repeated in system, tool description and user prompt.
5. **The output can't be checked.** Tours have no place, address, link or source. `requiredItems`
   makes the model repeat input the app already has.
6. **Nothing is measured:** no record of tokens, cost or latency, and no evals.

Field decisions (agreed): today's trip `type` list mixes three questions (who: Family, Solo; why:
Business, Festival, Road trip, Party, Romantic; likes: Adventure, Cultural, Gastronomy, Nature, Urban,
which duplicate interests). They split into three axes plus pace:

| Field | Values | Replaces |
|---|---|---|
| `travellers` (one) | Solo · Couple · Family · Friends · Colleagues | `age`, and Family/Solo/Romantic in type |
| `ageRanges` (many) | 0–5 · 6–12 · 13–17 · 18–34 · 35–64 · 65+ | `age` |
| `type` (one) | Holiday · City break · Road trip · Business (with free time) · Event or festival · Celebration (honeymoon, birthday, bachelor) | old `types` |
| `pace` (one) | Relaxed · Balanced · Packed | new; sets how much fits in a day |
| `interests` (≤3) | About 20, deduplicated and each mapped to a `TOUR_KINDS` value: Food, Drinks (wine/beer/coffee), History, Culture, Art & museums, Architecture, Music, Nightlife, Nature, Beach, Mountains & hiking, Adventure sports, Wildlife, Shopping, Wellness, Photography, Sightseeing, Local life, LGBTQ+, Kids' fun | the 42 current ones (with the "Nighlife" typo) |

The group field is named `travellers` ("Who's going"), not "party", which clashed with the old
"Party" trip type. `nationality` becomes an optional **passport**, used only for the entry-requirements
lookup. `userName` is used only in the title. `flagUrl` and `agreement` never reach the prompt.
`travelPhotos`' `tripType` tags (16 photos) are retagged to the new `type` values, with
`src/data/index.test.ts` and `pickTravelPhoto` kept green.

### Decided with the user
- Shape: the form stays. A server-side agent loop with tools produces the trip, and a short "change
  something" box on the trip page refines it.
- Sources: Anthropic web search/fetch, Google Places (New), Open-Meteo climate normals, entry/visa
  requirements (through web search).
- Model: **`claude-sonnet-5-5`** ($2/$10 per MTok). It rejects forced `tool_choice`, so the trip comes
  back through a `strict: true` `submit_trip` tool with `tool_choice: auto`.
- In scope: evals plus a cost/latency log, and MCP (expose trip-ai as an MCP server first, consume
  remote servers later).
- Out of scope this round: memory and RAG/embeddings. There are no accounts and no corpus yet, and web
  search covers freshness.

## Branches (one PR each, per CLAUDE.md's checklist; stage and stop)

This plan lives in `docs/grounded-agent/PLAN.md` and is updated as each
branch lands.

### 1 · `agent-request`: the prompt on the server, new fields, new model
- `src/lib/agent/request.ts`: a Zod `TripRequestSchema`, derived from `FormDataSchema` minus `flagUrl`
  and `agreement`, with caps: note ≤ 500 chars, ≤ 10 required items of ≤ 60 chars, ≤ 3 interests.
- **City check: keep GeoNames, fix it, run it on the server** (decided). Today it runs only in the
  browser (`useGeoNames`, gating Next in `FormButtons.tsx:44`), matches the name exactly
  (`name`/`toponymName === input`, so "Lisboa", "Munchen" and "Sao Paulo" fail), and exposes the
  username as `NEXT_PUBLIC_GEONAMES_USERNAME`. Meanwhile OpenWeather geocodes `city,country` again on
  its own.
  - `src/lib/place.ts`: a pure `matchCity(input, results)` that normalises both sides (trim,
    lowercase, strip accents with NFD) and compares against `name`, `toponymName`, `asciiName` and
    `alternateNames` (the search uses `style: "FULL"`, `orderby: "population"`). It requires
    population > 0 and prefers the most populous match. Unit-tested with Lisboa/Lisbon, München/Munchen,
    São Paulo/Sao Paulo, a non-city, and a city in the wrong country.
  - `resolvePlace(city, countryCode)`, a server action, calls GeoNames with a server-only
    `GEONAMES_USERNAME` (the `NEXT_PUBLIC_` one is removed) and returns `{name, country, lat, lng,
    timezone, geonameId}` or a typed "city not found" error.
  - `useGeoNames` calls `resolvePlace` (still debounced) for the live message on step 2, and the form
    shows the canonical name it found ("Lisbon, Portugal").
  - `generateTrip` calls `resolvePlace` again and never trusts the client. Every tool takes these
    coordinates, and the tool description stops asking the model to validate the city.
  - e2e: `resolvePlace` returns a fixture under `E2E_FIXTURES=1`, like the other server modules.
- **Packing driven by the inputs.** Drop the fixed "9 items / 4 must-haves". The prompt asks for
  between 6 and 15 items, scaled by duration (from the dates) × weather × luggage (backpack or
  carry-on → laundry plan, liquids ≤100ml) × transport (plane: liquid and battery rules; car: bulky
  items fine; bicycle or motorcycle: rain gear, compact items; boat: motion sickness) × accommodation
  (camping: sleeping bag; hostel: padlock, towel; apartment: fewer toiletries) × party (kids' items).
  Budget steers tours and places (`priceLevel`), not packing. "How are you travelling?" stays as it
  is; the prompt treats it as how they get around.
- **Voice: write to the traveller, not about them.** Today's prompt describes the user in the third
  person, and the output copies it: "Maria chose Barcelona. One day Maria will visit the church, the
  other day Maria will eat…". The system prompt asks for:
  - Second person ("you") throughout the description, tours and tip. The name appears in the title
    and at most once in the description.
  - Personal over generic: each tour and the tip say *why it suits this trip*, tied to the actual
    inputs (the kids' ages, the pace, the chosen interests, the hostel, the carry-on, the forecast).
    No filler that would fit any traveller.
  - Varied sentences: no run of sentences starting with the same word, and no "One day… the other
    day…" itinerary narration.
  - Phrased as positive guidance with one short good/bad example pair, not a list of banned words.
    A unit test checks the prompt contains the guidance. The evals (branch 6) grade it: the name
    appears at most twice outside the title, and the judge scores whether each tour's reason
    references the user's inputs.
- `src/lib/agent/prompt.ts`: pure `buildSystemPrompt()` (stable, cached) and `buildTripMessage(req)`
  (the per-trip facts as a labelled block). The user's note and items go inside
  `<traveller_note>` as data, never as instructions. Unit-tested as snapshots plus a test for each
  rule: no "three activities", no lowercasing, no pronouns.
- `src/app/api/anthropicApi.ts` → `generateTrip(req: TripRequest)`: validates the request, builds the
  prompt, calls `claude-sonnet-5-5` with a `submit_trip` tool (`strict: true`,
  `additionalProperties: false`) and `tool_choice: auto`, handles `stop_reason` `refusal` and
  `max_tokens`, and Zod-parses the output (exactly 5 tours, kinds in `TOUR_KINDS`). `requiredItems`
  leaves the output; the app merges its own. `useE2EFixtures` stays.
- `FormContext.processForm` sends the structured request, not a string. `TripContext`'s mutation takes
  `TripRequest`.
- Form: step 1 has name, who's going (`ChoiceGroup`), age ranges (`ChipCheck`) and an optional
  passport (`CountryComboBox`). Step 3 gets the new `type` list and pace. Step 6 gets the trimmed
  interests. The option lists live in `src/data`, with an `interest → TOUR_KINDS` map in `src/lib/`
  (unit-tested so every interest maps to a kind). Copy goes in `components/form/content.ts`;
  `ReviewForm` and `FormDetailsSection` are updated.
- Prisma: add `travellers String?`, `ageRanges String[]`, `pace String?`, `passport String?`, and make
  `age` and `nationality` optional. Old rows keep their old `type` and `interests` values, and the
  trip page shows whatever is stored. **Ask before `prisma db push` against Neon.** Update the seed and
  fixtures.
- Read `shared/tool-use-concepts.md` and `typescript/claude-api/tool-use.md` from the claude-api skill
  before writing the call.

### 2 · `trip-on-server`: the context refactor (server owns the trip)

**Why it's in this plan, not a follow-up:** a generated trip currently lives only in client memory
(TripContext's mutation `data`). Refreshing `/trips/[tripUrl]` loses it, which is why
`useConfirmOnPageExit` exists. Refine (branch 5), the SSE progress (branch 4) and MCP `plan_trip`
(branch 7) all need the trip to exist on the server. Building them on the client-memory trip would
mean writing them twice.

What's wrong today:
- Four app-wide providers (`src/app/providers.tsx`) wrap every route, the landing and `/about`
  included. Weather and images are fetched from the browser during the form steps and carried in
  context.
- Every trip section reads from two sources (`trip?.city || formData?.city`, e.g. `WeatherSection`),
  because one component tree serves both an unsaved trip (context) and a saved one (`useSingleSavedTrip`).
- Saving sends the **whole `Prisma.TripCreateInput` from the client** to `createTripInDB`
  (`useCreateTrip`), so anyone can write any row.
- Saved trips are loaded in the browser by `useQuery` calling a server action, rather than rendered
  on the server.

Server (after the refactor):
- Generation writes the `Trip` row (`saved: false`) as soon as the trip comes back, including the
  Unsplash images (`fetchTripImage`), the resolved place and the weather summary. It returns `tripUrl`.
- `/trips/[tripUrl]` and `/saved-trips/[id]` become server components that read the row (new
  `getTripByUrl`, plus the existing `getSingleSavedTrip`) and pass `trip` as props to one `TripPage`.
  The sections take props; there's no dual-source reading.
- Current weather for the weather card is fetched in the page (server), with a short `revalidate`.
- Save and discard become `setTripSaved(tripUrl, saved)`, a flag, not a client-built payload.
  `createTripInDB` leaves the client API.

Client (stays):
- The form: RHF, step navigation, the `useGeoNames` debounce, the comboboxes. `FormContext` moves
  from `providers.tsx` into `src/app/form/layout.tsx`, scoped to `/form`.
- `useTripGeneration`: the generate call (the SSE stream from branch 4), with `router.push` to
  `/trips/[tripUrl]` when it finishes. A hook in the form page, not a context.
- Interactive pieces only: save/discard buttons, refine box, `ToursCarousel`, `Reveal` and other
  motion, the "Show more" on `/saved-trips`.
- **Removed:** `TripContext`, `WeatherContext`, `ImageContext`, `useTripResponse`, `useWeather`,
  `useImage`, `useCreateTrip`, `useSingleSavedTrip`, `useConfirmOnPageExit`. `providers.tsx` keeps
  QueryClient, MotionProvider and Toaster.

Tests: page logic as pure helpers (`loadTrip`), sections rendered with a fixture `trip` prop
(`sections.test.tsx` gets simpler), an action test for `setTripSaved`. e2e: generate → refresh the
trip page → still there; save → appears in saved trips.

Left for a follow-up: rendering `/saved-trips`' first page on the server (the "Show more" query
stays as it is), and updating CLAUDE.md's "four Context providers" architecture section, done in this
branch's diff.

### 3 · `agent-metrics`: record every call, rate-limit
- Prisma model `Generation`: id, createdAt, kind (`generate` | `refine` | `eval` | `mcp`), model,
  inputTokens, outputTokens, cacheReadTokens, cacheWriteTokens, webSearches, webFetches,
  toolCalls Json, iterations, latencyMs, costUsd Decimal, stopReason, ok, error, tripUrl?, ipHash.
- `src/lib/agent/cost.ts`: a pricing table (Sonnet 5.5 input, output, cache read/write, $ per web
  search) and `costOf(usage)`, unit-tested.
- `recordGeneration()` is called from a `finally` in the agent, so failures are logged too.
- Rate limit: count `Generation` rows by `ipHash` in the last hour (e.g. 5 per hour), and return a
  typed error the form shows as a toast. No Redis.
- `scripts/usage-report.ts` (`npm run usage`): trips, $ per trip (p50/p95), seconds per trip
  (p50/p95), cache hit rate, failures by stop reason. A script, not a page, since there's no auth for
  an admin page.

### 4 · `agent-tools`: the loop, the tools, live progress
- `src/lib/agent/loop.ts`: a manual loop (so each iteration's usage and the progress events can be
  captured) with at most 8 iterations, `task_budget` (beta) as a token ceiling, and a 150s wall clock.
  Parallel tool results go back in one user message; a failed tool returns `is_error: true`.
- Tools in `src/lib/agent/tools/`, each a Zod schema plus a handler, with unit tests against mocked
  HTTP:
  - `get_forecast`: reuses `fetchForecast` (`openWeatherApi.ts`), called with the resolved lat/lng
    instead of its own `city,country` geocode, and **summarises** it per day
    (min/max °C, conditions, rain).
  - `get_climate`: Open-Meteo climate API, typical weather for the trip's dates. Used when the start
    is more than 5 days away.
  - `search_places`: Google Places (New) Text Search with a field mask (name, address, location,
    rating, priceLevel, openingHours, googleMapsUri). New env var `GOOGLE_PLACES_KEY`.
  - Server tools `web_search_20260209` (max_uses 5) and `web_fetch_20260209` (max_uses 3), for
    events, prices, and **entry requirements for the passport**, cited from official sources where
    possible.
- `submit_trip` gains: each tour has `place {name, address, lat, lng, mapsUrl}`, `bestTime`,
  `estCost`; plus `weatherSummary`, `entryRequirements {summary, sources[]}` (only when a passport
  is given), and `sources[] {title, url}`. Prisma columns: `sources Json?`, `entryRequirements Json?`;
  `tours Json` already holds the richer shape.
- Streaming: the loop moves to a route handler, `src/app/api/trip/route.ts`, which sends SSE events
  (`step` "Checking the weather in Lisbon…", `done` trip, `error`), with `maxDuration = 300` in
  `vercel.json` for that route. `LoaderResponseAI` shows the real steps in place of the canned ones.
- Trip page: each tour card shows its address and a "map" link; a Sources section; an entry-requirements
  card. Read `docs/design-notes.md` first.
- e2e: the fixture path (`E2E_FIXTURES=1`) returns a fixture stream with the new fields.

### 5 · `agent-refine`: change the trip from the trip page
- `refineTrip({ trip, instruction })` is stateless: the current trip JSON plus the request go to the
  same loop and tools, and a revised trip comes back through `submit_trip`. No conversation history is
  stored, which avoids replaying thinking blocks. The revised trip overwrites the `Trip` row
  (from branch 2) and the page calls `router.refresh()`.
- UI: a text field and button below the tours ("Swap something, add a rainy-day option…"), at most
  5 refinements per trip, with the SSE progress. Logged as `kind: refine`.
- Tests: the route validates the instruction (length, presence); a component test for the box; an e2e
  test on the fixture path.

### 6 · `agent-evals`
- Follow the claude-api skill's `shared/evals/build-eval.md`. `evals/cases.json` has about 20
  requests: a near date (forecast) and a far date (climate), a family with kids 0–5, a winter city, a
  beach, a small town, a passport that needs a visa, a low budget, and an injection attempt in the note.
- Code graders: schema valid, 5 distinct tours, places resolved (has a mapsUrl), packing fits the
  weather (cold → warm layer), entry requirements present when a passport is set, the injected
  instruction ignored, the name at most twice outside the title.
- LLM judge (`claude-opus-5-5`): groundedness against the cited sources; fit to who's going, pace and
  interests; voice (second person, each tour's reason tied to the inputs, no repetitive narration).
- `npm run eval` writes a report: score per case, plus **$ and seconds per case** from `Generation`
  rows (`kind: eval`). Real API spend, so **ask before each run**, with the cost estimated first.

### 7 · `agent-mcp`: trip-ai as an MCP server
- `src/app/api/mcp/route.ts` using `@modelcontextprotocol/sdk` (Streamable HTTP), with tools
  `plan_trip` (calls `generateTrip`, logged as `kind: mcp`), `list_saved_trips` and `get_saved_trip`
  (reusing `getSavedTripsPage` and `getSingleSavedTrip` from `src/db/actions.ts`).
- Bearer-token auth (`MCP_TOKEN`), since `plan_trip` spends money, and the same rate limit.
- README: how to add it to Claude Desktop / Claude Code.
- Later, not in this plan: connect remote MCP servers to the agent (Messages API MCP connector, beta
  `mcp-client-2025-11-20`) once there's one worth using.

## Reused as-is
`fetchForecast` (`src/app/api/openWeatherApi.ts`), `useGeoNames` city validation, `TOUR_KINDS`
(`src/lib/tourKinds.ts`), `transformInputsToFinalData` (`src/lib/formData.ts`), `useE2EFixtures`
(`src/app/api/e2eFixtures.ts`), `getSavedTripsPage` and `getSingleSavedTrip` (`src/db/actions.ts`),
the `src/test/fixtures/` set (extended, not duplicated).

## Expected cost (to be measured in branch 3)
Rough: 30–60k input tokens (search results included), about 6k output, about 5 searches comes to
roughly $0.15–0.25 a trip on Sonnet 5.5, and 30–90s. The usage report and evals replace this guess
with real numbers.

## Verification (each branch)
- `npx next typegen && npx tsc --noEmit`, `npm test`, `npm run build`, and `npm run test:e2e` against
  the local `trip-ai-e2e-pg` container (never Neon).
- Unit tests: prompt builder, request schema, cost calc, each tool handler (mocked HTTP), loop
  behaviour with a mocked `@anthropic-ai/sdk` (iteration cap, `is_error` results, refusal,
  `max_tokens`).
- One real generation per branch from 4 on, **with permission**, against a local DB; check the
  `Generation` row (tokens, $, latency) and the trip's sources.
- Playwright MCP: form step 1 (new fields), the live progress loader, the trip page with
  places/sources/entry card, the refine box, at 1440/768/390 plus reduced motion and console errors.
- Stage, report, wait for review. No commits, pushes or `db push` to production without asking.
