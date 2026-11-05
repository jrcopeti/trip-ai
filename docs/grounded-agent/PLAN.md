# PLAN: trip-ai as a grounded agent

What comes next. What was built, each branch's reviews and the measurements are in
[`DEVLOG.md`](DEVLOG.md); a branch label here (2m-b, 2e-f) is an entry there.

## Goal

An agent that looks things up (weather, climate, real places, the web, entry rules), returns the
same trip page with sources, and can revise a trip on request. It is measured (cost, latency,
quality) and reachable over MCP.

Today the server checks the request, resolves the place, fetches the forecast and photos, makes one
streamed `submit_trip` call and writes the `Trip` row. The model has no tools yet, so its tours,
prices and entry rules are its own knowledge.

### Decisions in force

- **Shape:** the form stays. A server-side agent loop with tools produces the trip, and a short
  "change something" box on the trip page refines it.
- **Sources:** Anthropic web search and fetch, Google Places (New), Open-Meteo climate normals, entry
  and visa requirements through web search.
- **Model:** `claude-sonnet-5-5` ($2/$10 per MTok). It rejects forced `tool_choice`, so the trip comes
  back through a `strict: true` `submit_trip` tool with `tool_choice: auto`.
- **In scope:** evals, a cost and latency log, and MCP (trip-ai as an MCP server first, remote servers
  later).
- **Out of scope this round:** memory and RAG/embeddings. There are no accounts and no corpus, and web
  search covers freshness.

## Where we are

| Phase | What | State |
|---|---|---|
| 1 | The prompt on the server, new fields, new model | Done |
| 2 | The server owns the trip, plus what using it turned up | 2r–2u left, then a README pass |
| 3 | `agent-metrics`: record every call, rate-limit | Not started |
| 4 | `agent-tools`: the loop, the tools, live progress | Not started |
| 5 | `agent-refine`: change the trip from the trip page | Not started |
| 6 | `agent-evals` | Not started |
| 7 | `agent-mcp`: trip-ai as an MCP server | Not started |

## Next up

In this order: 2r → 2s → 2t → 2u-a → 2u-b → the README pass → phase 3. One branch each, from the
review of 2026-10-29.

- **2r · `note-as-context`: the note is context for the trip.** The traveller's note is
  something the plan should know (who they visit, a booking they have, a place they loved), not
  a remark. Form: step 6's field reads as context (label, placeholder and a hint under it, in
  `form/content.ts`), and the review and the trip's details use the same name. Prompt: "The
  traveller's note" becomes "The traveller's context": weigh it across the tours, the packing and
  the tip, and say so when it changes the plan; it still never changes the instructions (the
  `<traveller_note>` tag stays, the column stays `note`). Tests: `prompt.test`, the form step and
  `FormDetailsSection`. One paid trip with a note to read the result (about $0.10).
- **2s · `packing-by-threes`: 9, 12 or 15 items.** The packing grid is three columns wide; a
  count off a multiple of three leaves a ragged last row. The prompt and `submit_trip`'s
  description ask for exactly 9, 12 or 15, picked by the trip's scale (nights, luggage, weather).
  A count off the three is not an error (a retry costs a trip): the server keeps the largest
  multiple of three it can, never under 9 (10 → 9, 14 → 12, 17 → 15), and keeps fewer than 9 as
  they came. Older rows show as stored. Tests: the trim (pure, in `submitTrip.ts`),
  `generateTrip` writes the trimmed list, `prompt.test`. One paid trip to check the count.
- **2t · `trip-created-at`: when the trip was planned.** Date only, "Planned on 29 Oct 2026",
  formatted on the server in UTC like the trip's dates (near midnight it can be a day off for a
  traveller far from UTC: accepted). Shown in `TitleSection`, beside the dates, and as a row in
  `FormDetailsSection`. Copy in `trips/content.ts`. Tests: both sections; the journey sees it.
