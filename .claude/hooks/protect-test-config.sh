#!/usr/bin/env bash
# Bonus hook A · Protect the test config (a gate).
# Claude Code: PreToolUse, matcher "Edit|Write|MultiEdit|Bash".  Hermes: pre_tool_call, matcher "write_file|patch|terminal".
# Why: an agent that can't make the tests pass may "fix" the setup instead; the suite then
# looks green while it tests less. It checks shell commands too: blocked on Edit, agents try sed.
# Without jq every check below reads nothing and lets the call through: block instead.
command -v jq >/dev/null || { echo "Blocked: jq is missing: install it (see the setup guide)." >&2; exit 2; }
input=$(cat)
path=$(jq -r '.tool_input.file_path // .tool_input.path // empty' <<<"$input")
cmd=$(jq -r '.tool_input.command // empty' <<<"$input")
PROTECTED='((vitest|jest|playwright|stryker)[^/[:space:]]*\.config\.[a-z]+|stryker[^/[:space:]]*\.json|\.github/workflows/[^/[:space:]]+|\.claude/[^[:space:]]*|\.hermes/[^[:space:]]*)'
msg="is test, CI or agent config. Don't change the test setup; if your test can't run without it, stop and tell me why."

if [ -n "$path" ] && grep -Eq "(^|/)$PROTECTED\$" <<<"$path"; then
  echo "Blocked: $path $msg" >&2; exit 2
fi
# A shell command that names a protected file AND writes (sed -i, redirect, tee, mv, cp, rm, perl -i, truncate).
# Redirects to /dev/null and fd copies (2>&1) are not writes: drop them before the check.
cmd=$(sed -E 's/[0-9]*&?>+[[:space:]]*\/dev\/null//g; s/[0-9]*>&[0-9]+//g' <<<"$cmd")
if [ -n "$cmd" ] && grep -Eq "$PROTECTED" <<<"$cmd" \
   && grep -Eq '(sed[[:space:]]+(-[a-zA-Z]*i|--in-place)|perl[[:space:]]+-[a-zA-Z]*i|>|tee[[:space:]]|(^|[;&|[:space:]])(mv|cp|rm|truncate|install)[[:space:]])' <<<"$cmd"; then
  echo "Blocked: that command writes to a file that $msg" >&2; exit 2
fi
exit 0
