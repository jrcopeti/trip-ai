# PLAN — the dev container ("the box")

A Docker container to work in, so an agent running with full permissions can only damage the box.
It is the container layer `docs/agents-md/PLAN.md` left for later. Ported from
`ticket-bay/.devcontainer` (at its `94809a3`), itself based on Anthropic's reference dev container;
what the box does is in `.devcontainer/README.md`.

## The split

| Branch | Holds | State |
| --- | --- | --- |
| `dev-container` | The box: `./box`, the image, the firewall, its Postgres, Playwright and Playwright MCP, no connectors. The brain. `./box --docker`. The README | Merged (#253) |
| `rubik-self-hosted` | Rubik through `next/font/local`, as Caveat is, so `npm run build` runs behind the firewall | Merged (#254) |
| `playwright-mcp-project` | Playwright, Chrome DevTools and Context7 in the tracked `.mcp.json`, with what each needs to run in the box | In review (#255) |

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
  of the build cache key. It builds only when the box has no container, as `up` wouldn't use a new image.
- **`./box` refuses a taken port before it starts anything.** Compose hides the reason, and the next
  `./box` reuses a container left with no network, which then fails on DNS.
- **MCP servers are at project scope,** in the tracked `.mcp.json`, so the box needs no `claude mcp add`.
- **Gone, as this repo has none of it:** Better Auth, `db:migrate`, `db:seed`, `test:unit`, `test:http`,
  `test:ui`, the CI gate workflow.

Renovate doesn't see the pins in the `Dockerfile`. When `prisma` or `@playwright/test` moves in
`package-lock.json`, bump them by hand: a stale Playwright fails the e2e run, and a stale Prisma engine runs
without complaint. Playwright MCP's pin is in the `Dockerfile` and `.mcp.json`; bump both together.

## The project's MCP servers

The three servers can't run in the box from a plain `claude mcp add`:

- **Playwright is pinned to 0.0.83, not `@latest`.** The image holds that version's browser and the firewall
  blocks browser downloads: 0.0.84 fails in the box with `Browser "chrome-for-testing" is not installed`.
  The Mac needs the same browser for this entry, installed once. The owner removed the Mac's user-scope
  `@latest` entry, which had the same name, so this is the only Playwright server in this repo.
- **Chrome DevTools gets a launcher at `/opt/google/chrome/chrome`.** Linux arm64 has no Chrome, and Chromium
  exits on start without `--no-sandbox`. Living in the image, it leaves one `.mcp.json` entry for both: the
  Mac opens its real Chrome. `--no-usage-statistics` and `--no-performance-crux` stop calls to Google, which
  the firewall would block in the box and which would send trace URLs out on the Mac.
- **Context7 is the remote server, and the firewall allows `mcp.context7.com`.** This is the first host past
  "GitHub, npm and Claude", and the owner decides it at review. The npm server calls `context7.com`,
  which resolves to `76.76.21.21`, shared across Vercel: the reason Google Fonts was refused. `mcp.context7.com`
  resolves to one AWS load balancer IP. It takes free text with no key, so it is a way out for anything in the box.

## Open

Findings from the branch's code review, reproduced by nobody unless noted, and left by the owner's decision.
Most are in ticket-bay too. #1 and #2 of that review are fixed.

- **The firewall allows its whole /24** (`init-firewall.sh`), so the gateway and every port on Postgres are
  reachable, and the "5432 only" rule never applies. The live rules show the order.
- **The VM's firewall goes stale:** its allowlist fills once, and a new box IP is rejected before the refresh.
- **"Reopen in Container" on the VM** can start without the VM's firewall after a reboot.
- **Rerunning `init-firewall.sh`** in a running box cuts its network.
- **The Postgres health check** can pass before TCP is up or `trip_ai_e2e` exists.
- **The box can reach your machine through `.git`.** `.git/config`, `.git/hooks` and `.git/commondir` are
  writable, and Git on the Mac, an editor's included, runs what they name. Tested: a planted `.git/commondir`
  ran a command on `git status`, so read-only mounts on `config` and `hooks` don't close it, and a read-only
  `.git` stops staging in the box. Left documented. A separate clone or "Reopen in Container" closes it.
- `verify-in-browser` can't run in the box.
- **Context7's DNS can stop the box.** The firewall fails closed when an allowlisted name doesn't resolve, as
  for any host on the list. Its IP is read at start, so if it changes, Context7 fails until the box restarts.

Decided or waiting:

1. **Rubik.** `next/font/google` fetched Rubik at build time and the firewall blocks Google Fonts. Allowing
   it would allow an IP on Google's shared front end, so all of Google. `rubik-self-hosted` moves it to
   `next/font/local`: a preloaded `latin` file and an on-demand one for the rest, sharing a family.
2. **`--docker` exposes `.env` and `.env.local`.** The VM shares the real repo folder, so a container
   started through the socket binds it and reads both; the empty mounts stop only the box itself. The
   agent is root in the VM, so nothing set in the VM holds. Left as it is and documented while `--docker`
   is unused: nothing is exposed until it first runs. Its first real use runs from a clone with no secrets;
   a lasting fix is decided then, the alternative being secrets outside the repo behind symlinks that
   dangle in the VM.
3. **`--docker` has no job here yet.** In ticket-bay it exists for Testcontainers, and this repo has none.
   It is here for the course setup and for later.
4. **Form-walk flakes in the box.** Each e2e run lost a different form test to a timeout on a country
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

`rubik-self-hosted`, in the plain box with Google Fonts unreachable:

- `npm run build` passes. `npm run test:e2e`: 81 passed, 1 failed (open item 4, on `trip-journey.spec.ts:329`).
  `logs no console errors` passes. `next dev --turbopack` loads both `Rubik` faces in a browser.
- On the host, against the Google build: page heights are unchanged. At 40 px, latin text is about 0.015% wider,
  as the moved default rounds advances; latin-ext, Cyrillic, Hebrew and Arabic are within 0.1 px. `/`, `/about`,
  `/form`, `/saved-trips` and a saved trip fetch only the latin file; a Cyrillic or latin-ext character fetches the
  other. The country list holds no such character, so opening it fetches nothing and item 4 isn't the font swap.
- `/form`, `/saved-trips` and a saved trip still differ in text anti-aliasing, cause not found. Weight 700 is now a
  true 700 rather than the 800 face; nothing uses it. The fallback's `size-adjust` is 105.79%, Google's was 104.98%.

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

The review's two fixes, on a throwaway copy with a name in the allowlist that can't resolve:

- The firewall fails: `OUTPUT` is `DROP`, and GitHub and `example.com` are both unreachable.
- The next `./box` refuses to run, and also refuses a box whose policy is set back to `ACCEPT`.
- After the `down` it asks for, the box starts with the firewall in place.
- `box` and `.devcontainer/` are read-only in the box, plain and `--docker`. A root `.devcontainer.json` is
  ignored. With a bad registry in a project `.npmrc`, `npx` fails from the repo and works from `$HOME`.
- A folder with no `.env` files fails its first start without the `touch` in `initializeCommand`, and starts with it.

Not exercised: "Reopen in Container" in an editor,
`--docker`'s e2e suite (open item 1), and the brain over SSH with a real deploy key.

`playwright-mcp-project`, in a plain box built from a copy of the working tree:

- With the servers marked approved, `claude mcp list` connects all four in `.mcp.json`, signed out.
- Over stdio, Playwright 0.0.83 and Chrome DevTools 1.12.0 each open a page, with the `.mcp.json` arguments.
- A Context7 `resolve-library-id` call answers. `mcp.context7.com`, npm and GitHub are reachable;
  `context7.com` and `example.com` are blocked.
- On the Mac, over stdio and headless, Chrome DevTools opens a page on the real Chrome, and Playwright 0.0.83
  opens one after `install-browser chrome-for-testing`.

In the owner's recreated box, from a signed-in `claude` session:

- Playwright, Chrome DevTools, Context7 and next-devtools each answer a tool call. Playwright gets
  `net::ERR_ADDRESS_UNREACHABLE` from `example.com`, the firewall's block. `nextjs_docs` points at the docs in
  `node_modules/next/dist/docs/`, not returning them.
- No approval is saved: `claude mcp list` still says "Pending approval" for the three new servers.

Not exercised: `--docker`, and the approval prompt on the Mac.
