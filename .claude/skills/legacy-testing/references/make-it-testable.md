# Make it testable

Dependencies are the number one reason code is hard to test: the database, an API, a message queue, the clock, the filesystem.

1. Find the seams: places where you can change behaviour without changing structure. A dependency created inside a function (`new Client()`, `Date.now()`, `fs.readFileSync`) becomes a parameter or a constructor argument with today's value as the default, so callers keep working.
2. Pick per dependency:
   - **Fast** (an in-memory store, pure computation) → keep the real one. More realistic tests.
   - **Carries the business logic** (the pricing rules, the database whose constraints the code relies on) → keep the real one, in a test instance (e.g. a Testcontainers database). More meaningful tests.
   - **Slow or unreliable edges** (a payment provider, email, a third-party API) → a test double: a fake with the same interface, or a stub returning recorded responses.
3. Inject the clock: every function that reads the time takes `now` as an argument.

Done when every function in the target area can be called from a test without a network, a real third-party service, or the wall clock.

Official docs: Testcontainers https://testcontainers.com/guides/ · Vitest mocking https://vitest.dev/guide/mocking · Jest mock functions https://jestjs.io/docs/mock-functions
