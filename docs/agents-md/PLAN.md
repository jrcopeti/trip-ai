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
- `lint`, parked until `typescript-eslint` supports TypeScript 7: `npm run lint` stays broken and
  `npm run typecheck` stays the check that works. `eslint-config-next` loads `typescript-eslint`, which
  throws `typescript-eslint does not support TS 7.0`; its support is PR #12803, open on 2026-11-04.
  - **What doesn't get around it:** an npm override on `eslint-config-next` fails with a dependency
    conflict, and one on `typescript-eslint` and its packages installs no TypeScript 6. Aliasing
    `typescript` to `@typescript/typescript6` was rejected in the grounded agent's 2i-h: `npx tsc` ran 6.
  - **When it's picked up:** `eslint.config.mjs` on `eslint-config-next`'s flat config, `lint` running
    `eslint .`, `@eslint/eslintrc` removed, a `Lint` job in `ci.yml`, and `AGENTS.md`, the README and the
    `ci.yml` header updated. Run `npm ci` first.
  - **What to expect:** 19 errors and 1 warning, from trials on an out-of-date `node_modules`, so re-count.
    14 `react-hooks/globals` are test `Probe`s: turn that rule off for `*.test.tsx`. `DatePicker` copies a
    prop into state: make it controlled and give its two tests a wrapper that feeds the value back. The
    others are false alarms or harmless, so disable each inline with its reason: `ToursCarousel`, `Intro`,
    `SiteNav`, `useGeoNames`, and the warning in `FormContext`.
