# The box (a dev container)

A Docker container you work in, so an agent running with full permissions can only damage the box.
Based on [Anthropic's reference dev container](https://github.com/anthropics/claude-code/tree/main/.devcontainer).

**Use it from the terminal:**

```bash
./box                      # start the box if needed, then Claude Code inside it
./box npm test             # run any command inside the box
./box bash                 # a shell inside the box
```

Inside, Claude Code runs with `--dangerously-skip-permissions`: the box is the safety, and it runs as the non-root `node` user, which that flag requires. First run: `./box npm ci`, then `./box npx prisma db push`.
Prefer an editor? VS Code and Cursor open the same box with "Reopen in Container".

**The app in the box.** The box is two containers (`compose.yaml`): `app`, where you and the agent work, and `postgres`, its own Postgres 16 (as CI). `DATABASE_URL` points at `postgres:5432`, so `npx prisma db push` and `npm run dev` work inside the box. Open http://localhost:3000 on your machine: port 3000 is published on 127.0.0.1 only. Port 3000 taken? Start the box with `BOX_PORT=3200 ./box` and open http://localhost:3200 (a running box keeps its port: to change it, run `docker compose -p <repo-folder>_devcontainer down`, e.g. `trip-ai_devcontainer`, then `./box` again; the box database survives). The box database is separate from the `trip-ai-e2e-pg` container, and it is not published to your machine.

**No production database, no API keys.** The box mounts `.env` (the production database URL) and `.env.local` (the API keys) as empty files. They stay as they are on your machine. Anthropic has no key in the box, and the firewall blocks GeoNames, OpenWeather, Unsplash and Neon, so run the app on fixtures: `E2E_FIXTURES=1 npm run dev`.

**The e2e suite in the box.** `E2E_DATABASE_URL` points at a second database on the same Postgres, `trip_ai_e2e`, which `seed:e2e` may wipe: `scripts/localDatabase.ts` accepts the host name `postgres`, so `ALLOW_REMOTE_E2E_SEED` stays unset.

```bash
./box npm run db:push:e2e
./box npm run seed:e2e
./box npm run build        # fails for now: see "What it does not do"
./box npm run test:e2e
```

**A second clone.** The box's compose project takes its name from the repo folder: `<repo-folder>_devcontainer`. Two clones in folders with the same name (two `trip-ai` folders) share one project, so `./box` in the second clone fails with "Dev container not found" or uses the first clone's containers. Clone into a folder with another name (`git clone <url> trip-ai-2`) and give it its own port (`BOX_PORT=3200 ./box`). `COMPOSE_PROJECT_NAME=<name> ./box` works only if you set it on every `./box` call: one call without it, after the box stopped, joins the first clone's project again.

**Playwright MCP in the box.** The image has Playwright MCP 0.0.83's browser and Chromium's system libraries, both installed at build time. The firewall allows no browser downloads, so the version is pinned: `@latest` would ask for a newer browser the box cannot fetch. The box is Linux arm64 on Apple Silicon, where Playwright MCP's default Chrome channel does not exist, so add it with `--browser chromium`. Local scope keeps it in the box: `--scope project` would write it to the tracked `.mcp.json`.

```bash
./box claude mcp add --scope local playwright -- npx @playwright/mcp@0.0.83 --browser chromium
```

**No claude.ai connectors.** Signing in to Claude in the box would also bring your claude.ai connectors (Gmail, Drive, Calendar, ...) into Claude Code. The box turns them off (`ENABLE_CLAUDEAI_MCP_SERVERS=false` in `devcontainer.json`): the box limits what the agent can reach, and a connector would reach past the firewall.

**What it does**
- The agent sees this repo, without `.env` and `.env.local`, and nothing else from your machine: no other home folder files, no `~/.ssh`, no Docker socket.
- `node_modules` and `.next` are the box's own volumes, so its Linux install and build never mix with yours.
- Outgoing traffic is default-deny. Allowed: GitHub, the npm registry, Claude's API and sign-in, and the box's own Postgres (`postgres:5432`). Everything else is blocked (`init-firewall.sh`, checked on every start).
- The agent cannot change the firewall: its only root commands are the firewall script itself and the `chown` of those two volumes.

**What it does not do**
- `npm run build` fails in the box, and with it `npm run test:e2e`: `src/app/layout.tsx` loads Rubik through `next/font/google`, and the firewall blocks Google Fonts. `npm run dev` falls back to another font and works. See `docs/dev-container/PLAN.md`.
- Anything inside the box can still leak: the repo and any token you put in. Keep secrets out; use repo-scoped, short-lived tokens.
- Allowed hosts are a way out too (for example GitHub, if you log `gh` in, or with any token the agent is given), and DNS lookups still leave the box. GitHub's ranges are allowed on every port, so SSH to GitHub works too.
- The repo folder is shared with your machine, so the agent's edits land on your disk. Git is the undo button.
- What the box writes can run on your machine: `.git/hooks`, `package.json` scripts and `.vscode/` are all in the shared folder. Read the diff before you run the repo outside the box.

Use it on repos you trust, and watch what the agent does.

Last verified: 2026-11-04 with devcontainers CLI 0.89.0, Docker 29.9.2 (Compose 5.6.1) and Claude Code 2.1.311
