# PLAN

Working plan for whatever is currently in progress. Tracked, so it is visible in the
Explorer and in diffs, and it travels with the repo.

Keep it current: read it at the start of a task, update it as the shape of the work
changes, and clear finished items out rather than letting them pile up. Churn here is
expected and fine — it is a plan, not a record. If a decision turns out to be durable it
belongs in `docs/design-notes.md` (visual system) or `CLAUDE.md` (rules), not here.

---

## Now

_Nothing planned._

## Next

_Nothing planned._

## Open questions

_None._

---

## Parked

Known work, not scheduled. Detail in `docs/design-notes.md` under "Known debt".

- Migrate `/form`, `/trips/[tripUrl]`, `/saved-trips`, `/about` to the `sorbet` system
- Decide whether to delete the unreferenced `src/components/home/`
- Fix the fabricated city labels and copy-pasted alt text in `src/data/index.ts`
- Move ESLint to flat config so `lint` can rejoin CI
- Revisit the HeroUI `:root` overrides once the form and trip pages migrate
