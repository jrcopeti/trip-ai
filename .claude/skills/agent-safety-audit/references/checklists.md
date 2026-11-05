# Where to look, per platform

Platforms change fast. For the current names of settings, read the linked official docs;
this file only says which settings open which leg.

## Claude Code on your machine

Docs: https://code.claude.com/docs/en/security · https://code.claude.com/docs/en/settings ·
https://code.claude.com/docs/en/hooks · https://code.claude.com/docs/en/devcontainer

| Look at | Opens |
|---|---|
| Runs directly on your machine (not in a container) | private data: your home folder, SSH keys, cloud logins, other repos |
| `--dangerously-skip-permissions` / broad `permissions.allow` | removes the human check on every leg |
| `.mcp.json`, `claude mcp list` | each MCP server can be input, data and a way out — check its tools one by one |
| `WebFetch` / `WebSearch` allowed | untrusted input (web pages) and a way out (a URL with data in it) |
| Devcontainer firewall (`init-firewall.sh`) | the way out: default-deny with an allowlist, or open |
| Secrets inside the container (env, mounted files, `gh` login) | private data even inside the box |
| `/var/run/docker.sock` mounted | the whole host |

## Claude Code routines (cloud)

Docs: https://code.claude.com/docs/en/routines · https://code.claude.com/docs/en/cloud-environments

| Look at | Opens |
|---|---|
| Connectors on the routine, and the account behind each one | input (read tools), private data (mailbox scope), a way out (send/forward/post tools) — connector traffic skips the network allowlist. Every tool of an included claude.ai connector runs: a per-tool limit does not hold in a routine (tested 2026-10-05: a Gmail connector limited to three tools still ran `list_labels`). Do not recommend per-tool limits. Recommend: remove every connector the routine doesn't need, and connect the rest to a dedicated account or inbox with nothing private in it. |
| Environment network: None / Trusted / Custom, and each allowed domain | the way out; whole domains like `discord.com` allow any account on them |
| Environment variables | readable by every command in the session |
| Number of repositories | more than one → the repos' hooks and permission rules don't load |
| Trigger payload (API /fire, GitHub event) | untrusted input |
| Pushes, PRs, comments on a public repo | a way out that publishes before any human reads it |

## Hermes

Docs: https://hermes-agent.nousresearch.com/docs/user-guide/security ·
/docs/user-guide/configuration · /docs/user-guide/features/mcp ·
/docs/user-guide/features/skills

| Look at | Opens |
|---|---|
| `terminal.backend` (local vs docker) and `docker_volumes` | what the model's commands can read — each mount is private data |
| `docker_network` / egress | the way out; default Docker networking is open |
| `docker_forward_env`, mounted credential files (gh, app passwords) | private data inside the sandbox |
| `approvals.mode`, `cron_mode`, hooks (`pre_tool_call`) | how much is checked before commands run |
| `mcp_servers` and their `tools.include` | input, data and ways out per tool |
| `skills.external_dirs` that are writable + a job that pushes them | a way out and a way in (persistent poisoning) |
| Messaging platforms and allowed users | who can send it instructions |
| Cron jobs that read inboxes, issues or the web | untrusted input on a schedule, unattended |

## Agents in GitHub Actions

Docs: https://docs.github.com/en/actions/security-for-github-actions ·
https://code.claude.com/docs/en/github-actions

| Look at | Opens |
|---|---|
| Triggers: `issues`, `issue_comment`, `pull_request_target` from forks | untrusted input from anyone |
| `permissions:` of the workflow / token | the way out (write to repo, comments) and private data |
| Secrets passed to the step | private data |
| Network egress of the runner | open by default |
