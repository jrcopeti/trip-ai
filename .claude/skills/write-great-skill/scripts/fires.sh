#!/usr/bin/env bash
# fires.sh — does a fresh Claude Code session pick this skill by itself?
# Usage: scripts/fires.sh <skill-name> "<request>" ... [--not "<request>" ...]
#   Requests before --not should fire the skill; requests after --not should not.
#   Run it in the folder where the skill is installed (the repo, for .claude/skills/).
#   Each request runs in a new `claude -p` session that cannot write files or run commands.
#   FIRES_ONLY_PROJECT=1 loads only project and bundled skills (no ~/.claude skills, no plugins).
# Prints one line per request, the skills that were picked, two scores, and PASS or FAIL.
set -euo pipefail

[ $# -ge 2 ] || { sed -n '3,8p' "$0" | sed 's/^# \{0,1\}//'; exit 2; }
command -v claude >/dev/null || { echo "claude CLI not found" >&2; exit 2; }
name=$1; shift

extra=()
[ "${FIRES_ONLY_PROJECT:-0}" = 1 ] && extra+=(--setting-sources project,local)

pos_ok=0; pos=0; neg_ok=0; neg=0; expect=fire
for req in "$@"; do
  if [ "$req" = "--not" ]; then expect=quiet; continue; fi
  out=$(claude -p "$req" "${extra[@]+"${extra[@]}"}" --output-format stream-json --verbose \
        --max-turns 3 --permission-mode default \
        --disallowedTools Write Edit NotebookEdit Bash 2>/dev/null || true)
  picked=$(printf '%s' "$out" | grep -o '"name":"Skill","input":{"skill":"[^"]*"' \
           | sed 's/.*"skill":"//; s/"$//' | sort -u | paste -sd, - || true)
  if printf '%s\n' "${picked//,/$'\n'}" | grep -qxE "([a-z0-9-]+:)?$name"; then hit=1; else hit=0; fi
  if [ "$expect" = fire ]; then
    pos=$((pos + 1))
    if [ $hit = 1 ]; then pos_ok=$((pos_ok + 1)); echo "FIRED    ok   $req"
    else echo "MISSED   FAIL $req   (picked: ${picked:-none})"; fi
  else
    neg=$((neg + 1))
    if [ $hit = 0 ]; then neg_ok=$((neg_ok + 1)); echo "QUIET    ok   $req   (picked: ${picked:-none})"
    else echo "FIRED    FAIL $req   (should not fire)"; fi
  fi
done
echo "should fire: $pos_ok/$pos fired"
[ $neg -gt 0 ] && echo "should not fire: $neg_ok/$neg stayed quiet"
if [ $pos_ok = $pos ] && [ $neg_ok = $neg ]; then echo PASS; else echo FAIL; exit 1; fi
