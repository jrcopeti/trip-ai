# PLAN — skills and hooks

Ten agent skills and the course kit's hooks, tracked in the repo, so every session gets them, the
box included. The box has its own Claude config and never sees the Mac's `~/.claude/skills`.

## The split

| Branch | Holds | State |
| --- | --- | --- |
| `skills-and-hooks` | The ten skills, `skills-lock.json`, the hooks and `.claude/settings.json`. `.pr-review/` ignored. The hooks named in `.devcontainer/README.md` | In review |

Skills and hooks share this branch by the owner's decision, against the one-concern rule.

## The skills

Copied unchanged from `ticket-bay/.claude/skills`. `ticket-bay` keeps them out of git through its
`.git/info/exclude`; here they are tracked, as a skill the box can't see is no use to it.

`adversarial-tester`, `agent-safety-audit`, `bug-triage`, `grill-me`, `legacy-testing`,
`mutation-testing`, `pr-tour`, `pr-triage`, `quicke2e`, `write-great-skill`.

- **`debug-runbook` stays behind.** It is TicketBay's own, and not in `skills-lock.json`.
- **`skills-lock.json` is `ticket-bay`'s,** unchanged: where each skill came from, and its hash.
- **`pr-tour` and `pr-triage` weigh 1.7 MB each,** nearly all of it the same vendored
  `beautiful-mermaid.mjs`. They are the bulk of this diff.
- **Nine of them are also personal skills on the Mac.** Claude Code prefers the personal copy, so an
  update to one of the two can drift unseen. All nine are identical today. `quicke2e` is only here.
- **Some examples still name TicketBay.** They are examples; the steps don't depend on it.
- **`AGENTS.md` beats a skill.** `bug-triage` says to commit and open a PR, and `legacy-testing` says
  to run without stopping. The working agreement still holds: stage and stop.

## The hooks

From `ai-agent-engineer-course-kit/m2/five-hooks`; what each does is in its header.

| Hook | Event | Here |
| --- | --- | --- |
| `block-dangerous.sh` | PreToolUse | As shipped |
| `protect-secrets.sh` | PreToolUse | As shipped |
| `fast-feedback.sh` | PostToolUse | As shipped: `tsc`, no lint, as `npm run lint` is broken |
| `test-gate.sh` | Stop | `TEST_CMD` is `npm test`; the kit's `test:unit` doesn't exist here |
| `session-context.sh` | SessionStart | As shipped. No `docs/decisions.md` here, so it loads git state only |
| `notify.sh` (bonus B) | Stop, Notification | On, as shipped: a sound, no `NTFY_TOPIC` |
| `protect-test-config.sh` (bonus A) | none | Off, as shipped: it also blocks changes the owner asks for |

## What the hooks change here

- **`.env` can't be read to check `DATABASE_URL`.** `AGENTS.md` still requires the check, and the
  hook's advice, `.env.example`, can't answer it. This works, and prints only the host:
  `node -e 'require("@next/env").loadEnvConfig(process.cwd()); console.log(new URL(process.env.DATABASE_URL).hostname)'`
- **The `verify-in-browser` fix for stale CSS, `rm -rf .next`, is refused.** The owner runs it.
- **The gates read the whole command, quoted text included.** A commit message or `grep` naming a
  force push or `DROP TABLE` is refused, as is the kit README's own check once the hook is live. To
  test a hook, pipe its JSON in from a script file.
- **`test-gate` runs on every stop while the tree is dirty,** about 30 to 40 seconds. Staged work
  waiting for review counts as dirty, so a question answered during a review waits for the suite.
- **`fast-feedback` treats any `>` as a write,** so `2>/dev/null` or `2>&1` runs `tsc` while a `.ts`
  file has unstaged changes, and reports that file's errors. About 2 seconds.
- **Hooks are pattern checks.** A command built in a variable or a file gets past them. The box and
  review stay the real limits.
- **The box can edit these hooks.** `.claude/` is writable there, and the Mac runs the hooks at its
  next session, before any review. `.devcontainer/README.md` lists it with the other such paths.

## Verified

Each gate on block and allow, `fast-feedback` red and clean, `test-gate` red, its round limit and
green, `session-context`, `notify`. `block-dangerous` also refused a real tool call in the session
that installed it. Not verified: the hooks and skills running in the box, and the ten skills' own
workflows, which are unchanged copies.
