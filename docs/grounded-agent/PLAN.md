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

Field decisions (agreed): today's trip `type` list mixes in who's going (Family, Solo), which moves
to its own field. Everything else in `type` and `interests` stays: a wide choice is the point, and
the interests list grows rather than shrinks (revised 2026-10-13; an earlier draft cut both lists).

| Field | Values | Replaces |
|---|---|---|
| `travellers` (one) | Solo · Couple · Family · Friends · Colleagues | `age`, and Family/Solo in type |
| `ageRanges` (many) | 0–5 · 6–12 · 13–17 · 18–34 · 35–64 · 65+ | `age` |
| `type` (one) | The current ten, values unchanged — Adventure · Romantic · Business · Cultural · Festival · Gastronomy · Nature · Urban · Party · Road Trip — plus Holiday · City break · Celebration | Family and Solo, now in `travellers` |
| `pace` (one) | Relaxed · Balanced · Packed | new; sets how much fits in a day |
| `interests` (≤3) | All 42 current ones, values unchanged (so old rows keep their labels; "Nighlife" fixed, "LGBT" shown as "LGBTQ+"), plus Local Life, Kids' Fun, Markets, Street Art, Theatre, Festivals, Gardens and Street Food — each mapped to a `TOUR_KINDS` value | — |

The group field is named `travellers` ("Who's going"), not "party", which clashed with the old
"Party" trip type. `nationality` becomes an optional **passport**, used only for the entry-requirements
lookup. `userName` is used only in the title. `flagUrl` and `agreement` never reach the prompt.
`travelPhotos`' two photos tagged Family and Solo are retagged (Nature, Adventure), with
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
branch lands. Each numbered branch is split into reviewable sub-branches (1a, 1b, …) when it
starts, per CLAUDE.md's "Keep PRs small"; 2 and 4 will certainly need it.

**README wrap-up, once per phase (2, 3, 4, 5, 6, 7), not per sub-branch.** The last branch of
a phase ends with a review of `README.md` against everything the phase changed, folding in what
a reader would care about: text and descriptions (features, how it works, stack, setup, env
vars, commands) and screenshots of anything visible. Sub-branches such as 2b or 2d do not touch
the README. A phase with nothing visible still gets the review and reports "no README change".
Phase 2 gets its own last branch, 2h, which also catches up anything from phase 1 the README
doesn't yet say.
- Screenshots come from the Playwright MCP tools, saved in `public/screenshots/`, named
  `desktop-<page>[-<step>].png` / `mobile-<page>[-<step>].png`.
- **Laptop shots are all one size: a 1440 × 900 viewport, viewport capture, never full-page**,
  so every desktop image is 1440 × 900. (Today's set varies from 668 to 1196 px tall; retake
  those the phase touches; the rest in 2h.)
