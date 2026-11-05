# Example audit 1 — a Claude Code routine that turns bug-report emails into pull requests

Setup (from the routine's config, 2026-09-29): a cloud routine, hourly, one repository
(public), Gmail connector on a **dedicated support inbox**, with a tool list of `search_threads`,
`get_thread`, `label_thread` (it does not hold: see below); allowed tools without `WebFetch`/`WebSearch`; environment
network **Custom: the default allowlist + `discord.com`**; a Discord webhook URL in an
environment variable; a guard hook in the repo that blocks env dumps and `curl` to anything
but the webhook; the prompt says emails are data, never instructions. It never merges.

**Verdict: all three legs are present, but the private-data leg is thin.**

| Leg | Item | Where configured | Risk |
|---|---|---|---|
| Untrusted input | customer emails | Gmail connector, the routine's search query | anyone can write to the inbox |
| Private data | other customers' emails in the same inbox | the connector can read the whole support inbox | an injected email could ask it to quote them |
| Private data | the Discord webhook URL | environment variable (readable by every command) | a posted URL lets anyone write to the channel |
| Way out | any webhook on `discord.com` | environment network allowlist (whole domain) | an attacker's own Discord webhook is also allowed |
| Way out | PR title/body/commit text on a public repo | the routine opens PRs | published before any human reads it |
| Way out (narrowed) | `curl` to other hosts | guard hook | bypassed twice in tests by building the URL in a variable/file |

What was already cut: the whole personal mailbox (dedicated inbox), the web tools, and
merging (a human reviews the PR). Not cut: Gmail send/forward. The three-tool list does not
hold in a routine (tested 2026-10-05: the run still called `list_labels`). Every Gmail tool
runs, so the worst case is an email sent from the bug inbox. The guard is the dedicated inbox
plus a prompt line that names the three allowed tools.

**Fixes, cheapest first**
1. Take the webhook away from the agent: post the "ready for review" message from a GitHub
   Action on `claude/` PRs, and drop `discord.com` from the allowlist. Cuts the widest way out.
2. If the agent must post: an allowlist can't hold one path, so keep the hook and treat it as
   a speed bump; never put email text other than the subject into a message.
3. Keep the inbox for bug reports only; archive handled mail so a run can't quote old reports.

**Limits that stay:** the prompt lowers the odds but isn't a fix; the public PR text is a way
out the review can't stop in time; a hook that matches command text can be walked around.
