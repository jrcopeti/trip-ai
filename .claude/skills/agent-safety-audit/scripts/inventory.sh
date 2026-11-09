#!/usr/bin/env bash
# Read-only inventory of an agent setup, for the safety audit.
# Usage: inventory.sh [path]   (a repo, or a Hermes home like ~/.hermes; default: .)
# Prints config file names, tool/permission lists, network rules and env var NAMES.
# Never prints env values; anything that looks like a secret is redacted.
set -uo pipefail
root="${1:-.}"
cd "$root" 2>/dev/null || { echo "no such path: $root" >&2; exit 2; }

redact() {
  sed -E \
    -e 's#(gh[pousr]_)[A-Za-z0-9_]{10,}#\1<redacted>#g' \
    -e 's#github_pat_[A-Za-z0-9_]{10,}#github_pat_<redacted>#g' \
    -e 's#sk-[A-Za-z0-9_-]{16,}#sk-<redacted>#g' \
    -e 's#xox[abprs]-[A-Za-z0-9-]{10,}#xox?-<redacted>#g' \
    -e 's#AKIA[0-9A-Z]{16}#AKIA<redacted>#g' \
    -e 's#(discord(app)?\.com/api/webhooks/)[^ "'"'"']+#\1<redacted>#g' \
    -e 's#([Bb]earer )[A-Za-z0-9._~+/=-]{8,}#\1<redacted>#g' \
    -e 's#((key|token|secret|password|passwd|api_key|apikey)["'"'"']?[[:space:]]*[:=][[:space:]]*["'"'"']?)[^"'"'"'[:space:],}]{6,}#\1<redacted>#Ig'
}
section() { printf '\n== %s\n' "$1"; }
have() { command -v "$1" >/dev/null 2>&1; }

section "location"
pwd

section "config files present"
for f in .claude/settings.json .claude/settings.local.json .mcp.json CLAUDE.md AGENTS.md \
         .devcontainer/devcontainer.json .devcontainer/Dockerfile .devcontainer/init-firewall.sh \
         config.yaml SOUL.md .env .env.local docker-compose.yml compose.yaml; do
  [ -e "$f" ] && echo "  $f"
done
ls .claude/hooks 2>/dev/null | sed 's#^#  .claude/hooks/#'
ls .github/workflows 2>/dev/null | sed 's#^#  .github/workflows/#'

if [ -f .claude/settings.json ] && have jq; then
  section "Claude Code: permissions and hooks (.claude/settings.json)"
  jq -r '{permissions: .permissions, hook_events: ((.hooks // {}) | keys)}' .claude/settings.json | redact
fi

if [ -f .mcp.json ] && have jq; then
  section "MCP servers (.mcp.json) — each one: input? data? way out?"
  jq -r '(.mcpServers // {}) | to_entries[] | "  \(.key): \(.value.command // .value.url // "?") \((.value.args // []) | join(" "))"' .mcp.json | redact
fi

if [ -f .devcontainer/init-firewall.sh ]; then
  section "devcontainer firewall: allowed hosts"
  grep -Eo '"[a-z0-9.-]+\.[a-z]{2,}"' .devcontainer/init-firewall.sh | sort -u | tr '\n' ' '; echo
  grep -Eq 'DROP|REJECT' .devcontainer/init-firewall.sh && echo "  default-deny: yes" || echo "  default-deny: NOT FOUND"
fi
if [ -f .devcontainer/devcontainer.json ]; then
  section "devcontainer mounts / capabilities"
  grep -Ein 'mounts|docker.sock|runArgs|cap-add|privileged|remoteUser' .devcontainer/devcontainer.json | redact
fi

if ls .github/workflows/*.y*ml >/dev/null 2>&1; then
  section "GitHub Actions: triggers, permissions, secrets used"
  for w in .github/workflows/*.y*ml; do
    echo "  $w"
    grep -En '^on:|^  (issues|issue_comment|pull_request_target|pull_request|push|workflow_dispatch|schedule)' "$w" | sed 's#^#    #'
    grep -En 'permissions:|contents:|pull-requests:|issues:|id-token:' "$w" | sed 's#^#    #'
    grep -Eo 'secrets\.[A-Z0-9_]+' "$w" | sort -u | sed 's#^#    uses #'
  done
fi

if [ -f config.yaml ] && grep -q 'terminal' config.yaml; then
  section "Hermes config (config.yaml)"
  if have python3 && python3 -c 'import yaml' 2>/dev/null; then
    python3 - <<'PY' | redact
import yaml
d = yaml.safe_load(open("config.yaml")) or {}
t = d.get("terminal", {}) or {}
print("  terminal.backend:", t.get("backend"))
print("  docker_volumes:", t.get("docker_volumes"))
print("  docker_network:", t.get("docker_network", "(default: open)"))
print("  docker_forward_env:", t.get("docker_forward_env"))
print("  approvals:", d.get("approvals"))
print("  hooks:", list((d.get("hooks") or {}).keys()))
print("  skills.external_dirs:", (d.get("skills") or {}).get("external_dirs"))
for name, s in (d.get("mcp_servers") or {}).items():
    s = s or {}
    print(f"  mcp {name}: {s.get('url') or s.get('command')} tools.include={((s.get('tools') or {}).get('include'))}")
print("  platforms:", list((d.get("platforms") or {}).keys()))
PY
  else
    grep -En 'backend|docker_volumes|docker_network|forward_env|mode:|external_dirs|mcp_servers|include' config.yaml | redact
  fi
fi

section "env var NAMES in .env files (values never shown)"
for f in .env .env.local .env.production; do
  [ -f "$f" ] && { echo "  $f:"; grep -Eo '^[A-Za-z_][A-Za-z0-9_]*' "$f" | sed 's#^#    #'; }
done

section "secret-like env var NAMES in this shell"
env | cut -d= -f1 | grep -Ei 'token|key|secret|pass|webhook|auth|cred' | sed 's#^#  #' || echo "  none"

echo
echo "Ask the user for what files can't show: attached connectors and their tools, the"
echo "environment's network rule, what runs unattended and what triggers it."