- **2u · the seconds a trip took — split 2u-a, 2u-b.**
  - **2u-a · `generation-seconds-server`.** `Trip.generationMs Int?`: `generateTrip` measures
    from its start to just before the write (the city check, the forecast, the model and the
    photos: what the traveller waited for) and writes it. `FormDetailsSection` shows "Planned in
    48 s"; older rows (null) leave the row out. Branch 3's `Generation.latencyMs` is per model
    call, for cost; this one is the traveller's wait. Tests: `generateTrip` writes it (fake
    timers), the details row with and without it. **Production `db push` before deploying.**
  - **2u-b · `generation-seconds-loader`.** The loader counts the seconds while one is in
    flight. `transition`'s `start` stores `startedAt` beside the token, so the count survives
    leaving `/form` and coming back; `LoaderResponseAI` shows it, ticking each second (text only,
    so reduced motion changes nothing) and announced politely at most every ten seconds, not
    each tick. `docs/generation.md`'s state tables gain `startedAt`. Tests: `generation.test`, the loader
    under fake timers (`docs/testing.md`). The planning toast off `/form` can show it too:
    decided in the branch.
- **The README pass.** 2j's review once more, against what 2r–2u changed: the text, and the
  screenshots at the sizes under "Rules".

## Phases 3–7

Each is split into reviewable sub-branches when it starts. Phase 4 will certainly need it.

### 3 · `agent-metrics`: record every call, rate-limit
- Prisma model `Generation`: id, createdAt, kind (`generate` | `refine` | `eval` | `mcp`), model,
  inputTokens, outputTokens, cacheReadTokens, cacheWriteTokens, webSearches, webFetches,
  toolCalls Json, iterations, latencyMs, costUsd Decimal, stopReason, ok, error, tripUrl?, ipHash.
- `src/lib/agent/cost.ts`: a pricing table (Sonnet 5.5 input, output, cache read/write, $ per web
  search) and `costOf(usage)`, unit-tested.
- `recordGeneration()` is called from a `finally` in the agent, so failures are logged too — and
  stopped ones (2g): `ok: false`, `stopReason: "aborted"`, and the usage that had arrived. A stream
  stopped early may never report its final usage, so that row's cost is an estimate.
- Rate limit: count `Generation` rows by `ipHash` in the last hour (e.g. 5 per hour), and return a
  typed error the form shows as a toast. No Redis. Stopped generations count, or starting and
  stopping would get around it.
- `scripts/usage-report.ts` (`npm run usage`): trips, $ per trip (p50/p95), seconds per trip
  (p50/p95), cache hit rate, failures by stop reason. A script, not a page, since there's no auth for
  an admin page.
