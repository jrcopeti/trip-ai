# AGENTS.md

Rules for any agent working in this repository that hold only here. The rules that hold in every
project (committing, branching, PR size, checks, comments, plans) come from the owner's global
instructions. What the code, `package.json` and the README already say isn't repeated here.

## Databases

**Check which database `DATABASE_URL` resolves to before running anything that writes.**
`npm run dev` and a bare `npx prisma db push` use `.env.local`'s, then `.env`'s. On the owner's
machine that is `.env`'s, which is production.

**`npm run seed:e2e` deletes every trip in `E2E_DATABASE_URL`.** `ALLOW_REMOTE_E2E_SEED=1` lets the
seed, the push script and `trip-journey.spec.ts` write to a remote host. Don't set it unless asked.

## Per-branch checklist

1. Before touching styling, read `docs/design-notes.md`, at least "Building a page" and "Gotchas
   that cost real time".
2. Read `docs/testing.md` before writing tests.
3. Green: `npm run typecheck`, `npm test`, `npm run build`, and `npm run test:e2e` when the change
   touches a covered flow. `npm run lint` is broken and is not a signal.
4. When the change is visible, check the console for hydration errors as well. In Claude Code, the
   `verify-in-browser` skill has the browser steps.
5. Update `docs/design-notes.md` when the visual system changed.

## Docs

- **`docs/design-notes.md`** — the `sorbet` design system. **Read it before styling anything.**
  Longer reasoning behind code goes here or in the plan.
- **`docs/testing.md`** — how tests are written here. Read it before writing one.
- **`docs/generation.md`** — the trip generation's state, as tables. Change them with the code.
- **`README.md`** — the architecture, running locally, CI.
- **`docs/<topic>/PLAN.md`** — the plan in flight is `docs/grounded-agent/PLAN.md`; the others are
  records.
- **`docs/grounded-agent/DEVLOG.md`** — that plan's devlog.
- **A folder's own `AGENTS.md`** — rules only that folder needs: `e2e/`, `prisma/`, `src/app/api/`.
  Each has a `CLAUDE.md` beside it that imports it, as Claude Code won't load it otherwise.
