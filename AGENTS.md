# AGENTS.md

Rules for any agent working in this repository. What the code, `package.json` and the README
already say isn't repeated here.

## Working agreement

**Never run `git commit`, `git push`, or `gh pr create` on your own initiative.** Finish
the work, `git add` it so it shows up in the VS Code diff, say what changed — and stop
there. Every diff is reviewed in the editor *before* it becomes a commit. No exceptions
for "it's only docs", "it's only a config file", or a change you are confident about.

**The review comes first even when the instruction that started the work mentioned
committing.** A sentence written before the diff existed cannot approve a diff nobody has
seen yet. So:

- "Make the change", "do X", "branch off and do X" — not permission to commit.
- "Write the plan, then commit and push it" — the *work* is authorised; the commit is
  not yet. Do the work, stage it, report, wait.
- Only "commit" / "push" / "open a PR" arriving **after** the changes are sitting staged
  in the working tree is permission — and it covers that diff only, not the next one.
- Permission does not carry across steps, branches, or turns. Ask again each time.

If you believe something genuinely has to be committed before it can be reviewed, say so
and wait for an answer instead of committing.

**Code review findings are reported, not fixed.** After any review, present each finding with its
severity and scenario, propose a fix for each, and stop. The user decides which findings to fix and how; only then make the change. "Commit
and review" authorises the commit and the review — not fixes for what the review finds.

**Work in the main working tree, on the branch, so the diff is visible.** Create the
branch with `git checkout -b <name>` in the repository root — the directory the editor is
open on — rather than in a separate worktree. Work done in a detached worktree (under
`/tmp`, say) cannot be reviewed, because the editor never sees it. If a worktree is genuinely
needed (reproducing a clean-checkout build, for instance), it is for verification only;
the change itself still lands here.

**Leave the branch checked out when you are done**, so the next session and the editor
agree on where the work is.

Corollary for anything outward-facing — pushing, PR bodies, PR comments, repository
settings, deploys: same rule, and ask first. Reading is always fine.

**Check which database `DATABASE_URL` resolves to before running anything that writes.**
`npm run dev` and a bare `npx prisma db push` use `.env.local`'s, then `.env`'s. On the owner's
machine that is `.env`'s, which is production.

**`npm run seed:e2e` deletes every trip in `E2E_DATABASE_URL`.** `ALLOW_REMOTE_E2E_SEED=1` lets the
seed, the push script and `trip-journey.spec.ts` write to a remote host. Don't set it unless asked.

## Per-branch checklist

Every piece of work is one branch off `main`, one PR:

1. `git checkout main && git pull && git checkout -b <branch>` in the repo root — not a
   worktree (see the working agreement above).
2. Before touching styling, read `docs/design-notes.md` — at least "Building a page"
   and "Gotchas that cost real time".
3. Do the work, and write its tests in the same PR — a failing test first for a bug. Read
   `docs/testing.md` before writing tests.
4. Green: `npm run typecheck`, `npm test`, `npm run build`, and
   `npm run test:e2e` when the change touches a covered flow. `npm run lint` is broken
   and is not a signal.
5. When the change is visible, verify it in a browser at 1440, 768 and **390** wide, with
   `prefers-reduced-motion: reduce`, and check the console for hydration errors. In Claude
   Code, the `verify-in-browser` skill has the steps.
6. Update the work's plan (`docs/<topic>/PLAN.md`), its `DEVLOG.md` if it has one, and
   `docs/design-notes.md` when the visual system changed.
7. **Stage the work and stop.** No commit, no push, no PR — see the working agreement.
   Leave the branch checked out.

### Keep PRs small

A PR is sized to be reviewed in one sitting: **one concern per branch**. A step that
spans several (data model + form UI + an external API + a prompt) is split into
sub-branches — `1a`, `1b`, … — each green and mergeable on its own, with dependencies
going one way.

- Split **before writing code**: when starting a plan step, write the split into its
  `PLAN.md` (what each sub-branch holds, and the order) and say it in a line.
- A sub-branch may leave a temporary bridge for the next one (an old call site adapted,
  not rewritten) — name it in the plan so the next branch removes it.
- If a branch grows past its concern mid-work, stop, propose a split, and move the rest
  to the next sub-branch rather than finishing it here.

## Descriptions and code comments

Write them assertively: plain statements of fact, no hedging, no narrating. These rules are for
what you write; older code doesn't all meet them yet.

- **A description** (the docblock on a function, type or module) says what it does and what
  it guarantees, in that order. "Reduces OpenWeather's list to one reading per trip day, the
  one closest to 12:00 at the destination. Dates and hours are the destination's." Not the
  problem it was born from, and not how it works inside.
- **A comment** goes only on a line a competent reader would misread or "fix": a trap, a
  constraint, a non-obvious decision. It says what the line achieves and what breaks without
  it. "Without `.utc()` dayjs would use the server's zone." Lines whose code is clear get none.
- Both are up to three lines, complete enough that the reader needn't look anything up.
  Never what the code already says, and never how it got there (that is the commit message
  and the plan). Longer reasoning goes in `docs/design-notes.md` or the plan, with a one-line
  pointer in the code.

## Docs

- **`docs/design-notes.md`** — the `sorbet` design system. **Read it before styling anything.**
- **`docs/testing.md`** — how tests are written here. Read it before writing one.
- **`docs/generation.md`** — the trip generation's state, as tables. Change them with the code.
- **`README.md`** — the architecture, running locally, CI.
- **`docs/<topic>/PLAN.md`** — one folder and plan per piece of work. Tracked. Read
  the relevant plan at the start of a task and keep it updated as the work changes
  shape; churn there is expected. A new piece of work gets a new folder. The plan in flight is
  `docs/grounded-agent/PLAN.md`; the others are records.
- **`docs/grounded-agent/DEVLOG.md`** — what that plan's branches built, each review's findings and
  what was measured, newest last. Its plan says what comes next; what a branch leaves open goes in both.
- **A folder's own `AGENTS.md`** — rules only that folder needs: `e2e/`, `prisma/`, `src/app/api/`.
  Each has a `CLAUDE.md` beside it that imports it, as Claude Code won't load it otherwise.

A durable decision goes beside what it governs, in one of the above. A plan records its work,
including where that work stands, and a devlog's index each finished branch's state; nothing else
repeats its status.
