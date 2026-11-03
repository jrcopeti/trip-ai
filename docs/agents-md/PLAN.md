# PLAN — AGENTS.md

`CLAUDE.md` had grown to 443 lines, most of them findable in the code or true of one folder, and 12
of them wrong. A line stays in `AGENTS.md` only if the code can't tell you and it holds everywhere.

One branch, `agents-md`:

- `AGENTS.md` holds what passed; `CLAUDE.md` is `@AGENTS.md`.
- Moved: testing rules to `docs/testing.md`, the generation's tables to `docs/generation.md`, folder
  rules to `e2e/`, `prisma/` and `src/app/api/`, browser checks to the `verify-in-browser` skill.
- Enforced as well as written: the Prisma import rule (`hygiene.test.ts`).
- Commits, pushes and other outward-facing actions rest on the written rule in `AGENTS.md`. A hook and
  then `permissions.ask` rules were tried and dropped as overhead. A container layer is planned to
  limit what an agent can reach.
- Done outside the branch: `Unit tests` and `E2E` added to `main`'s required checks.

What it left, split by concern:

- `repo-tidy`, on top of this branch: the `typecheck` script; `.claude/commands/` and `prompts/`
  removed; Renovate's dead 0.x rule removed and `@prisma/adapter-pg` in its Prisma group; the comments
  in `ci.yml` no longer call every API module `"use server"`.
- `lint`, left for now by decision: `npm run lint` stays broken and `npm run typecheck` stays the check
  that works. When it's picked up: `eslint.config.mjs` on `eslint-config-next`'s flat config and `lint`
  running `eslint .`. A trial on 2026-11-03 reported 19 errors and 2 warnings across 247 files:
  14 `react-hooks/globals`, 4 `react-hooks/set-state-in-effect`, 1 `react-hooks/static-components`.
  Fix or triage those in the same branch, or lint stays red and still isn't a signal.