- **Phone shots are 390 × 844, at most four in a row** (`width="24%"`; today's row uses 19%).
  A set of more than four wraps onto another row.
- Alt text says what is in frame; the README's captions say what the phase added.

### 1 · the prompt on the server, new fields, new model — split into 1a, 1b, 1c

**Status: finished.** Every sub-branch is merged: 1a (#189), 1d (#190), 1b (#191), the tidy after
1b and 1d (#192), 1a-a (#193), 1c-a (#194) and 1c-b (#196). The trip is now built on the server
from a validated `TripRequest` and generated by `claude-sonnet-5-5` through `submit_trip`.

Fixed in the wrap-up (`agent-phase1-wrap-up`):
- **Weather at GeoNames' place.** `fetchForecast` and `fetchWeather` took the country *name* and
  geocoded `city,country` with OpenWeather, whose `q` takes ISO codes, then trusted its first hit
  (a UK nation sent `q=London,England`). They now take `{ city, countryCode }`, call `resolvePlace`
  and fetch at its lat/lng; a place not found fails the call. The trip page has no code column,
  so `countryCodeFromFlag` (`src/lib/place.ts`) reads it back from `flagUrl`, which has always been
  `https://flagcdn.com/<code>.svg`; any other URL sends an empty code, and the section shows its
  error. Branch 2 should store the resolved place on the row and drop this.
  Its review found two costs, left for branch 2 (see "The place, resolved once" there):
  - **More GeoNames calls, not fewer.** Each weather call resolves the place again: the dates
    step's forecast repeats step 2's check, and every trip page view makes two (weather and
    forecast, sent at once, so a cache wouldn't merge them). Weather now fails when GeoNames is
    down or over quota.
  - **Some older saved trips lose their weather.** Rows saved before branch 1 passed a looser
    check, so a city GeoNames' strict match rejects ("Bali", a region, a typo) now shows the
    sections' errors instead of OpenWeather's best guess. Not checked against Neon.
- **One city check per spelling.** `useGeoNames` ran in both `FormStep2` and `FormButtons`, so
  each spelling was two GeoNames calls. It now runs once in `FormProvider`, which exposes
  `cityCheck`.

An audit of every typed input (after #197) found five gaps. 1–4 are left for branch 2 (see
"From the input audit" there). The fifth was fixed in `form-matches-server`:
- **The form was looser than the server.** A city with `<` or over 100 characters passed the form
  and failed at submit with the generic toast. The form's city now has the server's rules (trimmed,
  ≤ `LIMITS.city`, no line breaks or `<` `>`), and the name and city inputs take `maxLength`. Step 2's
  Next waits on the city check, so a field message could never show: `useGeoNames` checks the
  spelling against the schema first, and a refused one makes no GeoNames call and toasts the reason.
  Country and passport are picked from a list, so the form can't send a bad one; items are
  single-line inputs, and their line breaks are finding 3.
  The caps were lowered in the same branch: name, city and each required item to 50 characters
  (`LIMITS`), on the form and the server alike.

Follow-up fixes before branch 2, one branch each, both merged:
- **`fix-retry-city-toast` (#199): "Try again" re-toasted the city check.** After a failed
  generation, "Try again" brought the form back on step 7 with "Found Lisbon, Portugal" toasting
  again: the check lives in `FormProvider` and outlasts the form, and `FormStep2`'s toast effect ran
  on remount. It now toasts only when the message changes (a ref holds the last one shown); typing a
  city again still toasts, since the check clears its message while loading. Tested in
  `FormFailure.test.tsx`.
- **`axios-to-fetch` (#200): axios is gone.** `openWeatherApi.ts`, `unsplashApi.ts` and
  `useCountries.ts` use `fetch`, checking `response.ok` since `fetch` resolves on a 4xx/5xx; their
  tests stub the global `fetch`, as `geoNamesApi`'s do. `unsplashApi.ts` was tidied in passing and
  got its first test: a search with no photos now fails before any download. It still takes
  `results[0, 5, 2, 3, 4]`, as before; `results[1]` is never shown.

Left from branch 1, for the branch named or for later:
- Typed errors (invalid request, place not found, refusal) wait for branch 3's rate limit;
  today every failure is the same toast. Effort (default `high`) and `max_tokens` (16000) are
  revisited with branch 3's latency numbers.
- No retry when the model skips `submit_trip`; branch 4's loop owns this.
- Parked: tabbing into `CountryComboBox` opens its list at once (on step 1 it covers the age
  chips), and HeroUI's popover still fades out under reduced motion.


Too much for one reviewable PR (data model, form UI, GeoNames, prompt and model in one diff),
so it ships as four branches. 1a, 1b and 1d are independent of each other; 1c needs 1a and 1b.

#### 1a · `agent-fields`: the new form fields and columns
The field decisions above, end to end through the form and the database. The prompt is still
built in the browser here; `processForm`'s string only swaps the old fields for the new ones,
and 1c replaces it.

**Status: merged (#189).** As built: a shared `ChipCheckGroup` (ages and interests), the
passport through `CountryComboBox` with `isRequired={false}` and a description, `LIMITS` in
`src/lib/schema.ts` with `FormFieldsSchema` exported for 1c to derive from, step 4 stops
offering "Add" at 10 items.
Bridge for 1c to remove: the `promptModel` strings in `FormContext.processForm`, which still
lowercase the name, city and note (removed in 1c-b). The schema is pushed to the local e2e
database and to Neon.

- Option lists in `src/data`: `travellers`, `ageRanges`, `types` without Family and Solo but with
  Holiday, City break and Celebration, `paces`,
  the extended `interests`, and `optionLabel` so the review and the trip page show labels. The two
  photos tagged Family and Solo are retagged.
- `src/lib/interests.ts`: the `interest → TOUR_KINDS` map, unit-tested so every interest maps.
- `FormDataSchema`: `travellers`, `ageRanges`, optional `passport`, `pace`; `age` and
  `nationality` gone; caps shared with 1c's request schema (note ≤ 500 chars, ≤ 10 required
  items of ≤ 60 chars, ≤ 3 interests).
- Form: step 1 has name, who's going (`ChoiceGroup`), age ranges (`ChipCheck`) and an optional
  passport (`CountryComboBox`). Step 3 gets pace. Step 6 gets the extended
  interests. Copy goes in `components/form/content.ts`; `ReviewForm` and `FormDetailsSection` are
  updated.
- Prisma: add `travellers String?`, `ageRanges String[]`, `pace String?`, `passport String?`, and make
  `age` and `nationality` optional. Old rows keep their old `type` and `interests` values, and the
  trip page shows whatever is stored. **Ask before `prisma db push` against Neon.** Update the seed and
  fixtures.

#### 1a-a · `agent-ages`: finer age ranges, capped by who's going
**Status: merged (#193).** Follow-up to 1a, from using the form.
- Age ranges: 0–1, 2–5, 6–12, 13–17, 18–24, 25–30, 31–35, 36–40, 41–45, 46–50, 51–59, 60–69, 70+.
  No schema change (`String[]`); old rows keep their old values and the trip page still shows them.
- Caps by who's going: Solo exactly one age (a second pick replaces the first), Couple at most two
  (a couple can share a range), Family, Friends and Colleagues any number. Switching to Solo or
  Couple keeps the first ages (youngest first) up to the cap. A hint under the ages states the cap.
- Ages each group can pick: Solo and Friends from 13–17 up, Couple and Colleagues from 18–24 up,
  Family any (even children only). Ranges a group can't pick are hidden; switching group drops
  picks that no longer fit. `fitsGroup(range, group)` reads a range's lower bound from its value.
  `AGE_RANGE_RULES` in `src/lib/schema.ts` holds the caps, floors and messages; `FormDataSchema` enforces them in
  a `superRefine`, which 1c's request schema must apply too, since it derives from `FormFieldsSchema`.
- Tab skipped every `ChoiceGroup`: the form's default `""` reached react-aria as a selected value
  matching no radio, so every radio got `tabIndex=-1`. `ChoiceGroup` passes `value || null`.

#### 1b · `agent-geonames`: the city check on the server
**Status: merged (#191).** As built: `matchCity(input, results, countryCode)` takes the country
too, so a wrong-country match is rejected in the pure helper. `resolvePlace` lives in
`src/app/api/geoNamesApi.ts`, calls `searchJSON` with `fetch` (`geonames.js` is uninstalled) and
returns `{ ok: true, place }` or `{ ok: false, error: "not-found" | "unavailable" }`; GeoNames'
200-with-`status` errors count as unavailable. Step 2's toast reads "Found Lisbon, Portugal"; copy
in `content.ts`. The hook drops a stale answer when the spelling changed mid-request. In e2e the
fixture is the GeoNames search response, so `matchCity` still runs ("Atlantis" fails), and the
layout spec holds the server action's POST instead of a GeoNames route. Step 2 asks for the
country before the city (in the markup, so tab and mobile order follow), and the city field is
disabled until a country is chosen, with "Pick a country first." visible under it (and in its
description) until then, since the check needs both. Clearing the country disables it again and
keeps the typed city. A changed city or country shows the check as loading at once, so Next
can't pass on the previous spelling's result during the debounce. The country list drops flagcdn's
US states and the EU and UN but keeps England, Scotland, Wales and Northern Ireland; `resolvePlace`
splits `GB-SCT` into `country=GB&adminCode1=SCT`, and `matchCity` checks the nation too, so England +
Glasgow fails while United Kingdom matches any nation. `matchCity` skips GeoNames' pseudo-language
alternates (postal, airport and UN/LOCODE codes, Wikidata ids, links), so "LIS" or "1100" isn't Lisbon.
What it left is listed under branch 1's status above.

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
  - e2e: `resolvePlace` returns a fixture under `E2E_FIXTURES=1`, like the other server modules.

#### 1c · the prompt on the server, the new model — split into 1c-a, 1c-b
Request schema, prompt, model call and the form's wiring are too much for one PR. 1c-b needs 1c-a.
- **1c-a · `agent-prompt`**: the pure modules, with no call site yet. `src/lib/agent/request.ts`
  (`TripRequestSchema`, plus `toTripRequest(inputs, countryCode, forecast)`, the browser-side
  builder) and `src/lib/agent/prompt.ts` (`buildSystemPrompt`, `buildTripMessage`), a
  `validTripRequest` fixture, and unit tests. `schema.ts` exports its end-date and age-range checks
  so both schemas apply the same ones.
  **Status: merged (#194).** As built: `buildTripMessage(req, place)` also takes the resolved
  `{name, country}`, so the prompt names GeoNames' place and never the typed spelling. The message
  uses the form's labels ("Carry-on", "Couple, ages 25–30") and counts nights ("7 nights", "a day
  trip"). It strips `<` and `>` from the note and items so they can't close `<traveller_note>`. The
  system prompt already names `submit_trip`, which 1c-b defines. The prompt and message are
  snapshot-tested, and the request and prompt tests pass under UTC−10 and UTC+14 too.
- **1c-b · `agent-generate`**: `generateTrip` (with `resolvePlace`, `submit_trip`, `strict`, stop
  reasons, the Zod-parsed output), then `processForm` and `TripContext` send a `TripRequest`. This
  removes 1a's bridge (the prompt strings in `processForm`). It also updates the `tripData`
  fixture and the architecture notes in CLAUDE.md.
  **Status: merged (#196).** As built: `fetchResponseAI(prompt)` is now `generateTrip(input:
  unknown)`, which parses `TripRequestSchema`, calls `resolvePlace` and only then takes the e2e
  fixture branch, so the journey spec runs the real validation and resolve. The tool and
  `TripDataSchema` live in `src/lib/agent/submitTrip.ts`, since a `"use server"` module may only export
  async functions. Strict mode rejects `minItems`/`maxItems`, so the counts (6–15 items, exactly 5
  tours) are in the descriptions and checked by Zod. Every failure (invalid request, place not
  found, `refusal`, `max_tokens`, no `submit_trip` call, invalid output) throws, and the form shows
  its existing error toast; typed errors wait for branch 3's rate limit. No retry when the model
  skips the tool. `MustHaveSection` reads the traveller's items from `formData`, since the model
  no longer echoes them. `processForm` takes the country code from the submitted country rather
  than the watched one. Effort is left at Sonnet 5.5's default (`high`), and `max_tokens` is
  16000 to leave room for thinking. Both are worth revisiting with branch 3's latency numbers.
  One real run (local DB): $0.027, 26s, no thinking tokens, valid on the first call. Its tours
  came back at ~68 words (the prompt said three to five sentences), too short beside older trips
  (~140–200 words), so a tour was set to 140 to 180 words; at 390px those cards were too tall, so it is one paragraph of 100 to 120 words. It stays one paragraph
  because the carousel renders a description as a single `<p>`.
  From review: the form clears (`reset`, step 0, weather choice) only in the mutation's
  per-call `onSuccess`, so a failed generation keeps every answer for another try; and the
  form's `userName` rule matches the server's (trimmed, `LIMITS.name` = 100, no `<` or `>`), so a
  name the server would refuse is flagged on step 1.
  Second review: the failure panel had a "Back to the form" link to `/form`, the page it was
  on, and nothing cleared the mutation's error, so the kept answers were unreachable. The
  panel now has "Try again", which calls the mutation's `reset` (`resetResponseAI`) and
  brings back the review step, filled in. `NotFoundComponent` takes `onAction` as an
  alternative to `path`. An e2e test aborts the generate POST, then checks the review card comes back fully drawn with every answer it had before submitting.
  Third review: clearing the form in the per-call `onSuccess` drew an empty step 1 while
  `router.replace` was still navigating (worst in dev, where the trip route compiles on first
  visit). The success now only sets `clearOnLeave`; `FormProvider`, mounted on every route,
  clears the form once `usePathname()` is no longer `/form`. Checked by watching for step 1
  between submit and the trip page: seen 3 of 3 runs before, 0 of 3 after.

Decided at the split:
- **The request carries `countryCode`** (the form already derives it from the country list), since
  `resolvePlace` needs one. The server resolves it and writes the *canonical* place into the prompt,
  so a wrong code fails the resolve rather than misleading the model.
- **Dates are calendar days (`YYYY-MM-DD`)**, taken in the browser's timezone. The form stores local
  midnight as an ISO instant, which a UTC server would read as the day before.
- **The chosen forecast travels as structured days** (`{date, temp, condition, description}`), not
  the JSON dump; branch 4's `get_forecast` replaces it.
- **Choice fields must be one of `src/data`'s values**, and free text is capped. Once the prompt is
  built on the server, an unbounded `type` would be an open channel into it.
- `formData` keeps its lowercasing in 1c. It is what the trip page and the saved row read, and the
  journey spec's cleanup matches the lowercase name. Only the prompt stops lowercasing.

The original 1c scope, which the two sub-branches cover:
- `src/lib/agent/request.ts`: a Zod `TripRequestSchema`, derived from `FormDataSchema` minus `flagUrl`
  and `agreement`, with caps: note ≤ 500 chars, ≤ 10 required items of ≤ 60 chars, ≤ 3 interests.
- `generateTrip` calls `resolvePlace` (1b) again and never trusts the client. Every tool takes these
  coordinates, and the tool description stops asking the model to validate the city.
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
- Read `shared/tool-use-concepts.md` and `typescript/claude-api/tool-use.md` from the claude-api skill
  before writing the call.

#### 1d · `e2e-database-env`: the e2e suite never reads `.env`'s database
Split out of 1a, where it started. **Status: merged (#190).** `.env` points at the production Neon database, and
`npm run test:e2e` runs `npm run start`, which loads it — so a local run needed
`DATABASE_URL` exported by hand. (`.env.production` would not help: `next start` is
production mode and loads it too.)

- `E2E_DATABASE_URL` in `scripts/localDatabase.ts`, defaulting to the local
  `trip-ai-e2e-pg` container at CI's address. It loads the `.env` files as Next does (`@next/env`),
  so the variable can live in `.env.local` like the others. `playwright.config.ts` sets `DATABASE_URL` to it
  for the server and the journey spec; real env beats `.env` files in Next.
- The seed script uses it too, and a new `npm run db:push:e2e` (`scripts/push-e2e.ts`) pushes
  the schema there. Both keep the local-only guard.
- `.env.example` lists every variable; CLAUDE.md gets the one-time `docker run` and the
  push → seed → build → test sequence.
- Only a server the run starts is used (`reuseExistingServer: false`), and the trip journey skips
  under `PLAYWRIGHT_BASE_URL`: with `DATABASE_URL` forced local, its own database check could no
  longer see where a reused or remote server writes (found in review).
- Verified by running the suite with no `DATABASE_URL` exported: the journey spec (which
  skips on a non-local database) runs.

### 2 · `trip-on-server`: the context refactor (server owns the trip)

**Why it's in this plan, not a follow-up:** a generated trip currently lives only in client memory
(TripContext's mutation `data`). Refreshing `/trips/[tripUrl]` loses it, which is why
`useConfirmOnPageExit` exists. Refine (branch 5), the SSE progress (branch 4) and MCP `plan_trip`
(branch 7) all need the trip to exist on the server. Building them on the client-memory trip would
mean writing them twice.

**2a · `trip-schema`: the `Trip` table, audited and reshaped.** First sub-branch of 2, before
the refactor, so the refactor writes the new shape once. The user deletes every current row (local
and Neon) when this lands, so there's no migration or backfill and no column has to stay nullable
for old rows. **Ask before `db push` to Neon.** The seed, fixtures and e2e database change with it.

Audit of every column (who writes it, who reads it), after #200:
- **Drop, never read or written by the app any more:**
  - `age` and `nationality`: replaced by `ageRanges` and `passport` in 1a. Only
    `FormDetailsSection` still shows them, for old rows; those rows and labels go.
  - `image`, `image2` … `image5`: replaced by `tripImages` (below).
- **Reshape:**
  - **`tripImages String[]`** replaces the five image columns, in the order shown. Today
    `fetchTripImage` picks `results[0, 5, 2, 3, 4]` (`results[1]` is never shown); it now returns
    the first five in order. `ImageDataTypes`, `imageDataFixture` and the five sections that each
    read one column (`TitleSection`, `DescriptionSection`, `PhotoSection`, `FormDetailsSection`,
    `FinalSection`) read `tripImages[i]`, as do `HeroDeck` and `SavedTripsDisplay` (`[0]`).
    `placeholder` stays: it is the blur of `tripImages[0]`. Today discard doesn't write it, so it
    is written on every row.
  - **`weatherForecast String?` becomes `byWeather Boolean @default(false)`.** It holds the whole
    40-entry forecast as a JSON string, but `TitleSection`, `FormDetailsSection` and
    `PackReadySection` only test whether it's set ("planned around the weather"). The forecast
    shown on the page is fetched live (below).
  - **`requiredItems Json?` becomes `String[]`.** It is always a list of strings
    (`transformInputsToFinalData`).
  - **`flagUrl` goes, replaced by `countryCode`** (below). It has always been
    `https://flagcdn.com/<code>.svg`, so the page builds it from the code; `countryCodeFromFlag`
    goes with it.
- **Tighten, now that no old row needs the slack:**
  - `travellers`, `pace`, `title` and `description` become required. `passport` stays optional,
    by design.
  - `tripUrl` gets `@unique`: `getTripByUrl` looks rows up by it.
  - An index on `(saved, createdAt)` for the landing's newest saved trips and `/saved-trips`.
  - `relationMode = "prisma"` goes. It was for PlanetScale, and this is Postgres on Neon, so branch
    3's `Generation` → `Trip` relation can be a real foreign key.
- **Add**, as already planned above: `countryCode` (ISO, as `resolvePlace` returns it, `GB-SCT`
  for a UK nation), `lat` and `lng` (`Float`), all required.
- **Keep as they are:** `userName`, `ageRanges`, `type`, `city`, `country`, the dates,
  `luggageSize`, `accommodation`, `transport`, `budget`, `interests`, `note`, `agreement`, `saved`, the model's
  output (`objectsList` and `tours` as `Json`, `mustHave`, `tip`), `createdAt` and `updatedAt`.
  `updatedAt` is unread today, but `setTripSaved` makes it the save time.

Bridge for the refactor to remove: until the server writes the row, `useCreateTrip` still builds
it in the browser, now field by field in `toTripRow` (`src/lib/tripRow.ts`): spreading the form
handed Prisma keys it has no column for. `countryCode`, `lat`, `lng` and `byWeather` can't be read
from `cityCheck.place` and `isWeatherSelected` at save time, as first planned: the form resets once
the traveller leaves `/form`, before the save. `processForm` keeps them in `formData` instead
(`FinalDataTypes`), and the refactor drops them with `formData`.

**Status: merged (#202).** Also in it: `flagUrl` and
`weatherForecast` leave the form schema (they only fed the columns), `flagUrl(code)` replaces
`countryCodeFromFlag`, the age/nationality rows and labels go, a discarded trip now writes its
blur too, and blank required items are dropped from the row. The local e2e database was reset
and reseeded on the new shape. Neon was cleared and pushed when it merged. `prisma/migrations` (last one April 2024) is stale: the project
uses `db push`, so it is left alone here.

The rest of 2 (the server-owned trip) builds on this shape, in four sub-branches, each green on
its own, in this order (2f is independent and can land any time):

- **2b · `trip-write`: generation writes the row; save and discard flip a flag.**
  `generateTrip` makes the `tripUrl`, fetches the photos (searching GeoNames' name for the place,
  finding 4), writes the row (`saved: false`) from the checked request, the resolved place and the
  model's output, and returns it. `setTripSaved(tripUrl, saved)` replaces `createTripInDB` on the
  client (finding 1); `toTripRow` moves to the server and builds from the request. `ImageContext`,
  `useImage` and the form's photo fetch go; `fetchTripImage` stops being a server action.
  *Bridge for 2c:* `TripContext` keeps the returned row as `tripData`, so the generated route's
  sections read photos from it, and still read the form's fields from `formData`.
  **Status: merged (#203).** As built: the photo search runs
  alongside the model call, and a failed search writes the trip without photos; `setTripSaved`
  only touches a row still unsaved (a saved trip can't be unsaved by its url) and checks the url's
  format first. `useCreateTrip` became `useSaveTrip`. The row keeps the old storage (name, city,
  note and items lowercased; `agreement: true`, since the request leaves it out on purpose), and
  its dates are calendar days at UTC midnight, so the sections now read row dates in UTC, the
  generated route's included. `formData` and its 2a bridge fields stay until 2c.
  From its review: rows saved between #202's deploy and this merge hold local-midnight dates
  and would read a day early in UTC; the user deletes them. Left for 2c: the generated route
  still reads `byWeather` from the form, so a weather trip whose forecast failed says "Planned
  by the forecast" until saved, then not (the row has `false`); reading it from the row fixes it.
- **2c · `trip-page-server`: both trip routes render the row on the server.** `getTripByUrl`;
  `/trips/[tripUrl]` and `/saved-trips/[id]` read the row and pass `trip` to `TripPage`, whose
  sections take props: no dual-source reads, no `formData` on the trip page. Saved state comes from
  the row. `TripResponse`, `useSingleSavedTrip`, `useConfirmOnPageExit` and `TripContext`'s
  `tripData` go; a refresh keeps the trip (e2e). *Bridge for 2d:* the weather sections stay client
  components fetching by `{ city, countryCode }` off the `trip` prop.
  **Status: done on `trip-page-server`, staged, not committed.** As built: every section but
  the weather two and the closings is a server component taking `trip`; those four are client
  components and get only their fields (`WeatherSection`/`ForecastSection` the place,
  `SaveSection` url, flag, fifth photo, blur and tip, `FinalSection` the last three). Saved
  state is `trip.saved || isAnswered` (the mutation's success); a discarded row is still
  unsaved, so after a refresh it asks again and yes still saves it. `getTripByUrl` and
  `getSingleSavedTrip` take the route's string and return null for one they could never
  match (a non-numeric or out-of-range id was a Prisma error, so a 500). Both routes got a
  `loading.tsx` (the squiggle `Loader`, as before); its streamed shell means `notFound()`
  answers 200 with the not-found UI, as the client `notFound()` did. `useConfirmOnPageExit`
  stays, without context, for `LoaderResponseAI` only: leaving mid-generation loses the
  redirect. `TripContext` keeps only the generation mutation. Nothing reads `formData` now,
  so 2e removes it and its 2a bridge fields. Tests: `getTripByUrl`/`getSingleSavedTrip` in
  `actions.test`, sections and closings rendered with props, a `TripPage` test; e2e: a
  refresh keeps a generated trip, a saved one comes back answered, unknown trip url and
  non-numeric saved id show their not-found pages.
- **2d · `weather-by-coords`: the place, resolved once.** `fetchWeather`/`fetchForecast` take
  `{ lat, lon }` and never call `resolvePlace`; the trip page fetches both on the server from the
  row (short `revalidate`); the form's forecast uses `cityCheck.place`. `WeatherContext` shrinks
  to the form's forecast.
  **Status: done on `weather-by-coords`, PR #208.** As built: `TripPage` calls
  `loadWeather(trip)`, which starts both fetches (not awaited) and hands the promises to the
  weather sections. They stay client components, show their heading at once and read the data
  with `use()` inside their own `<Suspense>` (the squiggle as fallback), so the page streams
  rather than waiting on OpenWeather. Neither promise rejects: a failure is `null` weather or no
  days, each logged, and the section says it isn't available. Icons are picked on the server.
  `fetch` keeps a reading 600s (`next.revalidate`). Both functions check the coordinates are in
  range with zod before building the URL, since the form's reach them through an action. The form fetches
  the forecast only with `cityCheck.place` set, which Next already requires past step 2.
  `src/test/trip.tsx` (the weather-context override) went. Tests: the API and context at
  coordinates, `loadWeather` (coordinates, icons, failure), the sections with resolved and
  pending promises (rendered in an awaited `act`, which React 19 needs for `use()`), `TripPage`
  fetching at the row's coordinates; e2e: a saved trip's page streams in the fixture weather
  and five forecast days.
  From the wrap-up, also in this branch: `placeWeatherIcons` picked sun or moon for a clear sky
  by the clock of the machine running it (the browser's, then the server's, UTC on Vercel); it
  now reads OpenWeather's icon code (`01d`/`01n`), day or night at the destination. And
  `openWeatherApi.ts` is no longer `"use server"`, so `fetchWeather` has no public endpoint;
  the form's forecast goes through a one-function action, `forecastForForm` (`forecastAction.ts`).
  From its review: the forecast cards named each day in the renderer's zone, and they now render
  on the server (UTC) and hydrate in the browser, so the names could disagree. `fetchForecast`
  gives each reading the response's `city.timezone`, and the card names the day in the
  destination's time, as the weather card already did.
- **2e · the providers leave the app root — split 2e-a, 2e-b, 2e-c, 2e-d.** Born of an audit of the
  three contexts. Cost found: all three providers wrap every route but only `/form` reads them,
  so `FormProvider` runs `useForm`/`useFieldArray`/`useGeoNames` everywhere and `useCountries`
  does a raw, uncached `fetch("https://flagcdn.com/en/codes.json")` on every page load; and the
  `FormContext` value is a new 23-field object each render, so all 13 `useFormData()` consumers
  re-render on every city keystroke (`cityCheck`, the provider-level `watch`). `TripContext` and
  `WeatherContext` are thin `useMutation` wrappers that change only on mutation status — fine.
  - **2e-a · `form-scoped`: the providers move to `src/app/form/layout.tsx`.** `providers.tsx`
    keeps QueryClient, MotionProvider and Toaster. The `clearOnLeave`/`reset()` effect goes, since
    the provider unmounting resets the state — check the empty-step-1 flash during `router.replace`
    does not come back. `useCountries` becomes a TanStack Query (`staleTime: Infinity`), so the
    flagcdn call is made once and only on `/form`. Biggest win; ships first.
    **Status: done on `form-scoped`, staged, not committed.** As built: `src/app/form/layout.tsx`
    renders `FormProviders` (`form/providers.tsx`: Weather, Trip, Form); the root keeps
    QueryClient, MotionProvider and Toaster. With `clearOnLeave` gone, so is the per-call
    `onSuccess` on `generateResponseAI` that only it used. `useCountries` is a query
    (`staleTime` and `gcTime: Infinity`), one request for its three readers, kept across visits
    to `/form` in a session; a failed request retries once (TanStack's three kept the country
    fields disabled for ~7s), each failure logged.
    Behaviour change: leaving `/form` mid-fill and coming back starts a fresh form (it used to
    keep the answers). Checked in the browser: submit → loader → trip page draws no form step
    in between. Tests: the layout provides the form and the root doesn't (nor fetches
    flagcdn), a remount starts fresh, `useCountries` asks once across readers and remounts;
    e2e: no flagcdn request on `/` or `/about`, and "New trip" after a saved trip is an empty
    step 1.
    From its review: leaving `/form` mid-generation remounted an empty form that could send a
    second trip, while the first still redirected on landing. The mutation is keyed
    (`generateTripKey`) and `Form` shows the loader while `useIsMutating` finds one running, so
    coming back mid-generation shows the loader; that survives 2e-c's `useTripGeneration`.
  - **2e-b · `form-context-split`: stop re-rendering everything on a keystroke.** Memoise the
    value and split it into steps (`currentStep, delta, stepValue, next, prev`), rhf (`control,
    errors, fields, append/insert/remove, setValue, handleSubmit`) and city (`cityCheck,
    cityWatch, countryCode`) — or read the city with `useWatch` in Step 2 and `FormButtons` only.
    `reviewFormData = getValues()` becomes a reactive read. `defaultFormData` and `useForm`'s
    defaults are one object (they differ today: `interests: [""]` vs `[]`). Measure commits on the
    city field before and after.
  - **2e-c · `form-state-dead`: what nothing reads goes.** `formData`/`setFormData`/
    `FinalDataTypes`; `TripContext` becomes `useTripGeneration`; the form's forecast becomes a
    form-local hook (`WeatherContext` goes). CLAUDE.md's architecture section is rewritten.
  - **2e-d · `form-draft`: the answers survive leaving `/form`, and "Start over" clears them.**
    Since 2e-a, a nav link mid-form loses the answers (the layout unmounts); a reload always did.
    The answers (RHF values), the step and the weather choice are saved to `sessionStorage` as they
    change and restored when `/form` mounts. The draft clears when a trip comes back (before the
    redirect) and with the tab; a failed generation keeps it, as today. A draft that survives
    leaves no way to start afresh, so the same branch adds **"Start over"**: a quiet button beside
    Back in `FormButtons`, shown once the form is dirty or past step 1, behind a **confirm dialog**
    ("Clear your answers?"). Confirming runs `reset(defaultFormData)`, step 0, the weather choice
    off, and removes the draft; the city check follows the empty city. Tests: a remount restores
    the answers and step; a successful trip clears the draft and a failed one keeps it; "Start
    over" asks, cancel keeps everything, confirm clears the form and the storage. e2e: fill two
    steps, go to About and back, the answers are there; start over, step 1 is empty. After 2e-b,
    which reshapes the context this hooks into; independent of 2e-c.
  - **Zustand: evaluated, not adopted.** react-hook-form owns the form state (uncontrolled,
    ref-based) and TanStack Query owns the server state; a store would mirror RHF's. What is left
    is `currentStep`, `prevStep` and `isWeatherSelected`. Revisit only for a draft that survives a
    refresh, or form state read across routes. (2e-d's draft is `sessionStorage` beside RHF, not a store.)
- **2f · `request-checks`: findings 2 and 3.** Passport checked with `oneOf` against the
  countries; required items refuse line breaks, on the server and the form.
- **2g · dependencies: Renovate keeps them current, a branch each for the breaking ones.**
  Evaluated: both. Nothing prompts an update today (no Dependabot or Renovate config), and
  `npm outdated` shows the lockfile behind — `next` 16.2.6 → 16.4.1, `react` 19.2.6 → 19.3.1,
  `@heroui/react` 3.0.5 → 3.2.6, `react-hook-form` 7.76 → 7.90, TanStack Query, Tailwind. CI
  (typecheck, build, unit, e2e) is what makes automated PRs safe to merge. Breaking bumps need
  code, not a merge button: Prisma 5 → 7, `@hookform/resolvers` 3 → 5 (tied to zod),
  `@anthropic-ai/sdk` 0.100 → 0.134 (pre-1.0, touches `anthropicApi.ts`), `framer-motion` 12 → 14,
  `react-day-picker` 9 → 10, `eslint` 9 → 10 (lint is already broken, so parked with it).
  - **2g-a · `deps-minor`: clear the backlog by hand.** Every non-major bump in one PR, so
    Renovate's first PR isn't enormous. Run `deps-safe`; green is `npx next typegen && npx tsc
    --noEmit`, `npm test`, `npm run build`, `npm run test:e2e`; browser-check `/form`, a trip
    page and `/saved-trips` (design-notes' gotchas on HeroUI and Tailwind bumps). Split off
    `next`, `react`/`react-dom` + their `@types`, and `@heroui/react` if one breaks.
  - **2g-b · `renovate`: `renovate.json`.** One weekly PR for all non-major bumps; separate PRs for
    `next`, `react`/`react-dom` + `@types`, `@heroui/react`, `@anthropic-ai/sdk`, `prisma` +
    `@prisma/client`; majors held behind the dependency dashboard until approved; security
    updates immediately; GitHub Actions versions included. Installing the Renovate app and
    the repository's branch protection are outward-facing — ask first. Bot PRs run the same four
    required checks (e2e needs no secrets). Merged by hand after a look at the diff; no automerge.
  - **2g-c… · the majors, one branch each, by request, in this order:** `@anthropic-ai/sdk`
    (touches the agent, so it goes before 3–7 build on it), `@hookform/resolvers` with zod,
    `framer-motion`, `react-day-picker`, Prisma 7 (schema, client generation, the Neon
    adapter, the e2e push script). Each: plan note on what changed, tests with the change.
  - Order: 2g-a → 2g-b → majors. Independent of 2e/2f and of branches 3–7, except that the SDK
    major should land before 3.
- **2h · `readme-phase-2`: the README, caught up.** Review `README.md` against phases 1 and 2:
  the server-owned trip (refresh keeps it, save/discard), the new form fields and city check,
  weather by coordinates, the form-scoped providers, architecture and commands. Retake the
  screenshots that changed at the sizes above.

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
- **The place, resolved once** (from the phase 1 wrap-up's review). The row stores the resolved
  place: `countryCode`, `lat`, `lng` (added in 2a).
  `fetchForecast` and `fetchWeather` take `{ lat, lon }` and never call `resolvePlace`; the page
  fetches both from the row's coordinates in one server pass. The form's forecast uses
  `cityCheck.place`, which step 2 already resolved. `countryCodeFromFlag` goes. Result: one
  GeoNames call per spelling on the form, one in `generateTrip`, none on any trip page.
  No backfill: every current row is deleted before 2a's schema lands (see below), so the
  columns are required and there's no fallback geocoding.
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

From the input audit (after #197; finding 5 was fixed in phase 1, see branch 1):
1. **Saving checks nothing (high).** `createTripInDB` writes the whole client-built row, so a direct
   call skips every limit. `setTripSaved(tripUrl, saved)` above replaces it; `createTripInDB` stays
   server-only.
2. **Passport is free text in the trusted facts (medium).** The request schema caps it at 100
   characters on one line but doesn't check it against the country list. Check it with `oneOf`
   against the countries, like the choice fields.
3. **Required items allow line breaks (low).** One can fake a second line inside
   `<traveller_note>`. Refuse them on the server as the name does, and on the form to match. The
   note keeps its line breaks.
4. **The image search takes the raw city (low).** `fetchTripImage` is its own server action with
   no cap. It moves inside generation here, so search with GeoNames' name for the place.

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
- README wrap-up (see Branches), in this phase's last branch.

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
- Streaming: the loop moves to a route handler, `src/app/api/trip/route.ts`, which sends SSE events
  (`step` "Checking the weather in Lisbon…", `done` trip, `error`), with `maxDuration = 300` in
  `vercel.json` for that route. `LoaderResponseAI` shows the real steps in place of the canned ones.
- Trip page: each tour card shows its address and a "map" link; a Sources section; an entry-requirements
  card. Read `docs/design-notes.md` first.
- e2e: the fixture path (`E2E_FIXTURES=1`) returns a fixture stream with the new fields.
- README wrap-up (see Branches), in this phase's last branch.

### 5 · `agent-refine`: change the trip from the trip page
- `refineTrip({ trip, instruction })` is stateless: the current trip JSON plus the request go to the
  same loop and tools, and a revised trip comes back through `submit_trip`. No conversation history is
  stored, which avoids replaying thinking blocks. The revised trip overwrites the `Trip` row
  (from branch 2) and the page calls `router.refresh()`.
- UI: a text field and button below the tours ("Swap something, add a rainy-day option…"), at most
  5 refinements per trip, with the SSE progress. Logged as `kind: refine`.
- Tests: the route validates the instruction (length, presence); a component test for the box; an e2e
  test on the fixture path.
- README wrap-up (see Branches), in this phase's last branch. Shots of the live progress loader and the trip's places and sources.

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
- README wrap-up (see Branches), in this phase's last branch.

### 7 · `agent-mcp`: trip-ai as an MCP server
- `src/app/api/mcp/route.ts` using `@modelcontextprotocol/sdk` (Streamable HTTP), with tools
  `plan_trip` (calls `generateTrip`, logged as `kind: mcp`), `list_saved_trips` and `get_saved_trip`
  (reusing `getSavedTripsPage` and `getSingleSavedTrip` from `src/db/actions.ts`).
- Bearer-token auth (`MCP_TOKEN`), since `plan_trip` spends money, and the same rate limit.
- README: how to add it to Claude Desktop / Claude Code.
- Later, not in this plan: connect remote MCP servers to the agent (Messages API MCP connector, beta
  `mcp-client-2025-11-20`) once there's one worth using.
- README wrap-up (see Branches), in this phase's last branch. Also the final pass: the feature list and stack matched to what shipped, MCP setup.

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
