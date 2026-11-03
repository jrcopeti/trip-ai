# Writing tests

Unit tests sit beside the code as `*.test.ts(x)`; specs are in `e2e/`, which has its own
`AGENTS.md`. Shared helpers and fixtures are in `src/test/`.

## Unit tests

- **Render with `renderWithProviders`** (`src/test/render.tsx`) for anything that touches a query
  or a motion component. `Intro.test.tsx` is the one exception today.
- **Extend `src/test/fixtures/`** rather than inventing a local literal. It is one source of truth,
  and the e2e fixtures use it too.
- **Mock boundaries at the module edge, never deeper.** `@/db` for the Prisma singleton,
  `@/db/actions` for components, and the API modules (`anthropicApi`, `geoNamesApi`, `openWeatherApi`,
  `unsplashApi`) for their callers. Only the test of the code making a call goes beneath it, to `fetch`
  or the SDK: an API module's own test, or `requestTrip.test.ts`. Another test may stub `fetch` to
  assert it is never called. No network, no database, no keys.
- **`whileInView` never fires in jsdom**, so assert that `Reveal`'s children render, never that an
  animation ran.
- **RTL can't render async server components**, so cover their logic as a pure helper and the page
  itself in Playwright.

## The clock

**A unit test whose code reads the clock must pin it.** `findStartIndex` and the date refinements
compare against local time, so a UTC-anchored fixture passes here and fails in CI. Use
`vi.setSystemTime` with a *local* `Date`, and `FIXTURE_NOW` from the weather fixture for forecast
work. E2E runs on the real clock; its forecast fixture moves itself to now.

## Fake timers over a Framer animation

To pin the date alone, fake only `Date`. A test that has to advance a Framer animation copies the `beforeEach`
and `afterEach` of `LoaderResponseAI.test.tsx`, whose comments say why each is needed.
Don't assert an animated swap at an exact timestamp. Advance in small steps until the
expected content is on screen, with a budget; that still pins the order, which is what
the behaviour actually is.
