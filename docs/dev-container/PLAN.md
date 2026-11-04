# PLAN — the dev container ("the box")

A Docker container to work in, so an agent running with full permissions can only damage the box.
It is the container layer `docs/agents-md/PLAN.md` left for later. Ported from
`ticket-bay/.devcontainer` (at its `94809a3`), itself based on Anthropic's reference dev container;
what the box does is in `.devcontainer/README.md`.

## The split

| Branch | Holds | State |
| --- | --- | --- |
| `dev-container` | `./box`, the image, the firewall, the box's Postgres, Playwright and Playwright MCP, no connectors, the README | Staged, in review |
| `rubik-self-hosted` | Rubik through `next/font/local`, as Caveat is, so `npm run build` runs behind the firewall | Proposed, undecided |
| `dev-container-brain` | `brain-start.sh`, the brain volume, `~/.config/brain` mounted read-only, the README's brain section | Not started |
| `dev-container-docker` | `./box --docker`, the Colima VM, `check-engine.sh`, `init-firewall.sh --engine`, the docker CLI in the image, the README's Docker sections | Not started, see below |

The later branches take their code and README sections from `ticket-bay/.devcontainer`.

## What differs from ticket-bay

- **Node 24 and Postgres 16**, as CI, against Node 22 and Postgres 17.
- **`.env` and `.env.local` are mounted empty.** Here `.env` holds the production database URL and
  `.env.local` the API keys, and the repo is the box's working folder. The compose `DATABASE_URL`
  would beat `.env` anyway, but the firewall alone would leave the credentials readable.
- **The database service is `postgres`, not `db`.** `scripts/localDatabase.ts` already allows that
  host, for CI, so the e2e seed needs no code change and no `ALLOW_REMOTE_E2E_SEED`.
- **A second database, `trip_ai_e2e`,** because `seed:e2e` deletes every trip.
- **`.next` is a volume too.** A box build overwrote the host's `.next` when the folder was shared.
- **Prisma's schema engine is in the image.** `npm ci` and `db push` otherwise fetch it from
  `binaries.prisma.sh`. Baked rather than allowed, for the same reason as the browsers: the allowlist
  stays GitHub, npm and Claude. `PRISMA_SCHEMA_ENGINE_BINARY` points at it.
- **The Playwright MCP line uses `--scope local`,** as `--scope project` would edit the tracked `.mcp.json`.
- **Gone, as this repo has none of it:** Better Auth, `db:migrate`, `db:seed`, `test:unit`, `test:http`,
  `test:ui`, the CI gate workflow.

Renovate doesn't see the pins in `Dockerfile` and `compose.yaml`. When `prisma` or `@playwright/test`
moves in `package-lock.json`, bump them by hand: a stale Playwright fails the e2e run, and a stale
Prisma engine runs without complaint.

## Open

1. **Rubik.** `npm run build` fails in the box: `next/font/google` fetches Rubik and the firewall blocks
   Google Fonts. Allowing it would allow an IP on Google's shared front end, so all of Google. Proposed:
   the `rubik-self-hosted` branch. It is a visible change, so it gets the browser checks.
2. **`--docker` has no job here yet.** In ticket-bay it exists for Testcontainers. This repo has none:
   the unit tests need no database, and the e2e suite runs in the plain box on `postgres:5432`.
3. **Form-walk flakes in the box.** Each e2e run lost a different form test to a 30 s timeout on a country
   option, "element is not stable". They pass on a rerun and CI on `main` is green. Not root-caused;
   the box shared Docker's 4 GB VM with ticket-bay's box in these runs.

## Verified on 2026-11-04

In the box, on Docker Desktop (arm64), port 3200 because ticket-bay's box held 3000:

- `id` is `node`; `.env` and `.env.local` read 0 bytes in the box and are unchanged on the host.
- `example.com` and Neon blocked, `api.github.com` reachable; the firewall checks itself on each start.
- `npm ci`, `prisma db push`, `db:push:e2e`, `seed:e2e`, `npm test` (1163 passed), `npm run typecheck`.
- `E2E_FIXTURES=1 npm run dev` answers 200 on `/` and `/form` from the host, with a fallback font.
- Playwright MCP 0.0.83 with `--browser chromium` opens a page in the box.
- The e2e suite, on a build with Rubik stubbed through `NEXT_FONT_GOOGLE_MOCKED_RESPONSES` (a file left
  out of this branch): 74 passed, 2 failed, 6 not run behind them in the `chromium` project. One failure
  is `logs no console errors`, on the stub's fake font URL; the other is open item 3. The journey
  project, run alone: 4 passed, Cancel failed as in item 3 and passed on a rerun, 1 not run.

Not exercised: signing in to Claude in the box (it is interactive), and "Reopen in Container" in an editor.
