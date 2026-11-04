# PLAN — the dev container ("the box")

A Docker container to work in, so an agent running with full permissions can only damage the box.
It is the container layer `docs/agents-md/PLAN.md` left for later. Ported from
`ticket-bay/.devcontainer` (at its `94809a3`), itself based on Anthropic's reference dev container;
what the box does is in `.devcontainer/README.md`.

## The split

| Branch | Holds | State |
| --- | --- | --- |
| `dev-container` | The box: `./box`, the image, the firewall, its Postgres, Playwright and Playwright MCP, no connectors. The brain. `./box --docker`. The README | The box committed; the brain and `--docker` staged, in review |
| `rubik-self-hosted` | Rubik through `next/font/local`, as Caveat is, so `npm run build` runs behind the firewall | Not started |

The brain and `--docker` share this branch by the owner's decision, against the one-concern rule.

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
- **`--docker` builds its image in `./box`,** and `docker/compose.yaml` only runs it (`build: !reset null`).
  Compose's bake refuses `build.network: host` with no way to allow it, and a build on the container
  network is blocked by the VM's firewall. A prebuild alone can't feed Compose: the network mode is part
  of the build cache key.
- **`./box` refuses a taken port before it starts anything.** Compose hides the reason, and the next
  `./box` reuses a container left with no network, which then fails on DNS.
- **The Playwright MCP line uses `--scope local`,** as `--scope project` would edit the tracked `.mcp.json`.
- **Gone, as this repo has none of it:** Better Auth, `db:migrate`, `db:seed`, `test:unit`, `test:http`,
  `test:ui`, the CI gate workflow.

Renovate doesn't see the pins in `Dockerfile` and `compose.yaml`. When `prisma` or `@playwright/test`
moves in `package-lock.json`, bump them by hand: a stale Playwright fails the e2e run, and a stale
Prisma engine runs without complaint.

## Open

1. **Rubik.** `npm run build` fails in the box: `next/font/google` fetches Rubik and the firewall blocks
   Google Fonts. Allowing it would allow an IP on Google's shared front end, so all of Google. The
   `rubik-self-hosted` branch fixes it. It is a visible change, so it gets the browser checks.
2. **`--docker` exposes `.env` and `.env.local`.** The VM shares the real repo folder, so a container
   started through the socket binds it and reads both; the empty mounts stop only the box itself. The
   agent is root in the VM, so nothing set in the VM holds. Left as it is and documented while `--docker`
   is unused: nothing is exposed until it first runs. Its first real use runs from a clone with no secrets;
   a lasting fix is decided then, the alternative being secrets outside the repo behind symlinks that
   dangle in the VM.
3. **`--docker` has no job here yet.** In ticket-bay it exists for Testcontainers, and this repo has none.
   It is here for the course setup and for later.
4. **Form-walk flakes in the box.** Each e2e run lost a different form test to a 30 s timeout on a country
   option, "element is not stable". They pass on a rerun and CI on `main` is green. Not root-caused;
   the box shared Docker's 4 GB VM with ticket-bay's box in these runs.
5. **Unit tests under load in the Docker box.** `npm test` failed 15, then 3, form tests with no change.
   With `--maxWorkers=2` all 1163 pass, and the 3 pass alone. The VM has 4 CPUs and 4 GiB.

## Verified on 2026-11-04

In the box, on Docker Desktop (arm64), port 3200 because ticket-bay's box held 3000:

- `id` is `node`; `.env` and `.env.local` read 0 bytes in the box and are unchanged on the host.
- `example.com` and Neon blocked, `api.github.com` reachable; the firewall checks itself on each start.
- `npm ci`, `prisma db push`, `db:push:e2e`, `seed:e2e`, `npm test` (1163 passed), `npm run typecheck`.
- `E2E_FIXTURES=1 npm run dev` answers 200 on `/` and `/form` from the host, with a fallback font.
- Playwright MCP 0.0.83 with `--browser chromium` opens a page in the box.
- The e2e suite, on a build with Rubik stubbed through `NEXT_FONT_GOOGLE_MOCKED_RESPONSES` (a file left
  out of this branch): 74 passed, 2 failed, 6 not run behind them in the `chromium` project. One failure
  is `logs no console errors`, on the stub's fake font URL; the other is open item 4. The journey
  project, run alone: 4 passed, Cancel failed as in item 4 and passed on a rerun, 1 not run.

The brain, with no brain repo yet:

- With `~/.config/brain` empty, the box starts and logs its one line; the folder is read-only in the box.
- `brain-start.sh` against a throwaway local repo: clone, pull, a bad repo and a repo without `install.mjs`
  all behave and none stops the script.

`./box --docker`, on Colima 0.10.3:

- The VM shares only the repo and, read-only, `~/.config/brain`. `check-engine.sh` refuses Docker Desktop.
  The default Docker context stays `desktop-linux`.
- The box has the socket, runs as `node`, reads `.env` and `.env.local` as 0 bytes, reaches GitHub and
  not `example.com`.
- A container it starts sees nothing in `~/.ssh`, and reaches `postgres:5432` but not `example.com`, npm
  or `host.docker.internal`. It does read the real `.env` and `.env.local`: open item 2.
- A rebuild with the VM's firewall up works, including a build step that needs the network.
- `npm ci`, `prisma db push`, `npm run typecheck`, and `npx vitest run --maxWorkers=2` (1163 passed).

Signing in to Claude in the plain box works: the owner did it, and the firewall let it through.

Not exercised: "Reopen in Container" in an editor,
`--docker`'s e2e suite (open item 1), and the brain over SSH with a real deploy key.