- From 2m-b: thinking tokens are output tokens, so `outputTokens` counts them; record
  `output_tokens_details.thinking_tokens` too, and retries (2m-b's broken-list retry is a second
  call for one trip). 2m-b's measured baseline, one trip in Lisbon: about $0.095 and 65s with
  thinking (production since #239), $0.025 and 22s without.
- Candidate, from 2p: `Trip.answeredAt DateTime?`, set by `setTripSaved`, if a metric needs
  discarded vs never answered or the time to an answer; `isTripOpen` would then read it rather
  than `saved`. Only when a report asks for it.
- README wrap-up (see "Rules"), in this phase's last branch.

### 4 · `agent-tools`: the loop, the tools, live progress
- `src/lib/agent/loop.ts`: a manual loop (so each iteration's usage and the progress events can be
  captured) with at most 8 iterations, `task_budget` (beta) as a token ceiling, and a 150s wall clock.
  Parallel tool results go back in one user message; a failed tool returns `is_error: true`.
- Tools in `src/lib/agent/tools/`, each a Zod schema plus a handler, with unit tests against mocked
  HTTP:
  - `get_forecast`: reuses `fetchForecast` (`openWeatherApi.ts`), which already fetches at
    `resolvePlace`'s lat/lng, and **summarises** it per day
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
- Streaming: the route answers in server-sent events (`done`, `error`, and `step`; moved here from
  2g, which kept the JSON response); the loop runs inside it and emits `step` events
  ("Checking the weather in Lisbon…"), with `maxDuration = 300`. `LoaderResponseAI` and 2e-f's
  toast show the real steps in place of the canned ones.
- Stopping: the request's `signal` reaches every iteration's Claude call and every tool's HTTP
  call, and the loop checks it between iterations — or Stop would end only the first call.
- Trip page: each tour card shows its address and a "map" link; a Sources section; an entry-requirements
  card. Read `docs/design-notes.md` first.
- e2e: the fixture path (`E2E_FIXTURES=1`) returns a fixture stream with the new fields.
- README wrap-up (see "Rules"), in this phase's last branch.

### 5 · `agent-refine`: change the trip from the trip page
- `refineTrip({ trip, instruction })` is stateless: the current trip JSON plus the request go to the
  same loop and tools, and a revised trip comes back through `submit_trip`. No conversation history is
  stored, which avoids replaying thinking blocks. The revised trip overwrites the `Trip` row
  (from branch 2) and the page calls `router.refresh()`.
- UI: a text field and button below the tours ("Swap something, add a rainy-day option…"), at most
  5 refinements per trip, with the SSE progress. Logged as `kind: refine`.
- Tests: the route validates the instruction (length, presence); a component test for the box; an e2e
  test on the fixture path.
- README wrap-up (see "Rules"), in this phase's last branch. Shots of the live progress loader and the trip's places and sources.

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
- From 2m-b (`string-tours-results.md`): its harness (variants, raw inputs kept) is a start for
  the runner, and its checks are candidate code graders: the calendar (1 May 2030 is Labour Day:
  thinking trips say so, others never), the entry rule stated when a foreign passport is set,
  tours within 110 to 130 words, no written `\n`. `validTripRequest` (Lisbon) is one case.
  Decide thinking and effort here: whether the thinking's quality is worth 4× the cost and 3×
  the time, and whether `low`/`medium` (a third shorter) hold.
- README wrap-up (see "Rules"), in this phase's last branch.

### 7 · `agent-mcp`: trip-ai as an MCP server
- `src/app/api/mcp/route.ts` using `@modelcontextprotocol/sdk` (Streamable HTTP), with tools
  `plan_trip` (calls the agent function 2g split out, not the HTTP route; logged as `kind: mcp`), `list_saved_trips` and `get_saved_trip`
  (reusing `getSavedTripsPage` and `getSingleSavedTrip` from `src/db/actions.ts`).
- Bearer-token auth (`MCP_TOKEN`), since `plan_trip` spends money, and the same rate limit.
- README: how to add it to Claude Desktop / Claude Code.
- Later, not in this plan: connect remote MCP servers to the agent (Messages API MCP connector, beta
  `mcp-client-2025-11-20`) once there's one worth using.
- README wrap-up (see "Rules"), in this phase's last branch. Also the final pass: the feature list and stack matched to what shipped, MCP setup.

## Extras

Found along the way and not scheduled as a branch. Each is open; "From" is its `DEVLOG.md` entry.

| Item | From | Goes with |
|---|---|---|
| Typed errors (invalid request, place not found, refusal); today every failure is one toast | 1 | 3, with the rate limit |
| Effort (default `high`) and `max_tokens` (16000), against the latency numbers | 1c-b | 3 |
| `Trip.savedAt`, so "newest" can mean newest saved rather than newest planned | 2q | 3, with `answeredAt` |
| A retry when the model skips `submit_trip` | 1 | 4, the loop owns it |
| A trip's end day can go without a forecast: widen `tripForecast`'s date filter by a day, or take the dates in the destination's zone | 2e-e | 4, `get_forecast` |
| Half-hour offsets put "nearest midday" 30 minutes off: measure in minutes | 2e-e | 4, `get_forecast` |
| A shorter timeout and one retry on the GeoNames and OpenWeather fetches | 2k | If the timeouts recur |
| One permanent announcement region for toasts; a toast's `role="status"` arrives filled, so a screen reader may not announce it | 2e-f | Its own branch |
| A shared fade on `ToastCard`; react-hot-toast animates only its built-in toasts | 2e-f | Its own branch |
| A blur per photo (`placeholders[]`): later photos fade in from the first one's blur. A schema change, six plaiceholder fetches per trip | 2n | Its own branch |
| `/saved-trips`' first page rendered on the server | 2 | Its own branch |
| A keyset cursor on `(createdAt, id)` for `/saved-trips`, which ends the shifting pages `skip` allows | 2q | Its own branch |
| Tabbing into `CountryComboBox` opens its list at once, and HeroUI's popover fades out under reduced motion | 1 | Its own branch |
| Tests that fail intermittently: `GenerationContext.test`'s planning toast (about 1 full-suite run in 5), `StartOver.test`, `saved-trips.spec`'s weather stream, the `/form` city-check specs | 2e-g, 2i-c, 2i-g | Its own branch |
| Prisma 7 on Neon through `pg`: no check of `/saved-trips` and a saved trip on the deployed app is recorded | 2i-g | A quick look, no branch |
| `@hookform/resolvers` 6: npm refuses it over two optional peers; Renovate's held PR waits for the upstream fix | 2i-d | When upstream fixes it |
| Anthropic's answer to the report on the list sent as a string; none is recorded | 2k | When it arrives |

## What changed in the plan

| It was | It is | Why | Entry |
|---|---|---|---|
| Fewer trip types and interests | The ten types stay and three join; the interests grow by eight | A wide choice is the point (2026-10-13) | Context |
| The generation is a server action | A `fetch` to `POST /api/trip` | Next runs server actions one at a time, so a cancelled call held the city check | 2e-f |
| 2g streams server-sent events | 2g stops a cancelled call and keeps the JSON answer; the events move to phase 4 | Only phase 4's steps need them (2026-10-20) | 2g |
| `useConfirmOnPageExit` is removed | It stays, asking before a reload while a generation is in flight | A reload or a closed tab ends the generation | 2c, 2e-f |
| The browser fetches the forecast and sends it | The request says `byWeather` and the server fetches it | A crafted request could put any "forecast" into the prompt | 2e-e |
| Zustand is not adopted | Adopted for the generation's store; the form stays on React Hook Form | One state stopped each review finding a new timing case | 2e-f |
| No retry on a bad response | One retry on a list sent as broken text | 6 of 15 real runs broke; measured, a break costs under $0.015 without thinking | 2k, 2m-b |
| A tour is three to five sentences | One paragraph of 110 to 130 words | Short beside older trips, then too tall at 390 | 1c-b, 2f |
| The open trip moves to the database (2p) | Dropped; `localStorage` stays the guide | A cookie is as easy to shed, so it guards nothing the rate limit doesn't | 2p |
| Answering jumps the page to the top (2o) | Closed, not reproduced | The page held its place at 1440 and 390 on every route to it | 2o |

Added to phase 2 after it was planned: the form's draft and "Start over" (2e-d), generation in the
background (2e-f), one open trip per browser (2e-g), the bundled country list and stricter request
checks (2h), the planned dependency majors and Renovate (2i), the tip's and description's paragraphs (2l,
2m-c), entry rules only when they apply (2m-a), a sixth photo (2n), newest first (2q) and 2r–2u.

## Rules

### README wrap-up, once per phase

Once per phase (2, 3, 4, 5, 6, 7), not per sub-branch. The last branch of
a phase ends with a review of `README.md` against everything the phase changed, folding in what
a reader would care about: text and descriptions (features, how it works, stack, setup, env
vars, commands) and screenshots of anything visible. Sub-branches such as 2b or 2d do not touch
the README. A phase with nothing visible still gets the review and reports "no README change".
Phase 2's is the README pass under "Next up".

- Screenshots come from the Playwright MCP tools, saved in `public/screenshots/`, named
  `desktop-<page>[-<step>].png` / `mobile-<page>[-<step>].png`.
- **Laptop shots are all one size: a 1440 × 900 viewport, viewport capture, never full-page**,
  so every desktop image is 1440 × 900.
- **Phone shots are 390 × 844, at most four in a row** (`width="24%"`).
  A set of more than four wraps onto another row.
- Alt text says what is in frame; the README's captions say what the phase added.

### Reused as-is

`fetchForecast` (`src/app/api/openWeatherApi.ts`), `useGeoNames` city validation, `TOUR_KINDS`
(`src/lib/tourKinds.ts`), `useE2EFixtures` (`src/app/api/e2eFixtures.ts`), `getSavedTripsPage` and
`getSingleSavedTrip` (`src/db/actions.ts`), the `src/test/fixtures/` set (extended, not duplicated).

### Expected cost (to be measured in branch 3)

Rough: 30–60k input tokens (search results included), about 6k output, about 5 searches comes to
roughly $0.15–0.25 a trip on Sonnet 5.5, and 30–90s. The usage report and evals replace this guess
with real numbers. Measured in 2m-b for today's single call (no tools): about $0.095 and 65s with
thinking, $0.025 and 22s without.

### Verification (each branch)

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
