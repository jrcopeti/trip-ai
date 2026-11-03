# PLAN — AGENTS.md

`CLAUDE.md` had grown to 443 lines, most of them findable in the code or true of one folder, and 12
of them wrong. A line stays in `AGENTS.md` only if the code can't tell you and it holds everywhere.

One branch, `agents-md`:

- `AGENTS.md` holds what passed; `CLAUDE.md` is `@AGENTS.md`.
- Moved: testing rules to `docs/testing.md`, the generation's tables to `docs/generation.md`, folder
  rules to `e2e/`, `prisma/` and `src/app/api/`, browser checks to the `verify-in-browser` skill.
- Enforced instead of written: the Prisma import rule (`hygiene.test.ts`), asking before a commit,
  push, PR or worktree (`.claude/hooks/ask-before-publish.sh`, skipped in GitHub Actions).
- Done outside the branch: `Unit tests` and `E2E` added to `main`'s required checks.

Left for later: the broken `lint` script, a `typecheck` script, the stale `.claude/commands/`, the
dead 0.x rule in `renovate.json`, `@prisma/adapter-pg` outside Renovate's Prisma group, the
`prompts/` folder that nothing appears to use, the comments in `ci.yml` calling every API module
`"use server"`.
