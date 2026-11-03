# e2e

Setup is in the README, under "End-to-end, locally".

- **Run the suite against a throwaway Postgres, never the real one.** The seed deletes every trip,
  and `trip-journey.spec.ts` writes. `ALLOW_REMOTE_E2E_SEED=1` turns off the guard against a remote
  database; don't set it unless asked.
- Assertions are behavioural. There are no visual baselines; don't add any.
