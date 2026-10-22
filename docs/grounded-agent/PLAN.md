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
Phase 2 gets its own last branch, 2j, which also catches up anything from phase 1 the README
doesn't yet say.
- Screenshots come from the Playwright MCP tools, saved in `public/screenshots/`, named
  `desktop-<page>[-<step>].png` / `mobile-<page>[-<step>].png`.
- **Laptop shots are all one size: a 1440 × 900 viewport, viewport capture, never full-page**,
  so every desktop image is 1440 × 900. (Today's set varies from 668 to 1196 px tall; retake
  those the phase touches; the rest in 2j.)
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
- `submit_trip` returned `tours` as a string despite `strict: true` (seen in dev, 2026-10-15:
  "Expected array, received string"), so the trip failed with "invalid trip". Fixed in 2f.


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
  the JSON dump; 2e-e fetches it on the server instead, and branch 4's `get_forecast` replaces that.
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
its own, in this order (2h is independent and can land any time):

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
    **Status: done on `form-context-split`, staged, not committed.** As built: three memoised
    contexts, `FormStepsContext`, `FormFieldsContext` and `CityCheckContext`, read with
    `useFormSteps`, `useFormFields` and `useCityCheck`; `useFormData` (all three) stays for test
    probes. `cityWatch` and `reviewFormData` left the context: nothing read the first, and
    `ReviewForm` reads the answers with `useWatch`. The provider reads the city and country with
    `useWatch`, not `watch`: a root `watch` hands `useForm`'s host a new `formState` per keystroke.
    The fields memo keys on `formState`, not `errors`, which RHF edits in place. The shared
    defaults keep `interests: []`, `useForm`'s; `useCountries` returns one empty list while loading.
    Measured (`FormContext.renders.test.tsx`, a Profiler per component, typing "Lisbon"): the
    progress bar and step 1 rendered 10 times each before, 0 after; step 2, 11 both ways, its
    field included. Checked in the browser: the city check, the review after a change two steps
    back, 390 with reduced motion, no console errors.
  - **2e-c · `form-state-dead`: what nothing reads goes.** `formData`/`setFormData`/
    `FinalDataTypes`; `TripContext` becomes `useTripGeneration`; the form's forecast becomes a
    form-local hook (`WeatherContext` goes). CLAUDE.md's architecture section is rewritten.
    **Status: merged (#212).** As built: `FormProvider` is
    the only provider, rendered by `form/layout.tsx` (`form/providers.tsx` goes). It runs
    `useTripGeneration` (the keyed mutation; returns `generate`, `isPending`, `error`, `reset`)
    and `useFormForecast` (`forecastData`, `generateForecast`), both in `src/hooks/`; `Form`
    reads the generation's pending, error and reset as `isGenerationPending`, `generationError`
    and `resetGeneration` from the fields context. Gone: `formData`/`setFormData`, the
    lowercasing `processForm` did for it, `FinalDataTypes`, `transformInputsToFinalData`
    (`lib/formData.ts`), `finalFormData`, the forecast's unread pending/error, and the unused
    `FetchResponseAIParams`. Behaviour unchanged. One test note: with no `setFormData`
    re-render, a `processForm` called directly shows the loader on TanStack's next notify, so
    `FormPending.test` waits for it; a real submit re-renders through RHF's `formState`.
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
    **Status: merged (#213).** As built: `src/lib/formDraft.ts`
    reads, writes and clears `{ values, step, isWeatherSelected }` under one sessionStorage key,
    every access in a try (a lost draft is a fresh form). `FormProvider` restores it in an effect
    after mount, not in `useForm`'s defaults (the server has no storage, so that would hydrate a
    different form), with `keepDefaultValues` so `isDirty` still measures against the empty form;
    `Form` keeps the card `invisible` until then, so step 1 doesn't flash first. A
    `FormDraftSaver` child writes it, watching every field without re-rendering the provider
    (2e-b's render test still reads 0); an untouched form removes it rather than saving it.
    `useTripGeneration`'s `onSuccess` clears it before the redirect. "Start over" (`StartOver.tsx`)
    is a quiet text button beside Back, on its own row below the pills at 390, shown when
    `useFormState`'s `isDirty` or past step 1 — read in `FormButtons`, not the context, so its
    flip doesn't re-render the form. The confirm is HeroUI's `AlertDialog`, opened by a plain
    button (its `Trigger` is a `role="button"` div); Escape and a click outside cancel; on
    confirm focus goes to the name field, since the button that opened it is gone.
    Found in the browser: a draft restored past step 2 re-checks its city, and step 2's
    announce effect (above its early return) toasted "Found Lisbon" on step 3; a find is now
    announced only on step 2, while a failure still toasts on any step, since it keeps Next off
    (from the review). From the second review: a draft restored a day later held a start date
    the schema now refuses, so "Plan my trip" stayed off on the review step with nothing saying
    why. `resumeStep` (`formDraft.ts`) reopens on the first step before the saved one whose
    answers fail, and the provider `trigger`s them so the error shows; a weather plan's dates
    are reset to now first (`weatherDates`, `lib/utils.ts`, shared with step 5's checkbox). The
    storage key is versioned (`trip-ai:form-draft:v1`): bump it when `Inputs` changes shape, so
    an older build's draft in an open tab is dropped rather than restored unrenderable.
    Known, closed by 2e-e: a draft restored past the dates step with the
    weather on has no forecast (the form fetched it on Next), so that trip goes without one.
    Tests: `formDraft.test` (round trip, malformed, throwing storage); the layout restores on
    remount and starts empty without a draft; success clears and failure keeps it
    (`useTripGeneration.test`); `StartOver.test` (restored step and answers, saving as you type,
    no "Found" toast off step 2 but a failure's, the button's visibility, cancel keeps, confirm clears and focuses).
    `src/test/setup.ts` clears sessionStorage after each test. e2e (`form.spec`, at 390): two
    steps, About through the menu, Back: the answers and step are there; start over → empty
    step 1, and still empty after a reload.
  - **Zustand: evaluated, not adopted.** react-hook-form owns the form state (uncontrolled,
    ref-based) and TanStack Query owns the server state; a store would mirror RHF's. What is left
    is `currentStep`, `prevStep` and `isWeatherSelected`. Revisit only for a draft that survives a
    refresh, or form state read across routes. (2e-d's draft is `sessionStorage` beside RHF, not a store.)
- **2e-e · `server-forecast`: the request says "by the weather"; the server fetches it.** Born of
  2e-c's review. The form fetches the forecast only to send it back in the request; nothing on the
  form shows it. What that costs today:
  - **The prompt takes the browser's word.** `TripRequestSchema` checks the forecast days' shape,
    not where they came from, so a crafted request puts any "forecast" into the prompt.
  - **A missing forecast is silent.** If the dates step's fetch fails, or hasn't landed by the
    submit, the trip goes out with none, and `byWeather` records `false` for a traveller who asked.
  - **The daily readings are picked by the browser's hour** (`getChosenHour()`), not the
    destination's.

  The change: `TripRequest.forecast` becomes `byWeather: boolean`. `generateTrip` fetches the
  forecast at the place it already resolves, beside the photos and before the model call. It picks
  the daily readings in the destination's time (the response's `city.timezone`, as the trip page's
  cards do) and keeps only the days inside the trip's dates. A failed fetch plans for the usual
  weather, as with no forecast, and the row's `byWeather` records whether one was used. `fetchForecast`'s
  10-minute cache then also serves the trip page's forecast at the same coordinates.
  Gone: `useFormForecast`, `forecastForForm` (`forecastAction.ts`, the browser's only route to
  OpenWeather), the forecast branch in `next()` and its `cityCheck.place` dependency,
  `toTripRequest`'s `forecast` argument and the "Forecast was generated" toast. 2e-d's draft
  keeps the weather choice as it is. Branch 4's `get_forecast` takes the server-side fetch as its
  handler, and the flag becomes "the traveller allowed weather".
  - Tests: the request schema takes the flag and refuses forecast days; `generateTrip` fetches at
    the resolved place only with the flag, keeps the days within the trip, and still writes the
    trip (no forecast, `byWeather: false`) when OpenWeather fails; the day pick in the
    destination's time with the clock pinned; `processForm` sends the flag. e2e: a weather trip
    under `E2E_FIXTURES=1` comes back marked as planned by the forecast.
  - **Status: done on `server-forecast`, staged, not committed.** As built: `tripForecast`
    (`src/lib/agent/forecast.ts`) keeps one reading per trip day, the one nearest 12:00 at the
    destination (each reading's `dt` plus its `timezone`), so a reading late in UTC can still be
    the destination's afternoon; it reads no clock, so its tests pin none. `generateTrip` starts
    the photos, then awaits `forecastFor` (only with `byWeather`; a throw logs and returns no
    days) before the model call; `toTripRow` takes `byWeather` as "a forecast reached the
    prompt", so a traveller who asked but got none is `false`. `buildTripMessage` takes the days
    as a third argument. The request's `byWeather` is required; a `forecast` sent with it is
    stripped by zod, not refused (the result is the same: it never reaches the prompt), and
    `ForecastDaySchema` is gone. Also gone: `SelectedForecastDataTypes`, `ForecastDataTypes`.
    Found on the way: the e2e forecast fixture is dated 2030, so filtering by the trip's dates
    left no days and the journey's "Planned by the forecast" would have failed; under
    `E2E_FIXTURES=1` `fetchForecast` now returns it moved to the last three-hour mark in UTC
    (`forecastFixtureFromNow`), which also keeps the trip page's five forecast cards at any hour.
    Tests: `forecast.test` (Tokyo and Honolulu offsets, the trip's days only, Celsius, empty);
    `generateTrip` — no fetch without the flag, the fetch at the resolved place with only the
    trip's days in the message, OpenWeather failing and no days in range both write
    `byWeather: false`; the request needs the flag and drops a forecast; `processForm` sends
    the flag; `e2eFixtures.test` checked in four time zones. e2e: the journey's existing
    "Planned by the forecast" check now runs through the server's fetch.
  - **Parked, from the review** (neither breaks a trip; pick up with branch 4's `get_forecast`):
    - *An end day can go without a forecast.* The trip's dates are the traveller's calendar
      days; readings are dated by the destination's clock. Planning Tokyo from Los Angeles,
      "today" can already be tomorrow in Tokyo, so the first day finds no reading. Fix: widen
      `tripForecast`'s date filter by a day at each end, or take the dates in the destination's zone.
    - *Half-hour offsets.* `local.hour()` drops the minutes, so at +5:30 "nearest midday" is
      off by 30 minutes, which only decides between two readings that would tie. Fix: measure in
      minutes, `Math.abs(local.hour() * 60 + local.minute() - 720)`.
- **2e-f · `background-generation`: leaving the loader doesn't lose the trip.** From 2e-a's
  review. The loader covers the nav, so the way out mid-generation is the browser's Back, a soft
  navigation: no `beforeunload`, and the generation keeps running with nothing on screen saying so.
  A `GenerationToast` in the root providers reads the keyed mutation (2e-a's `generateTripKey`,
  via `useMutationState`) and, while one is pending off `/form`, shows a persistent toast: "Your
  trip is being planned" with **Stop**. On `/form` there's no toast; the loader shows (2e-a).
  - Arrival: the toast becomes **"Your trip is ready — View"**, everywhere; nobody is moved
    without asking, so a second form or a saved trip being read isn't pulled away. `onSuccess`
    stops redirecting on its own when the traveller is off `/form`; on `/form` it redirects as today.
  - Stop: marks the generation stopped and removes it from the mutation cache; `onSuccess` and
    `onError` check the mark, so a stopped one shows nothing when it lands. Until 2g this is the
    browser only: the server still finishes the call (billed) and writes an unsaved row.
  - Failure while away: the toast becomes the failure message with a link to `/form`, where 2e-d's
    draft restores the answers (closes 2e-a's second-review finding).
  - Reload, closing the tab or a typed URL still end the page's JS, so they keep
    `useConfirmOnPageExit`; the loader says so: "You can keep browsing while we plan it; reloading
    or closing the tab stops it."
  - Tests: the toast off `/form` and not on it; View opens the trip; Stop means nothing on arrival;
    a failure shows the failure toast; the toast at 390 and by keyboard. e2e: submit, Back, the
    toast shows, View opens the trip.
  - **Status: done on `background-generation`, staged, not committed.** One branch, no split:
    a single concern. As built: `GenerationToast` (`ui/`, in the root providers) watches
    `useIsMutating` on `generateTripKey` and `usePathname`; while one is pending off `/form` it
    shows `PlanningToast` under one toast id, and dismisses it on `/form`. The stages
    (`GenerationToasts.tsx`: planning, ready, failed) replace each other in place under that id;
    ready and failed stay until dismissed. `useTripGeneration`'s `onSuccess`/`onError` decide by
    `window.location.pathname`, since the provider that started the call may be unmounted and its
    `usePathname` stale: on `/form`, as before; elsewhere, the ready or failed toast. A trip that
    lands anywhere clears the draft; a failure keeps it, so "Back to the form" reopens the review
    step filled in. `stopGeneration` marks the request (a `WeakSet` keyed by the request object;
    the mutation's own `onSuccess` still runs after removal) and removes the mutation; a stopped
    one keeps its draft. `useConfirmOnPageExit(isActive)` moved from the loader to
    `GenerationToast`, so a reload asks while a generation is pending on any route, not only on
    the loader. The loader carries the plan's note under the message. Copy in
    `form/content.ts` (`generation`).
    Tests: `GenerationToast.test` (planning off `/form`, nothing on it, ready without moving,
    Stop by keyboard then nothing on arrival, `beforeunload` only while pending);
    `useTripGeneration.test` (off `/form`: ready toast, draft cleared, failure toast with the
    draft kept; stopped: nothing on success or failure, draft kept). e2e (journey, 390): `/about`
    → New trip → submit with the POST held → "Browse saved trips" → planning toast with Stop → release → View,
    still on `/saved-trips` → the trip. Checked in the browser at 1440, 768 and 390 with reduced motion:
    planning, ready, failed → back to step 7 with the answers, Stop then a reload that no longer
    asks.
    From review: the loader covers the nav, so the note's "keep browsing" had no way out but the
    browser's Back. The loader now has a quiet "Browse saved trips" link under the note, a soft
    navigation; the e2e leaves through it.
    Changes after the first commit: the planning toast has **View** beside Stop, back to `/form`
    and its loader. Stop replaces it with "Your trip was cancelled" (an alert, 5s). A trip that
    lands says "Your trip has been generated!" everywhere: with View, unless the traveller is on
    that trip's page or is being sent there from `/form`. Off `/form` it stays until dismissed.
    The loader's note reads "You can keep browsing while we plan your trip but reloading or
    closing the tab stops it." Stop marks the request object, so tests send a copy of the shared
    fixture per call. e2e: the planning toast's View reaches the loader, and the journey leaves again.
    From the review of both commits (the two findings about Next queueing server actions were
    refuted in the browser: a search answered in 1s while the generation was held 15s):
    - Accepted, not fixed: the redirect-or-toast choice reads `window.location`, which changes
      only once a navigation commits. A trip landing in the few hundred milliseconds after the
      loader's "Browse saved trips" is clicked still opens the trip. Rare, harmless (the traveller
      lands on their new trip), and a fix meant a module-level flag tying the loader to the hook.
    - The finished trip's toast has its own id (`RESULT_TOAST`): starting the next trip on `/form`
      no longer dismisses it, and a newer result replaces it, so there is one at most. The planning
      card is removed, not dismissed, when the result arrives, so two View links never overlap.
    - The planning toast is shown once per generation, not re-created on each route.
    - Stop marks the generation (a token from `onMutate`), not the request object; the tests'
      copies went. The on-`/form` failure toast reads `failure.message`.
    - The planning toast's Stop button is labelled **Cancel**, matching "Your trip was cancelled";
      the code keeps `stopGeneration`.
    - `ToastCard` (`ui/`) is the one toast card; `CustomToaster` and `ErrorToaster` wrap it,
      without their own fade. (react-hot-toast animates only its built-in toasts; a custom one
      appears and leaves unanimated. A shared fade on `ToastCard` is possible follow-up work.)
    From the third review:
    - A stop in the instant after `mutate`, before TanStack runs its callbacks, still counts: the
      token is created at the call site and sent in the variables (`{ request, token }`), which
      TanStack stores as the call starts. `onMutate` and its guard are gone.
    - Back on `/form`, the planning toast is dismissed, and at once hidden (`opacity-0`) and `inert`
      for react-hot-toast's 1s remove delay, so its Cancel is neither seen nor reached over the
      loader. A dismissed custom toast isn't animated out. (Removing it instead, as first done here, broke
      every later toast: the Toaster pauses on `mouseenter`, and a toast removed under the cursor
      after View gets no `mouseleave`, so "Your trip was cancelled" never left.)
    - The ready toast carries a green check in a message square (`BiMessageSquareCheck`, the
      family of the info and alert glyphs; `ToastCard`'s `success` tone, `sorbet-success`).
    - Accepted, not fixed: a failure after the traveller returned to the loader through View
      shows the review step with the answers restored and the failure toast, not the "Try again"
      panel; the fresh form never ran the call, so it has no error. They submit again from there.
      Fixing it meant reading errors from the shared cache and clearing them on "Try again".
    - Parked as its own branch: screen readers may not announce a toast whose `role="status"`
      region arrives already filled. Every toast is affected (the city check too), and before
      2e-f none had a live region. Fix: one permanent announcement region in the root providers.
    From trying it in the browser:
    - The ready toast has no Dismiss: nothing else links to an unanswered trip, so dismissing it
      lost the trip. It stays until View opens the trip (a newer trip's toast replaces it), and
      closes itself on that trip's page. 2e-g adds a second way back, from `/form`.
    - The loader has **Cancel** beside "Browse saved trips": `Form` stops the generation
      (`stopGeneration`) and resets its own mutation, so the form shows again on the review step
      with the answers, and "Your trip was cancelled" shows. Its trip lands to nothing. With
      nothing pending (a Cancel as the trip lands), `stopGeneration` does nothing and says nothing.
    - The loader and toasts use pills, not quiet text buttons: Cancel and Dismiss lime, the way
      onward (View, Browse saved trips, Back to the form) ink.
    **Rebuilt on one state (from the audit after the fifth review).** Every review found a new
    timing case because five places changed the same toasts, `Form` read two disagreeing
    "pending" flags (its own mutation, and the cache), and a trip's landing ran in a provider that
    might be gone. Rebuilt on this branch. The cards, copy and buttons are as before; what the
    traveller sees change: the loader stays up from a landing on `/form` until the trip's page
    (without Cancel, as nothing is left to cancel), leaving before the redirect offers the trip in
    a toast, a failure comes back to `/form` as the failure panel, and once that panel has shown
    it, its toast doesn't return. The design:
    - **One state, one pure transition function** (`src/lib/generation.ts`): the generation in
      flight (a token, or none) and the last result: `ready` (landed off `/form`, offered by a
      toast), `opening` (landed on `/form`, the traveller on the way: the loader stays up until
      the trip's page, and leaving first turns it `ready`), or `failed` (`seenOnForm` once the
      failure panel showed it, after which its toast doesn't come back). `land` and `fail` carry
      the path the traveller is on, so the redirect-or-toast choice is made as the call settles.
      `start`, `land`, `fail`, `cancel`, `route` and `clearResult` each return the next state and
      its effects, in order (`clearDraft`, `open`, `failedOnForm`, `cancelled`). A landing whose
      token isn't the one in flight changes nothing.
    - **One pure toast function**, `toastsFor(state, pathname)`: planning off `/form` while
      pending; the ready trip except on its page; an unseen failure off `/form`.
    - **`GenerationProvider`** (`src/context/GenerationContext.tsx`, in the root providers, never
      unmounted) holds the state in a zustand store created per provider (a module-level one would be
      shared across server requests and tests), makes the call (no TanStack mutation) and runs the
      effects. Its context is stable: `useTripGeneration()` returns the actions, and readers pick
      state with `useGenerationState(selector)`, so `FormProvider`, which only sends, never
      re-renders on a transition. `GenerationToast` is the only code that
      shows or dismisses the generation's toasts, from `toastsFor`; nothing calls `toast.remove`.
      Cancelled, opened and the on-`/form` failure are timed notices under one id.
    - **`Form` reads that state**: pending or opening shows the loader, failed the failure panel (also after
      coming back through View or "Back to the form"); Cancel and "Try again" are one call each.
    - **`showToast`** (`ToastCard.tsx`) shows every custom toast, the city check's and saving's
      too: a dismissed one is `invisible` and `inert` at once, as react-hot-toast doesn't animate
      a custom toast out and keeps it in the page 1s.
    - Tests: every transition from every state, `isLoading`, and `toastsFor` on every route, as tables; the
      provider's behaviour (redirect, toasts, draft, cancel, failure, reload warning) as before;
      e2e checks the planning card is hidden by visibility, not by the accessibility tree.
    - Still accepted: a trip landing in the moment a navigation away from `/form` is committing
      still opens it (the router's path changes on commit).
    From the review of PR #218:
    - **The generation is a `fetch` to `POST /api/trip`, not a server action.** Next runs server
      actions one at a time, so after Cancel the city check (a server action) waited for the
      cancelled call to finish on the server; checked in the browser: no request in 6s, against
      1s with nothing held. `src/app/api/trip/route.ts` calls `generateTrip` and answers
      `{ tripUrl }`; `requestTrip` (`src/lib/`) sends it with an `AbortController` per
      generation, and `cancel` and a superseding `start` return an `abort` effect. This is the
      transport half of 2g; the server still finishes an aborted call until 2g streams it.
    - The last trip and the last failure have their own slots: a failure no longer displaces a
      `ready` trip, whose toast was the only link to it. Their toasts have their own ids.
    - The reload warning holds while a trip is `opening`, not only while one is in flight.
    - A failure seen on `/form` is dropped on leaving `/form`, so the panel doesn't greet a later visit.
    - `GenerationToast` reads the whole state (it changes only on a transition) through one
      `useToast` per toast; the toast pills share `form/styles.ts`'s pill in a small size; the
      hygiene test forbids every direct `toast(…)` maker, not only `toast.custom`.
    - CLAUDE.md's accepted limits add that a landing read against the old route can bring the
      cleared draft back.
    From the review of the fix commits:
    - The route rejects what a server action would: 415 unless `application/json` (so a
      cross-site page can't send it without a failing preflight) and 403 from another origin.
      It checks the body with `TripRequestSchema` first, so a bad request is a 400, not a 500.
    - `requestTrip` rejects a success without a 12-hex `tripUrl`, rather than open `/trips/undefined`.
    - The reload warning is back to "in flight" only: a prompt can't tell a reload from the
      app's own redirect falling back to a full load (after a deploy), and a landed trip's url
      is 2e-g's to keep across reloads.
    - `TRIP_TOAST`'s id is "trip-generation-trip"; `GenerationToast` keeps each card in a ref, so
      its effects depend on `[id, key]` only.
    From the review of `add921c`:
    - The route answers 403, not a crash, to an opaque `Origin: null`; compares with the first of
      a proxy chain's forwarded hosts, as Next does; takes `application/json` in any case; and
      passes the parsed request on.
    - `TRIP_URL` lives once, in `src/lib/constants.ts`, for `requestTrip` and `db/actions.ts`.
    - The reload rule is `asksBeforeReload` in `generation.ts`, with its own test table, and a
      table in CLAUDE.md beside `isLoading`'s. A reload while a landed trip is `opening` loses its link until 2e-g stores it.
    - The Cancel e2e releases its held request in a `finally`.
    From the review of `18677f6`:
    - An empty `x-forwarded-host` falls back to `host` (`||`), and a request with no host at all
      is refused rather than matching an opaque origin's null.
    - The Cancel e2e lets the held request through before its last two checks again, so they
      catch a cancelled generation's landing; the `finally` stays as a backstop.
    - CLAUDE.md tables the loader and the reload prompt, and notes the route's dependence on no
      `Referrer-Policy: no-referrer`.
    From the review of `ec680d2`:
    - **The origin check is `Sec-Fetch-Site`, not a host comparison.** Comparing `Origin` with
      the host kept failing on proxy layouts, host case, ports, opaque origins and the referrer
      policy. The browser sets `Sec-Fetch-Site` itself (checked: the server receives
      `same-origin` on the app's own request); anything else is a 403, and its absence (no
      browser) passes, as the content type still has to be JSON.
      This reverses `18677f6`'s `Referrer-Policy` note, which no longer applies.
    - The Cancel e2e no longer lets the aborted request through to check a landing, reversing
      `18677f6`'s change: an aborted request can't land, so those checks passed whatever happened.
      A stale landing is pinned by the unit tables and by the provider tests, where a cancelled
      call settles afterwards.
    - Accepted: a browser without Fetch Metadata (Safari before 16.4, older Firefox) isn't
      origin-checked; the JSON preflight still blocks its cross-site requests.
- **2e-g · `one-open-trip`: one unanswered trip at a time, per browser.** From 2e-f's review. **Status: merged (#220).**
  With the result toast capped at one, a traveller could generate trip after trip without ever
  looking at them. Rule: while a trip they generated is unanswered (neither "Yes, save it" nor
  "No, thanks"), this browser can't plan another.
  - **Per browser, not in the database.** There are no accounts, so the server can't tell one
    visitor from another: a database-wide rule would let one abandoned trip block everyone. And
    the database can't tell unanswered from discarded anyway (both are `saved: false`). The open
    trip's url lives in `localStorage` (`trip-ai:open-trip:v1`), every access in a try, as
    `formDraft` does; it survives reloads and tabs. It guides, it doesn't guard: a private window
    gets around it. Protection against spam is branch 3's rate limit, on the server.
  - **Set** when a trip lands, on `/form` or off it: a `rememberTrip` effect of `land` in
    `transition` (`src/lib/generation.ts`, since 2e-f's rebuild), beside `clearDraft`, with its
    rows in the tables and in CLAUDE.md. Never for a cancelled or superseded generation (its
    landing changes nothing) or a failed one. **Cleared** when either answer lands
    (`useSaveTrip`). A saved trip opened later from `/saved-trips` never counts as open.
  - **Closes 2e-f's reload gap.** The reload warning stops once a trip lands, and the draft is
    cleared then; a reload while the trip is `opening`, or after a `ready` trip's toast, used to
    lose its only link. With the url stored at the landing, `/form` offers View after the reload.
  - **On `/form`:** with an open trip stored, "Plan my trip" is disabled and a note beside it
    says to answer that trip first ("Save or discard your last trip before planning another."),
    with a quiet **View** button to `/trips/<url>`. Copy in `form/content.ts`.
  - **Nothing is blocked by a trip that's gone.** On mount, `/form` checks the stored url with
    `getTripByUrl`: no row, or a row already saved, clears it, and the form works as usual.
    Until the check answers, the stored trip counts as open, so the button never flashes on.
    A View link to a deleted trip lands on `/trips/[tripUrl]`'s existing not-found page ("This
    trip is no longer available."). Rows are only deleted outside the app today (by hand, or the
    e2e seed); a future clean-up of old unanswered trips needs nothing more.
  - **The toast cap stays:** one result toast, a newer one replacing it.
  - Tests: the store (round trip, malformed, throwing storage); a landed trip is stored, a
    stopped or failed one isn't; either answer clears it; `/form` with an open trip disables
    "Plan my trip" and shows the note and View; a stored url with no row, or a saved row, is
    cleared and blocks nothing. e2e: generate, go back to `/form` and fill it: the button is off
    and View opens the trip; answer it, and the next trip can be planned.
  - Open question for the build: the note shows on the review step, beside the button. A
    traveller learns of the block only after filling seven steps; showing the note from step 1
    may be kinder. Built as planned, on the review step; the walk's answers stay in the draft,
    so after answering the trip the form reopens on them, ready to send.
  - **Built (2026-10-20).** `src/lib/openTrip.ts` (read, remember, forget-if-it's-this-one, and
    a subscription that also hears other tabs, so answering in one frees `/form` in another);
    `useOpenTrip` (`useSyncExternalStore` plus a TanStack query on `getTripByUrl`, which
    reduces the row to "still open" in the query); the `rememberTrip` effect after `clearDraft`
    on both `land` rows. The note sits on its own row under the pills (beside the button it
    pushed "Plan my trip" to a second row at 1440), and is the button's `aria-describedby`.
    `forgetOpenTrip` clears only the trip it is given, so answering an older trip's page
    doesn't free a newer one. e2e: `walkAllSteps` takes `{ held: true }`.
  - **From the first commit's report (2026-10-21):**
    - **The traveller learns on step 1.** Chosen over disabling Next (a dead form until they
      answer) and a dialog on opening `/form` (an interruption that, once closable, blocks no
      more than a notice). `OpenTripNotice` (`form/`), a lavender card above the progress bar on
      every step: "Your last trip is waiting for an answer…", with a **View trip** pill. Only
      "Plan my trip" is held back, described by the notice; the note under the pills is gone.
      Not a live region: it is there on load, not announced later.
    - **The check reads one flag:** `isTripOpen(tripUrl)` (`db/actions.ts`, `select: { saved:
      true }`), not `getTripByUrl`, which sent the whole row to the browser.
    - `GenerationProvider`'s description no longer says the server finishes an aborted call (2g).
    - Pre-existing and not fixed here: under the full suite, `GenerationContext.test`'s "the
      planning toast is shown once…" fails about 1 run in 5 (and once a `StartOver.test` case),
      on `main` too; each passes alone. Worth its own look.
  - **Review of `f06a15e`**, all four fixed:
    - Two tabs could each plan a trip while the other's was in flight, and the second landing
      replaced the first's url, so the first was untracked. The store is a list now (oldest
      first, a trip once, capped at 10); `useOpenTrip` checks each and offers the newest still
      open, then the next once that's answered.
    - The notice promised kept answers, but the draft is per tab: it says "Your answers stay in
      this tab." now.
    - The check no longer refetches on window focus: answers happen in this browser, and other
      tabs are heard through the `storage` event.
    - The Cancel e2e's city-check probe matches the action by its "Porto" argument, as the
      open-trip check also posts to `/form`.
    - Seen once in the e2e runs, and passing on rerun: `saved-trips.spec`'s "the detail page
      streams in the weather" (not touched here).
- **2f · `fix-string-tours`: a list sent as a string no longer loses the trip; longer tours.**
  The bug parked under branch 1, seen twice now (2026-10-15 and 2026-10-16, in dev): despite
  `strict: true`, `submit_trip` sometimes sends `tours` as its JSON text, so `TripDataSchema`
  refuses it and the traveller gets "invalid trip". A guard before the schema,
  `parseListFields` (`src/lib/agent/submitTrip.ts`): each list field (`objectsList`,
  `mustHave`, `tours`) that is a string parsing to an array is replaced by that array, and
  `generateTrip` logs which fields it parsed. Anything else stays as it came, so prose, broken
  JSON or a JSON object in a list field still fails. In the same branch, since it is the same
  output: tours came back under 90 words against the asked 100 to 120. 120 to 140 came back
  at 121 to 129 but made the tours carousel 910px tall at 390, over the screen, with its arrows
  scrolled away; the prompt and the tool's description ask for **110 to 130**. Measured over 8
  real trips (40 tours): 108 to 125 words, the carousel 849px at 390.
  - Real runs (local database, real APIs, 2026-10-16): 1 failure in the first 2 (at 120 to
    140; the guard's warning did not fire, so the string was not a JSON list), then 8 of 8
    fine at 110 to 130, none with a list sent as a string. A temporary log in `generateTrip`
    stays until a failure is caught: for a list field that came as a string, its length, why
    `JSON.parse` refused it, and the raw value (`DIAG` in the server log, dev or Vercel). Then a
    branch fixes the bug from that string and removes the log.
  - Tests first: `generateTrip` writes the trip when any of the three lists arrives as a JSON
    string, and logs it; prose and a JSON object in `tours` still fail. `parseListFields` on its
    own: lists left alone, broken JSON and prose left as strings, other fields untouched,
    non-object input passed through. The prompt test and snapshot carry the new count.
  - Sonnet 5.5 against Opus 5.5 on the same trip (cost, output, recommendation): `models-comparison.md`.
- **2g · `trip-route`: a cancelled generation stops on the server.** Since 2e-f (PR #218) the
  form calls `POST /api/trip` with a `fetch` it aborts on Cancel, but the server still finishes
  the call: the whole output is billed, the photos fetched and the row written. 2g passes the
  abort on. Scoped down on 2026-10-20, after #218: the JSON response stays (`{ tripUrl }`, or an
  error status), and server-sent events (`done`/`error`/`step`) move to branch 4, which needs
  them for its steps.
  1. The route passes its `request.signal` into `generateTrip`.
  2. The Claude call is streamed (`client.messages.stream(...)`, read with `finalMessage()`) and
     takes the signal: output not yet written isn't billed (input is, as it's read at the start).
  3. Once aborted, nothing more starts and no row is written: `generateTrip` checks the signal
     before `resolvePlace`, after it (before the photos), after the forecast (before the model)
     and after the photos (before the write). An abort during the insert itself still leaves its
     unsaved row, as any unanswered trip is. Every abort rejects with the signal's reason (the
     SDK's `APIUserAbortError` is swapped for it), and the route stays silent only for that
     error, so a real failure landing as the client goes is still logged. GeoNames, OpenWeather and Unsplash don't take the signal:
     they're quick, unbilled, and OpenWeather's fetch is cached.
  4. `generateTrip` leaves the `"use server"` file, so `/api/trip` is the only way in from the
     browser. The agent (request → trip row) is a function the route calls, and MCP (branch 7)
     and evals (6) call it directly.
  - **Prove the abort first.** Before anything relies on it: a failing e2e (Cancel → no row
    written for that request) shows that `request.signal` aborts when the client disconnects from
    Next's route handler, under `npm run start`. If it doesn't, stop and rethink before building.
  - **The browser keeps its plain "(500)".** The cause stays in the server log, which on Vercel
    is enough to find it (it was, for a production failure on 2026-10-20); no reason codes in the
    response. Branch 3 records every outcome durably, since runtime logs are kept briefly.
  - `maxDuration = 300` on the route, over `vercel.json`'s 60s: Sonnet 5.5 took 38–69s over 8
    runs (`models-comparison.md`). The first deploy failed with it ("between 1 and 60 for plan
    hobby"), as the project ran without Fluid compute; Fluid is on since 2026-10-20, which allows
    300s on Hobby.
  - The browser no longer logs a failed generation (`GenerationContext`): it only ever saw
    "(500)". The route doesn't log a cancelled one either.
  - **Built (2026-10-20):** the proof first (the e2e failed with a row written, then passed once
    the route handed on `request.signal`), then 1–4 with their unit tests. The e2e fixture trip
    now takes 2 seconds (`E2E_TRIP_HOLD_MS`) and stops on the signal, so a Cancel lands mid-call.
  - **Review of `33055c0`**, fixed: the route logged nothing for any failure while the signal
    was aborted (now only for the abort itself); "writes nothing" overpromised for an abort
    during the insert (the docs say so now); an already-aborted request still looked up the
    city (checked first now); the e2e's fixed wait could pass on a slow runner (a control trip,
    started after the cancel in a second tab, has to land first; it fails with the abort
    removed); the route tests' requests go through `post()`. Left as is: a failure that never
    reaches the server (offline, a malformed 200) is now logged nowhere, as the browser's
    console was only ever the traveller's; the 2s hold on every e2e generation; no
    `server-only` guard (the package isn't installed); `maxDuration` 300 (wrongly at
    first: it failed the Hobby deploy until Fluid compute was on, see above).
  - **Review of `8fc3831`**, fixed: a cancel during a city lookup that then failed was logged as
    a failure (the signal is checked before the lookup's error now). Left as is, by choice: the
    rest were about whether a rare cancel prints a log line (an abort the SDK reports otherwise,
    a wrapped abort), the fixture's handling of an already-aborted signal (the caller checks
    first), and nits (the docblock's fourth line, the mock `APIError`'s constructor, an export,
    the control's full form walk). No trip, row or bill depends on them.
  - Tests: an aborted signal aborts the SDK stream (mocked at the SDK) and writes no row nor waits
    on the photos; a signal aborted before the call never starts it; the route hands its
    `request.signal` on; the existing failures (refusal, `max_tokens`, no call, invalid trip) still
    throw from the stream's final message. e2e: Cancel leaves no row (the fixture path,
    `E2E_FIXTURES=1`, waits on the signal so a Cancel lands mid-call).
- **2e-h · a refactor audit after 2e-g.** Found nothing worth refactoring, so no branch.
- **2h · findings 2 and 3: the passport is a listed country; required items stay on one line —
  split 2h-a, 2h-b.** The country list is fetched in the browser today (`useCountries`, from
  flagcdn's `codes.json`), so the server has nothing to check the passport against. Fetching it
  on the server too would make every generation depend on flagcdn; the list is bundled instead,
  as one source for the form and the server. That move touches every test that mocks
  `useCountries`, so it is its own branch, first.
  - **2h-a · `bundled-countries`: the country list ships with the app.** `src/data/countries.ts`
    holds flagcdn's list as of the branch (306 codes, less the 50 US states, the EU and the UN:
    254, the UK's nations kept), as `Country[]` sorted by name, built by the filter
    `fetchCountries` runs now. `useCountries` and its query go; `CountryComboBox` and
    `FormContext` import the list, so the country fields are never disabled while it loads and
    the form works when flagcdn is down (the flags themselves still come from it). Tests that
    mock `useCountries` or flagcdn drop the mock; `useCountries.test.tsx` becomes a test of the
    data: no `us-` codes, EU or UN, unique names and codes, sorted, the UK's nations present.
    e2e: `form.spec.ts` and `formWalk.ts` stop routing flagcdn's list.
    **Built (2026-10-21):** as planned. The e2e test that the list was fetched on `/form` only
    became "offers the countries with flagcdn down" (every flagcdn request aborted).
    Review of `9ec32d8`, fixed: search ran on the cut label, so a word past 25 characters
    ("Grenadines") found nothing (it searches the full name now); the sort followed the
    browser's locale (English now, pinned by a test); a leftover enabled-wait in `pickCountry`;
    a local `Country` type shadowing the shared one; the `key` comment. Left as is: one lookup
    helper for the three `countries.find`s, and a pre-sorted source list. The passport list's
    UK nations went to 2h-b.
  - **2h-b · `request-checks`: the server refuses what the form can't send.**
    - Passport: a listed country, still optional. **Decided (2026-10-21): the UK's four nations
      are not passports** ("United Kingdom" covers a British one); the destination keeps them,
      as GeoNames needs them. `passportCountries` (`src/data/countries.ts`) is the list less the
      `gb-` codes: step 1's combobox offers it, and both schemas check against it with
      `isPassport`, blank meaning none (the request trims first), the form saying "Pick a
      passport from the list", so a draft still holding
      "Scotland" is stopped on step 1's Next rather than by the server. Antarctica, Bouvet Island
      and the like stay destinations: the city check refuses them already.
    - Required items: `line(LIMITS.requiredItem)` on the server (no line breaks, `<` or `>`, as
      the name and city). The form's item gets the name's regex and "Leave out < and >", step 4
      validates its items on Next (its `fields` is empty today, so nothing checks them before the
      review), and shows an item's error under it. Blank items stay allowed on the form;
      `toTripRequest` drops them. The note keeps its line breaks.
    - Tests first: the request schema refuses an unlisted passport and a UK nation, and accepts
      a listed one or none; refuses an item with a line break, `<` or `>`; the form schema
      refuses the same passports and an item with `<`; `passportCountries` has no `gb-` code and
      keeps "United Kingdom"; step 1's combobox offers no "Scotland"; step 4's Next stops on an
      item with `<` and shows the message under it.
    - **Built (2026-10-21):** as planned. `CountryComboBox` takes `options` (every country by
      default), and step 1 shows the passport's error. Step 4's `fields` is `["requiredItems"]`,
      so the navigation test that pinned it as validating nothing now pins a blank item passing.
    - **Review of `dfbd950`**, fixed: a draft's unlisted passport ("Scotland") showed an empty
      field that couldn't be cleared, holding step 1 for a traveller with no passport; the
      restore now drops it. One `isPassport` and one `SINGLE_LINE` in `schema.ts` serve the form
      and the request; the request trims the passport again; the server's message for an item
      names both causes ("Keep it to one line, without < or >"); step 4 reads its errors from
      `fieldState`. Left as is: 2k's entry sits on this branch, as asked.
    - **Review of `b226106`**, fixed: the request takes a blank passport as none again, as the
      form does; the plan's wording matches `isPassport`; a test pins the passport to one line.
      **A stale draft value is left as is**, reverting `b226106`'s restore line: a draft lives in
      its tab, there are no outside users, and none predates the passport list, so an unlisted
      passport (or, after a future list change, destination) can only be the developer's own;
      the schemas still refuse it, and Start over clears it. Also left: step 4 shows no message
      for the list's own cap (the step stops offering items at 10), the form not trimming a
      passport the combobox sets exactly, and a `Set` for `isPassport`.
- **2k · `string-tours-caught`: the list sent as a string, caught in production.** After 2h-b.
  On 2026-10-21 (the #220 deploy) one generation (`req_011CgFDwVfiV8gNm6phjUk9j`) failed with
  "invalid trip", and 2f's DIAG log caught the string: `tours` arrived as JSON text, 715
  characters, holding only the first tour. The model escaped the inner quotes (`\"title\"`) until
  the end of that tour's description, where it wrote a bare `"`, which closed the outer string;
  tours 2 to 5 were never written. So the call ended early (13.6s and 1,554 output tokens, against
  38 to 69s and about 2,100 for a full trip) and was billed in full (about $0.022) for nothing.
  No cancel was involved. The API docs promise that `strict: true` gives schema-valid input, so a
  string where the schema has an array is the API's to explain.
  - Decided: **no retry** (a second paid call per failure), and the **DIAG log stays**, for the
    next one.
  - In the branch: the report to Anthropic (request id, the raw string, the tool's schema),
    drafted here and sent by the user; this record; and a test with that exact string, pinning
    that `parseListFields` leaves it as a string and `generateTrip` throws "invalid trip".
  - Seen the same day, both handled as designed, recorded only: a 10s connect timeout to
    GeoNames (the form's city check, `POST /form`: "We couldn't check the city just now") and
    one to OpenWeather (in this generation: "generateTrip: no forecast", planned without one).
    If they recur, a shorter timeout with one retry on those fetches is the next step.
- **2i · dependencies: Renovate keeps them current, a branch each for the breaking ones.**
  Evaluated: both. Nothing prompts an update today (no Dependabot or Renovate config), and
  `npm outdated` shows the lockfile behind — `next` 16.2.6 → 16.4.1, `react` 19.2.6 → 19.3.1,
  `@heroui/react` 3.0.5 → 3.2.6, `react-hook-form` 7.76 → 7.90, TanStack Query, Tailwind. CI
  (typecheck, build, unit, e2e) is what makes automated PRs safe to merge. Breaking bumps need
  code, not a merge button: Prisma 5 → 7, `@hookform/resolvers` 3 → 5 (tied to zod),
  `@anthropic-ai/sdk` 0.100 → 0.134 (pre-1.0, touches `anthropicApi.ts`), `framer-motion` 12 → 14,
  `react-day-picker` 9 → 10, `eslint` 9 → 10 (lint is already broken, so parked with it).
  - **2i-a · `deps-minor`: clear the backlog by hand.** Every non-major bump in one PR, so
    Renovate's first PR isn't enormous. Run `deps-safe`; green is `npx next typegen && npx tsc
    --noEmit`, `npm test`, `npm run build`, `npm run test:e2e`; browser-check `/form`, a trip
    page and `/saved-trips` (design-notes' gotchas on HeroUI and Tailwind bumps). Split off
    `next`, `react`/`react-dom` + their `@types`, and `@heroui/react` if one breaks.
    - **Merged (#223):** type check, unit (1114), build, e2e (81), and `/form` (chips select),
      `/saved-trips` and a saved trip at 1440 and 390 with reduced motion, no console errors.
      The `deps-safe` skill is stale (it names the removed `gsap`, NextUI,
      `locomotive-scroll` and older versions), so not run; instead `npm update` and each caret
      range raised to the installed version. `next` 16.4.2, `react` 19.3.1, Prisma 5.22,
      TypeScript 5.9, `react-hook-form` 7.90, TanStack 5.104, Tailwind 4.3.3, Vitest 5.0.5.
    - **`@heroui/react` held at 3.0.5, split off as 2i-a2 (`heroui-3-2`).** 3.2 makes `Radio`
      and `Checkbox` a `RadioField`/field wrapper with the clickable input in a new
      `Radio.Content`; our chips (`ChoiceGroup`, `CustomCheckbox`) render no input under it, so
      11 form tests can't find a radio or checkbox. 2i-a2 moves the chips to `.Content` and
      browser-checks step 2.
  - **2i-a2 · `heroui-3-2`: the chips on HeroUI 3.2.** Merged (#224). `@heroui/react` 3.2.6,
    installed by removing 3.0.5 first: its pinned React Aria subtree (`@react-aria/ssr` 3.10.0)
    made npm refuse 3.2.6's peers in place. `ChoiceGroup` and `CustomCheckbox` put the chip
    on `Radio.Content` / `Checkbox.Content`, the label holding the input. The root takes
    `chipField` (`form/styles.ts`): HeroUI's disabled root gets `status-disabled`, which
    measured 0.5 × our 0.45 opacity and `pointer-events: none` hiding the `not-allowed` cursor.
    Design-notes gotcha 12 updated. Checks: the 8 failing form tests pass, unit (1114), build,
    e2e (81); `/form` at 1440 and 390 with reduced motion: selected, disabled (0.45, cursor)
    and keyboard focus (2px ink ring) measured, a11y tree has every chip as radio/checkbox,
    no console errors.
    - **Missed, fixed in `heroui-checkbox`:** the two plain checkboxes, step 5's weather and step
      7's agreement, kept `Checkbox.Control` beside `Checkbox.Content`. In 3.2 that puts the box
      outside the label, so clicking it did nothing, and the root's `flex-col` stacked the text
      under it; only the text toggled, which is what the e2e clicked. The control now sits inside
      `.Content`; a unit test and the e2e walk click the box itself. Design-notes gotcha 12 says so.
    - **The image stub fixed:** after the Vite 8.3.5 / Vitest 5.0.5 / Rolldown 1.2.15 bump,
      `resolveId` receives the stub's own `\0asset-stub:` id again and prefixed it twice, so every
      stubbed `src` carried the prefix (29 tests). It now returns an id already stubbed as is.
  - **2i-b · `renovate`: `renovate.json`.** One weekly PR for all non-major bumps; separate PRs for
    `next`, `react`/`react-dom` + `@types`, `@heroui/react`, `@anthropic-ai/sdk`, `prisma` +
    `@prisma/client`; majors held behind the dependency dashboard until approved; security
    updates immediately; GitHub Actions versions included. Installing the Renovate app and
    the repository's branch protection are outward-facing — ask first. Bot PRs run the same four
    required checks (e2e needs no secrets). Merged by hand after a look at the diff; no automerge.
    - **Done, staged.** `renovate.json`: `config:recommended`, Mondays before 6am UTC,
      `rangeStrategy: bump` (the carets 2i-a raised), majors behind dashboard approval, the
      groups above (`eslint-config-next` rides with `next`), and the SDK's 0.x minors held for
      approval too: under semver a 0.x minor may break, and it drives the agent. Security PRs
      skip the schedule; `osvVulnerabilityAlerts` finds them without GitHub's Dependabot alerts.
      Checks: `renovate-config-validator --strict` passes; a local dry run
      (`renovate --platform=local --dry-run=full`) finds no non-major bump (2i-a cleared them)
      and these branches: the SDK 0.137 (held) and 1.0.0 (held, released today), the majors
      (Prisma 7, zod 4, `@hookform/resolvers` 6, `framer-motion` 14 and its `motion`
      replacement, `react-day-picker` 10, TypeScript 7, ESLint 10, CI's `postgres` 16 → 18),
      and **a security PR for `sharp` 0.34.5 → 0.35.5** (three advisories). GitHub Actions are
      on major tags, so their bumps arrive as held majors.
    - `@types/locomotive-scroll` removed, left over from the old look; the hygiene test's
      `package.json` check now also catches a removed package's `@types/`.
    - **Fixed in `renovate-npm-11`: no PR ever opened.** Ticking the `sharp` security branch on
      the dashboard did nothing. Mend's log: hosted Renovate runs npm 12, whose `allow-remote`
      now defaults to `none`, and refreshing the lockfile has to fetch the tarball of
      `@tailwindcss/oxide-wasm32-wasi` (it has `bundleDependencies`), which npm 12 classes as
      remote: `EALLOWREMOTE`, so every lockfile update failed. Then GitHub answered the branch's
      creation with a 422 ("Reference update failed", no reason given; the only ruleset is
      `main`'s). `constraints.npm: "^11"` pins Renovate to the npm that writes our lockfile
      (local and CI's Node 24), rather than `allow-remote=all`, which drops npm 12's safeguard for
      every package. Checked on a copy with `sharp` at `^0.35.0`: npm 12.2.1 fails with the log's
      error, npm 11.15.0 writes 0.35.5. If the 422 comes back once the lockfile builds, it's next.
    - **Install order:** merge this branch, then install the Renovate GitHub app on the repo
      (the user, in the browser). With `renovate.json` already on `main` Renovate skips its
      onboarding PR, so its first PR is the `sharp` security fix, left for Renovate to open.
  - **2i-c… · the majors, one branch each, by request, in this order:** `@anthropic-ai/sdk`
    (touches the agent, so it goes before 3–7 build on it), `@hookform/resolvers` with zod,
    `framer-motion`, `react-day-picker`, Prisma 7 (schema, client generation, the Neon
    adapter, the e2e push script). Each: plan note on what changed, tests with the change.
    - **2i-c · `sdk-1`: `@anthropic-ai/sdk` 0.100.1 → 1.0.0.** Merged (#228). 1.0 sends API
      version `2026-10-21` (was `2023-06-01`) and the key as `Authorization: Bearer` (was
      `X-Api-Key`); `MessageParam` is a union per role; Text Completions, client-side compaction
      and `betas` on the Models methods are gone ([migration guide](https://platform.claude.com/docs/en/api/migration-2026-10-21#typescript)).
      The version's Messages breaks — `temperature`/`top_p`/`top_k` rejected, no `document` in an
      assistant turn, no `citations` in a user turn — touch nothing we send, so `anthropicApi.ts` is
      unchanged. It brings `@opentelemetry/api` (already under `next`); with no tracer registered
      its spans are no-ops. Checks: a test pins that the request carries no sampling parameter;
      the real 1.0 client against a stubbed `fetch` sends `2026-10-21` and `Bearer`, assembles
      the streamed `submit_trip` input with `finalMessage()`, and throws `APIUserAbortError` on an
      abort; type check, unit (1115), build, e2e (81; two `/form` city-check specs failed once
      and passed on rerun, GeoNames). No live call: e2e runs on fixtures.
    - **2i-d · `zod-4`: `zod` 3.25.76 → 4.6.7, `@hookform/resolvers` 3.10.0 → 5.9.2.** Merged
      (#229). One branch: six files use zod, and only `schema.ts` changes. Its two deprecated
      calls move on: `z.string().datetime()` → `z.iso.datetime()`, `z.ZodIssueCode.custom` →
      `"custom"`. The SDK and `eslint-plugin-react-hooks` take zod 4 too (one copy in the tree).
      - **Resolvers held at 5.9.2, not 6.0.0.** 6.0 (2026-10-19) changes only the Effect
        resolver (Effect 4), which we don't use, and npm refuses to install it: its optional peer
        `effect@^4` clashes with `effect@^3` from its other optional peer, `@typeschema/main`,
        though neither is installed. Renovate's held 6.x PR waits until that's fixed upstream.
        5.x's own break (`useForm`'s input and output types inferred from the resolver) needed
        no change: `Inputs` is `z.infer` of the same schema.
      - **The v4 trap, checked and pinned:** Zod 4 skips an object's refinements after an
        aborting issue. The form's empty fields fail `min`/`nonempty`, which continue, so
        `checkEndDate` and `checkAgeRanges` still run while later steps are empty, as in v3; a
        new `schema.test.ts` case pins it. The request schema skips them on a missing field, as
        v3 did.
      - **Fixed here, as asked:** with no date picked, step 5 showed the format message
        ("Invalid datetime", now "Invalid ISO datetime"), never "Start date is required": the
        format check fails first and RHF shows a field's first issue. The format check now
        carries "Start date is required" / "End date is required", and the unreachable
        `.min(1)` goes; `schema.test.ts` asserts the first message. Seen at 390 on a draft
        resumed at step 5.
      - Lockfile: `@standard-schema/utils` (resolvers 5's one dependency) arrives, and eslint's
        `ajv` 6 moves under eslint, now that resolvers lists `ajv` 8 as an optional peer.
      - Checks: type check, unit (1118), build, e2e (81); `/form` at 390, step 1's errors
        and step 1 → 2 through the new resolver, no console messages.
    - **2i-e · `framer-motion-14`: `framer-motion` 12.43.0 → 14.5.0.** Merged (#230). No code
      changes: 13.0 drops the optional `@emotion/is-prop-valid` peer (never installed) and 14.0
      removes internal APIs only; every import we use (`motion`, `AnimatePresence`,
      `MotionConfig`, `useScroll`, `useTransform`, `Variants`, `PanInfo`) is unchanged. `motion-dom`
      and `motion-utils` move with it (14.5.0, 14.1.1), one copy each. The behaviour to watch was
      13.4's scroll work (`useScroll` on `ViewTimeline`, accelerated `useTransform` clamping):
      the hero's parallax still writes an inline `translateY`, clamped at 90 / 170px, no WAAPI
      animation, and under reduced motion `parallax-drift` still computes `transform: none`.
      - Checks: type check, unit (1118), build, e2e (81; the `/form` city-check layout spec
        failed once and passed on rerun, GeoNames). Browser: the landing at 1440 / 768 / 390, a
        saved trip's tours at 390 by button and by swipe, `/form` at 390 with reduced motion;
        no console errors.
    - **2i-f · `react-day-picker-10`: `react-day-picker` 9.14.0 → 10.0.2.** Done, committed (c71014d), with
      the review's fixes staged. No code changes for the bump itself; the calendar's circles and
      the clear fix below landed on this branch as asked, three concerns in one. 10.0 removes the APIs v9 deprecated (`fromDate`/`toDate`, `initialFocus`, the
      `onDay*` handlers, the old label/format aliases, the non-Gregorian calendars, now
      `@daypicker/*`), and `DatePicker` uses none of them. `react-day-picker/dist/style.css` is
      still exported (an alias of `style.css`, unchanged byte for byte), and `classNames` still
      merges over the defaults per key. 10.0.1 applies `style` to every slot, but ours goes on the
      root alone. The lockfile drops `date-fns-jalali` and `@tabby_ai/hijri-converter` and
      takes `@date-fns/tz`. The `react-day-picker` name stays (Renovate tracks it); 10 also
      publishes it as `@daypicker/react`.
      - Checks: type check, unit (1118), build, e2e (81). Browser, a production build: `/form`
        step 5 at 390 and 1440 with reduced motion. The calendar opens on today, focused; a
        click and a keyboard pick (arrow, Enter) each fill the field and close it; the next
        month's button works; no console messages.
      - **The calendar's circles, back, as asked.** `classNames` replaces the library's class per
        key, and `DatePicker` had replaced `day_button`, `selected` and `today` since the sorbet
        migration, so the days were bare 18px numbers and the selected day only bold (as in v9).
        The day buttons are now 2.5rem circles styled in full: today lime, the selected day ink
        with offwhite text, the rest an ink tint on hover (ink text on lime and on the tint: today
        selected stays lime with an inset ink ring, a hovered selected day takes the tint), the focus triad, no transition under
        reduced motion. Gotcha 15 in `design-notes.md`; a test pins the cells' `data-selected`
        and `data-today`. Checked at 390, 768 and 1440: computed sizes, fills, the arrow-key
        focus ring; unit (1119), e2e (81).
      - **Fixed here, as asked: a cleared date came back.** Tick the weather box, untick it,
        pick other dates, press a field's X: the field showed the weather date again, and only
        a second press cleared it. The X sent `undefined`, which RHF's controller treats as
        unset, handing back the value the field mounted with (the weather date, set while the
        pickers were hidden). It now sends `""`, the form's empty value. A `DatePicker.test.tsx`
        case mounts a picker under `useForm` on a value set beforehand and clears it in one
        press (it failed first). Checked in the browser at 390: the reported flow clears in one
        press each, and Next then shows both "required" messages.
      - **Review fixes** (all seven, as asked): every day state sets its text with its
        background through the same `group-data-*` / `hover:` variants (a selected day tapped on
        a phone was ink on ink: the text rule wasn't behind `hover:`'s `(hover: hover)`); the
        classes move to `calendarClassNames`, the cell's from `getDefaultClassNames()`; the two
        variables that styled nothing go; `onChange` takes a `string`, so `undefined` can't come
        back; the comment becomes a pointer to gotcha 15.
    - **2i-g · `prisma-7`: `prisma` and `@prisma/client` 5.22.0 → 7.10.1, `@prisma/adapter-pg`
      7.10.1.** Done, staged. One concern, one branch: the diff is wide (19 type imports) but
      mechanical. 7.10.1 is the newest stable: npm's `latest` tag points at 8.0.0-rc.25, and
      Renovate skips prereleases on a stable version.
      - **The generator:** `prisma-client` (Rust-free; no query engine binary), generated into
        `src/generated/prisma`, gitignored, and run by a new `postinstall` (CI's typecheck, unit
        and seed steps need it before `build` runs) as well as `build`. `moduleFormat = "cjs"`:
        the ESM output sets `__dirname` from `import.meta.url`, which throws when Playwright loads
        the journey spec as CommonJS. Every `@prisma/client` import moves to
        `@/generated/prisma/client`, all type-only.
      - **The adapter:** 7 requires one. `@prisma/adapter-pg` over TCP, not `@prisma/adapter-neon`:
        Fluid compute keeps a pool alive, and `pg` also reaches the e2e container, which Neon's
        WebSocket driver can't. `createPrismaClient` (`src/db/client.ts`) builds every client — the
        singleton, the seed (which loses `datasources`, gone in 7) and the journey spec — with
        `connectionTimeoutMillis: 5_000`: `pg` otherwise waits forever, where Prisma 5 gave up
        after 5s. A unit test pins both arguments.
      - **The config:** the schema's `url` moves to `prisma.config.ts`. Prisma 7 loads no `.env`,
        so the config calls `@next/env`'s `loadEnvConfig`, as `scripts/localDatabase.ts` does: the
        CLI now reads `.env.local` over `.env`, like the app. `process.env.DATABASE_URL`, not
        `env()`, which throws when unset and would break `prisma generate` in CI's keyless build.
        `db push` lost `--skip-generate` (it no longer generates), so `push-e2e.ts` drops it.
      - Lockfile: the CLI brings Prisma Studio and PGlite (`@prisma/dev`), dev-only; `pg` 8.23
        arrives under the adapter. `npm audit`'s six highs are all `sharp`, as before.
      - Checks: type check, unit (1121; one GenerationContext toast test failed once under the
        full suite and passes alone, untouched here), build, `db:push:e2e`, `seed:e2e`, e2e (81).
        No browser pass: nothing visible changed, and e2e reads and writes through the new
        client on a production build.
      - **Not checked: production.** The app on Neon through `pg` with `sslmode=require` (`pg`
        treats `require` as `verify-full`; Neon's certificates are valid) wasn't read from here.
        Check the Vercel preview: `/saved-trips` and a saved trip load.
  - Order: 2i-a → 2i-b → majors. Independent of 2e/2h and of branches 3–7, except that the SDK
    major should land before 3.
- **2j · `readme-phase-2`: the README, caught up.** Review `README.md` against phases 1 and 2:
  the server-owned trip (refresh keeps it, save/discard), the new form fields and city check,
  weather by coordinates, the form-scoped providers, architecture and commands. Retake the
  screenshots that changed at the sizes above.
  - **Status: merged (#232).** Revisited at the end of phase 2, after 2p-b. As built: the README is
    rewritten as a brochure for recruiters and hiring managers: highlights, an architecture
    overview (a Mermaid diagram plus five points), a table of decisions and their reasons, and a
    roadmap for 3–7. The live link moves to `trip-ai-world.vercel.app` (the old
    `trip-ai-weld` deployment is gone). The e2e setup uses `E2E_DATABASE_URL` and
    `db:push:e2e`, no longer an exported `DATABASE_URL`.
  - Screenshots: every shot retaken from production, 8 laptop shots (1440 × 900, viewport) and
    8 phone shots (390 × 844, two rows of four at `24%`): the landing, form steps 2 (the city
    found) and 5 (planning around the weather), saved trip 42 (Athens) at its hero, tours,
    packing list and forecast, and the saved-trips wall. The form was filled in but never
    submitted, and nothing was written. The shots no longer used are removed (about,
    landing tours, form steps 1 and 3, tip, phone weather).
- **2l–2p · from using the deployed app (2026-10-22).** Six findings; five are branches below.
  - **The form draft stays in `sessionStorage`** (the sixth). It exists before any trip does, so a
    table for it could reference only the visitor, not a trip; a write per keystroke isn't worth a
    round trip; and once submitted, the trip row holds the request. Not in-memory state either: a
    reload would lose it.
- **2l · `trip-text-breaks`: line breaks in the tip.** The closing's tip shows a literal `\n`
  (backslash, n): the model escapes the line breaks, 2k's kind of slip, and `<p>{tip}</p>` prints
  them. Seen only in the tip; the description and the tours (one paragraph each) never showed it.
  - `paragraphs(text)` (`src/lib/utils.ts`): splits on real line breaks and on the written
    two-character `\n`, trims, drops the empty. `Closing` renders a `<p>` per paragraph in a
    `space-y-4` block, so both `SaveSection` and `FinalSection` get it. At render, so the rows
    already in production read right with no data migration. The source is fixed in 2m's prompt.
  - Tests first: `paragraphs` (`utils.test.ts`), the tip's paragraphs apart with no backslash
    (`closing.test.tsx`).
  - **Built (2026-10-22).** Seen in the browser at 1440, 768 and 390 on a seeded trip given the
    production text's literal `\n`s: two paragraphs in the tip, no backslash, no hydration error.
  - **Reviews of `6079c6e` and `b188378`.** The first build also split the description, cleaned
    the tours, and unescaped the description, tip and tours on the server (`unescapeBreaks`)
    before the row was written. All taken out: only the tip ever showed the slip, and 2m stops
    it at the source. Left: a double-escaped `\\n` or a written `\r\n` (never seen), and an
    empty tip rendering an empty block (no row has one).
- **2m · `passport-entry`: entry rules only when they apply.** The tip reminds the traveller to
  check entry rules even on a passport of the destination's own country, and on any other it says
  only "check the rules", which tells them nothing.
  - `buildTripMessage` leaves the `Passport:` line out when the passport's code (its name looked
    up in `passportCountries`) equals the place's `countryCode`; the "no passport, leave this out"
    rule then covers it. It takes `countryCode` from `resolvePlace`, which `generateTrip` has.
  - Decided: **a short summary, then "confirm".** With a passport, the tip ends with what that
    passport usually needs for this country (visa-free and for how long, visa on arrival, an eVisa
    or ETA, an ID card being enough), that the rules change, and to confirm with the
    destination's official sources before booking. It can be out of date until branch 4 looks
    them up.
  - From 2l's review: the system prompt and `submit_trip`'s descriptions of `description`, `tip`
    and a tour's `description` say to separate paragraphs with a line break, never a written
    `\n`, so the slip stops at its source, in every field: 2l fixes only the tip, at render.
  - Tests: the prompt with the same country (no line), another (the line) and none; the snapshot.
    One real run of each, recorded here.
- **2n · `second-photo`: a photo between the essentials and the weather,** styled like the third
  (`PhotoSection`).
  - `unsplashApi` keeps six photos (`slice(0, 6)`; Unsplash's page is 10); `imageDataFixture`
    gets a sixth.
  - `PhotoSection` takes `image?`, `fallback` and `placeholder` instead of the `trip`, and
    `TripPage` renders it twice: `tripImages[2]` (fallback `3.jpg`) where it is, and
    `tripImages[5]` (fallback a bundled photo the page doesn't use yet) between `MustHaveSection`
    (white) and `WeatherSection` (offwhite). On canvas, so no two grounds alike in a row;
    `TripPage`'s docblock and `design-notes.md` list the new order.
  - Rows with five photos fall back to the bundled one; the seed stays.
  - Tests: the sixth photo and the fallback for a row with five. Browser at 1440, 768, 390.
- **2o · `save-keeps-scroll`: answering keeps the page where it is.** After "Yes, save it" or
  "No, thanks" the trip page jumps to the top.
  - Cause unconfirmed. Suspect: `useSaveTrip`'s `router.refresh()` re-renders `TripPage`,
    `loadWeather` starts new promises, and the weather sections' `<Suspense>` fall back and
    shorten the page; the `SaveSection` swap is the other candidate.
  - Reproduce it with the Playwright MCP first, then a failing e2e in the journey spec (it writes
    rows): scroll to the closing, answer, `scrollY` is not back to 0. Fix what the reproduction
    shows, keeping the refresh's purpose (Back doesn't ask again).
- **2p · the open trip in the database — split 2p-a, 2p-b.** 2e-g keeps it in `localStorage`.
  - Decided: the browser is told apart by an **anonymous first-party cookie**, strictly necessary
    for a feature the visitor uses, so under ePrivacy it needs no consent banner; a **paragraph on
    `/about`** says what it holds and that nothing tracks you.
  - Model: `Trip.visitorId String?` and `Trip.answeredAt DateTime?`,
    `@@index([visitorId, answeredAt])`. A discarded trip is `saved: false` with `answeredAt` set,
    which tells it from one never answered (today both are `saved: false`). A row with no
    visitor, every current one included, is never open. No `Visitor` table: it would hold only
    its id.
  - **2p-a · `open-trip-server`.** `POST /api/trip` sets `trip-ai-visitor` when missing
    (`crypto.randomUUID()`, httpOnly, `SameSite=Lax`, `Secure` in production, a year);
    `generateTrip` writes the `visitorId` on the row (`toTripRow`); `setTripSaved` also sets
    `answeredAt` (a discarded trip can still be saved later); `getOpenTrip()` returns the
    visitor's newest row with `answeredAt` null, or null. The route answers 409 while the visitor
    has one open: a guard now, not only a guide (the rate limit is still branch 3's). Two tabs
    starting at once can both pass: accepted. Bridge: the client keeps `localStorage` here; 2p-b
    removes it. The `/about` paragraph. Tests: `answeredAt`, `getOpenTrip` (no cookie, none
    open, the newest), the 409 and the cookie. `db:push:e2e` locally; the production push is the
    user's.
  - **2p-b · `open-trip-client`.** `useOpenTrip` is one query on `getOpenTrip()`, refetched on
    focus again (another tab's answer shows on return); `transition`'s `rememberTrip` becomes an
    invalidation of it, and `useSaveTrip` invalidates instead of `forgetOpenTrip`.
    `src/lib/openTrip.ts` and its test go. A 409 shows the failure panel: "Save or discard your
    last trip first". CLAUDE.md's "One unanswered trip" and its tables, `generation.test.ts`'s
    table and `FormOpenTrip.test.tsx` follow; 2e-g's e2e still passes.
- **Order from here:** 2l → 2m → 2n → 2o → 2p-a → 2p-b, then 2j's README once more, and branch 3.
  (2h-a, 2h-b and 2k merged; 2i down to its last major.)

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
- `recordGeneration()` is called from a `finally` in the agent, so failures are logged too — and
  stopped ones (2g): `ok: false`, `stopReason: "aborted"`, and the usage that had arrived. A stream
  stopped early may never report its final usage, so that row's cost is an estimate.
- Rate limit: count `Generation` rows by `ipHash` in the last hour (e.g. 5 per hour), and return a
  typed error the form shows as a toast. No Redis. Stopped generations count, or starting and
  stopping would get around it.
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
- Streaming: the route answers in server-sent events (`done`, `error`, and `step`; moved here from
  2g, which kept the JSON response); the loop runs inside it and emits `step` events
  ("Checking the weather in Lisbon…"), with `maxDuration = 300`. `LoaderResponseAI` and 2e-f's
  toast show the real steps in place of the canned ones.
- Stopping: the request's `signal` reaches every iteration's Claude call and every tool's HTTP
  call, and the loop checks it between iterations — or Stop would end only the first call.
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
  `plan_trip` (calls the agent function 2g split out, not the HTTP route; logged as `kind: mcp`), `list_saved_trips` and `get_saved_trip`
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
