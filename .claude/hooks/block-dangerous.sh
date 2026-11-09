#!/usr/bin/env bash
# Hook 1 · Block dangerous commands (a gate).
# Claude Code: PreToolUse, matcher "Bash".  Hermes: pre_tool_call, matcher "terminal".
# Why: a rule in a file is advice; this runs every time, whatever the model decides.
# Exit 2 = block; stderr is the reason the agent reads, so it says what to do instead.
# Without jq every check below reads nothing and lets the call through: block instead.
command -v jq >/dev/null || { echo "Blocked: jq is missing: install it (see the setup guide)." >&2; exit 2; }
input=$(cat)
cmd=$(jq -r '.tool_input.command // empty' <<<"$input")
[ -z "$cmd" ] && exit 0

block() { echo "Blocked: $1" >&2; exit 2; }

# rm with both -r and -f, in any flag order (rm -rf, rm -fr, rm -r -f, rm --recursive --force)
if grep -Eq '(^|[;&|( ])rm[[:space:]]+(-[a-zA-Z]*r[a-zA-Z]*f|-[a-zA-Z]*f[a-zA-Z]*r|(-[a-zA-Z]+[[:space:]]+)*(-r|--recursive)[[:space:]]+(-[a-zA-Z]+[[:space:]]+)*(-f|--force)|(-[a-zA-Z]+[[:space:]]+)*(-f|--force)[[:space:]]+(-[a-zA-Z]+[[:space:]]+)*(-r|--recursive))' <<<"$cmd"; then
  block "rm -rf is not allowed. Delete the specific files you mean with rm <file>, or ask me to do it."
fi
# force push (also -f and --force-with-lease: rewriting shared history is a human decision)
if grep -Eq 'git[[:space:]]+push([[:space:]]+[^;&|]*)?[[:space:]](--force|--force-with-lease|-f)([[:space:]=]|$)' <<<"$cmd"; then
  block "force push is not allowed. Push normally, or open a new branch and a pull request."
fi
# dropping or wiping a database
if grep -Eiq '(drop[[:space:]]+(database|schema|table)|truncate[[:space:]]+table|dropdb[[:space:]])' <<<"$cmd"; then
  block "dropping or truncating database objects is not allowed. Write a migration and ask me to review it."
fi
exit 0
