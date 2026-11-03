# e2e

Setup is in the README, under "End-to-end, locally".

- **Run the suite against a throwaway Postgres, never the real one.** The seed deletes every trip,
  and `trip-journey.spec.ts` writes.
- Assertions are behavioural. There are no visual baselines; don't add any.
