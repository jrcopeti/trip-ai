# The box (a dev container)

A Docker container you work in, so an agent running with full permissions can only damage the box.
Based on [Anthropic's reference dev container](https://github.com/anthropics/claude-code/tree/main/.devcontainer).

**Use it from the terminal:**

```bash
./box                      # start the box if needed, then Claude Code inside it
./box npm test             # run any command inside the box
./box bash                 # a shell inside the box
./box --docker bash       # the box on its own Docker engine: anything that needs Docker runs inside
```

Inside, Claude Code runs with `--dangerously-skip-permissions`: the box is the safety, and it runs as the non-root `node` user, which that flag requires. First run: `./box npm ci`, then `./box npx prisma db push`.
Prefer an editor? VS Code and Cursor open the same box with "Reopen in Container".

**The app in the box.** The box is two containers (`compose.yaml`): `app`, where you and the agent work, and `postgres`, its own Postgres 16 (as CI). `DATABASE_URL` points at `postgres:5432`, so `npx prisma db push` and `npm run dev` work inside the box. Open http://localhost:3000 on your machine: port 3000 is published on 127.0.0.1 only. Port 3000 taken? Start the box with `BOX_PORT=3200 ./box` and open http://localhost:3200 (a running box keeps its port: to change it, run `docker compose -p <repo-folder>_devcontainer down`, e.g. `trip-ai_devcontainer`, then `./box` again; the box database survives). The box database is separate from the `trip-ai-e2e-pg` container, and it is not published to your machine.

**No production database, no API keys.** The box mounts `.env` (the production database URL) and `.env.local` (the API keys) as empty files. They stay as they are on your machine. Anthropic has no key in the box, and the firewall blocks GeoNames, OpenWeather, Unsplash and Neon, so run the app on fixtures: `E2E_FIXTURES=1 npm run dev`.

**The e2e suite in the box.** `E2E_DATABASE_URL` points at a second database on the same Postgres, `trip_ai_e2e`, which `seed:e2e` may wipe: `scripts/localDatabase.ts` accepts the host name `postgres`, so `ALLOW_REMOTE_E2E_SEED` stays unset.

```bash
./box npm run db:push:e2e
./box npm run seed:e2e
./box npm run build
./box npm run test:e2e
```

**A second clone.** The box's compose project takes its name from the repo folder: `<repo-folder>_devcontainer`. Two clones in folders with the same name (two `trip-ai` folders) share one project, so `./box` in the second clone fails with "Dev container not found" or uses the first clone's containers. Clone into a folder with another name (`git clone <url> trip-ai-2`) and give it its own port (`BOX_PORT=3200 ./box`). `COMPOSE_PROJECT_NAME=<name> ./box` works only if you set it on every `./box` call: one call without it, after the box stopped, joins the first clone's project again.

**MCP servers in the box.** The servers are in the tracked `.mcp.json`, so the box and your machine run the same ones. On your machine, run `claude` and approve them when it asks. In the box, `./box`'s Claude Code runs them with no approval saved, so `claude mcp list` there says "Pending approval" even when they work. A running box picks up the firewall and the launcher only when recreated: `docker compose -p <repo-folder>_devcontainer down`, then `./box`.

- **Playwright MCP.** The image has version 0.0.83's browser and Chromium's system libraries, both installed at build time. The firewall allows no browser downloads, so the version is pinned in `.mcp.json` and the `Dockerfile`: `@latest` asks for a newer browser the box cannot fetch. The box is Linux arm64 on Apple Silicon, where the default Chrome channel does not exist, hence `--browser chromium`. On your machine, install the same browser once: `npx @playwright/mcp@0.0.83 install-browser chrome-for-testing`.
- **Chrome DevTools MCP.** Linux arm64 has no Chrome, so the image puts a launcher at Chrome's path that runs Playwright's Chromium, headless and without Chromium's sandbox. On your machine the same entry opens your real Chrome.
- **Context7.** Remote, at `mcp.context7.com`, which the firewall allows. It needs no key, and what the agent sends it leaves the box: see "What it does not do".

**The brain in the box.** The box keeps its own copy of your second brain, in its own volume (`/home/node/brain`), cloned from your brain repo. It never mounts the brain folder on your laptop. Every time the box starts, `brain-start.sh` clones the brain the first time and pulls it after that, then runs the brain's install script (`node install.mjs`) with `CLAUDE_DIR=/home/node/.claude`, so Claude Code in the box gets the brain's skills and the pointer line. Your laptop's `~/.claude` is not touched. In the box, `node sync.mjs` (in `/home/node/brain`) commits and pushes with the box's own deploy key; your laptop gets the box's changes at its next pull.

🙋 **Give the box its deploy key (once):**
1. Make a key pair just for the box, with no passphrase, and name your brain repo:
   ```bash
   mkdir -p ~/.config/brain && chmod 700 ~/.config/brain
   ssh-keygen -t ed25519 -N "" -C "brain box" -f ~/.config/brain/box_deploy_key
   echo 'BRAIN_REPO=git@github.com:<you>/brain.git' > ~/.config/brain/box.env
   ```
2. GitHub → your brain repo → Settings → **Deploy keys** → **Add deploy key**. Paste `~/.config/brain/box_deploy_key.pub`, tick **Allow write access**, add it. GitHub accepts that key for this one repo only.
3. The box reads the folder when it is created. If it is running, run `docker compose -p <repo-folder>_devcontainer down` (e.g. `trip-ai_devcontainer`), then `./box`. The brain volume survives `down`.

- The box mounts `~/.config/brain` read-only at `/home/node/.config/brain` (another folder: `BOX_BRAIN_CONFIG=/path ./box`). The key is used per command (`brain-start.sh`, the brain's `sync.mjs`, through `GIT_SSH_COMMAND` and `BRAIN_SSH_KEY`), never in a git config.
- No `box.env` or no key: the box starts as before, without a brain, and its start log says so in one line. A clone or pull that fails never stops the box either.
- `./box --docker` is a separate box with its own brain volume. Its Colima VM also shares `~/.config/brain`, read-only. A VM that shares anything else is refused by `check-engine.sh`: stop it (`colima stop tripai-box`) and run `./box --docker` again.

**Docker in the box (`./box --docker`).** The plain box runs this repo's suites without Docker. Anything that does need it (Testcontainers, a test that starts its own container) runs here. Your normal Docker engine cannot go into the box: Docker Desktop's VM shares your home folder, so `docker run -v ~/.ssh:/x` through its socket would read your keys. `./box --docker` runs the box on a separate engine instead: a [Colima](https://github.com/abiosoft/colima) VM (`tripai-box`) that shares only this repo with your machine. The box gets that VM's Docker socket, so every container it starts can see only what the VM sees: this repo, and nothing else from your machine.

One-time setup (macOS 13+; Docker Desktop's `docker` CLI is enough, the engine is not used):

```bash
brew install colima
./box --docker npm ci      # first run: starts the VM (4 CPUs, 4 GiB RAM), builds the box in it
./box --docker npx vitest run --maxWorkers=2    # the VM is small: at full parallelism, form tests time out
```

- `./box --docker` starts the VM when it is not running (about 30 s), refuses any VM that shares more than this repo and the brain settings folder (`docker/check-engine.sh`), and leaves your default Docker context and `~/.ssh/config` unchanged. Plain `./box` stays on your normal engine, without a socket.
- The Docker box is a separate box: its own image, `node_modules`, Claude Code sign-in and database, on the VM's disk. Port: the same `BOX_PORT` rule; the VM forwards it to 127.0.0.1 on your machine. Run one box at a time on a given port.
- The VM has its own firewall (`init-firewall.sh --engine`). The box keeps its allowlist (GitHub, npm, Claude, Context7). Every other container reaches only the other containers: no internet, no npm, no ports on your machine (`host.docker.internal`). Testcontainers needs no more: the engine pulls its images.
- Stop it: `colima stop tripai-box`. Remove it and its disk: `colima delete --data tripai-box`. Another clone of the repo: `BOX_DOCKER_PROFILE=<name> ./box --docker` (one VM per repo folder).
- VS Code and Cursor: "Reopen in Container" offers "Trip AI Sandbox + Docker (Colima)" (`docker/devcontainer.json`). Start the VM with `./box --docker true`, which also builds the image, and point the editor at the `colima-tripai-box` Docker context; on any other engine the box refuses to start.
- Linux and WSL: `./box --docker` stops with a message, because its VM uses Apple's virtualization (`--vm-type vz`). Run the Docker tasks outside the box, on your own Docker Engine. Never mount your host's own Docker socket into the box: on Linux that socket is root on your machine.

**What `--docker` does not protect**
- The socket makes the agent root in the VM. It can open a root shell in the box (`docker exec -u 0`) and remove the box's own firewall; the VM's firewall then still limits the box to the allowlist.
- A container started with `--privileged` or `--network host` skips the VM's firewall: it reaches the internet and the ports on your machine (`host.docker.internal`), and it can remove the VM's firewall.
- A container bound to the repo through the socket can still write `box` and `.devcontainer/`, which your machine runs on the next `./box`.
- A container that shares the box's network (`--network container:<box>`) has the box's allowlist.
- What stays out of reach in every case: your files. The VM shares only this repo and the brain settings folder, so no container sees the rest of your home folder, `~/.ssh` or Docker Desktop's socket.
- **`.env` and `.env.local` are not out of reach.** The VM shares the real repo folder, so a container started through the socket can bind it and read both: the empty mounts stop only the box itself. Don't run `--docker` from a folder that holds them: use a clone with no secrets (`git clone <url> trip-ai-box`).
- Proposed follow-up: a Docker authorization plugin in the VM that refuses privileged containers, host namespaces, extra capabilities, binds outside the repo and host-network builds.

**No claude.ai connectors.** Signing in to Claude in the box would also bring your claude.ai connectors (Gmail, Drive, Calendar, ...) into Claude Code. The box turns them off (`ENABLE_CLAUDEAI_MCP_SERVERS=false` in `devcontainer.json`): the box limits what the agent can reach, and a connector would reach past the firewall.

**What it does**
- The agent sees this repo, without `.env` and `.env.local`, and `~/.config/brain` read-only, and nothing else from your machine: no other home folder files, no `~/.ssh`. Plain `./box` has no Docker socket; `./box --docker` has the socket of a VM that shares only this repo and that folder.
- `node_modules` and `.next` are the box's own volumes, so its Linux install and build never mix with yours.
- Outgoing traffic is default-deny. Allowed: GitHub, the npm registry, Claude's API and sign-in, Context7's MCP host, and the box's own Postgres (`postgres:5432`). Everything else is blocked (`init-firewall.sh`, checked on every start).
- A firewall that fails at start blocks all traffic, and `./box` runs nothing unless the firewall's rules are in place. To recover: `docker compose -p <repo-folder>_devcontainer down`, then `./box`. An editor's "Reopen in Container" gets the same block, not the check.
- `box` and `.devcontainer/` are read-only in the box: your machine runs them on the next `./box`. Change them from outside the box. On your machine, `./box` reads no `.npmrc` from the repo.
- The agent cannot change the firewall: its only root commands are the firewall script itself and the `chown` of those two volumes (plain `./box`).

**What it does not do**
- Anything inside the box can still leak: the repo, the box's copy of your brain, and any token you put in. Keep secrets out; use repo-scoped, short-lived tokens.
- The brain's deploy key is readable in the box: anything in the box can read it, and read and write the brain repo with it (and nothing else). What the box pushes to the brain, every agent that pulls the brain reads next, including agents on your laptop. Read the brain's `git log -p` for changes to `skills/` and its scripts (`sync.mjs`, `install.mjs`) before you run them on your laptop.
- Allowed hosts are a way out too (for example GitHub, if you log `gh` in, or with any token the agent is given, or Context7, which takes free text with no key), and DNS lookups still leave the box. GitHub's ranges are allowed on every port, so SSH to GitHub works too (the brain's deploy key uses it).
- The repo folder is shared with your machine, so the agent's edits land on your disk. Git is the undo button.
- What the box writes can run on your machine, with no step from you: Git on your Mac, including your editor's background `git status`, runs commands named in `.git/config`, `.git/commondir` or a nested repo's config, and `.git/hooks`, `.claude/settings.json`, `.claude/hooks/`, `package.json` scripts and `.vscode/` can run too. `git diff` shows none of `.git`. Read-only mounts don't close this; a separate clone or "Reopen in Container" does.
- `./box --docker` is weaker on the network: see "What `--docker` does not protect" above.

Use it on repos you trust, and watch what the agent does.

Last verified: 2026-11-04 with devcontainers CLI 0.89.0, Docker 29.9.2 (Compose 5.6.1), Colima 0.10.3 and Claude Code 2.1.311. The brain over SSH with a real deploy key, and the editor, are not verified yet
