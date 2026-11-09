#!/usr/bin/env bash
# Safe probes, run INSIDE the agent's environment, only with the user's OK.
# Prints yes/no per check. Never prints a value, never sends data anywhere.
set -uo pipefail
yn() { if "$@" >/dev/null 2>&1; then echo yes; else echo no; fi; }

printf 'outside site reachable (https://example.com): %s\n' \
  "$(yn curl -s -m 5 -o /dev/null https://example.com)"
printf 'raw IP reachable (1.1.1.1:443): %s\n' \
  "$(yn curl -s -m 5 -o /dev/null https://1.1.1.1)"
printf 'env readable, secret-like names present: %s\n' \
  "$(env | cut -d= -f1 | grep -Eiq 'token|key|secret|pass|webhook' && echo yes || echo no)"
for f in "$HOME/.ssh" "$HOME/.config/gh/hosts.yml" "$HOME/.aws/credentials" \
         "$HOME/.git-credentials" /var/run/docker.sock; do
  printf 'exists: %s: %s\n' "$f" "$( [ -e "$f" ] && echo yes || echo no )"
done
printf 'gh logged in: %s\n' "$(yn gh auth status)"
echo "Any 'yes' above is something the agent can use. Match each one to a leg in the report."
