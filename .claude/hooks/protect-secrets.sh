#!/usr/bin/env bash
# Hook 2 · Keep secrets out (a gate).
# Claude Code: PreToolUse, matcher "Read|Edit|Write|MultiEdit|Bash".
# Hermes: pre_tool_call, matcher "read_file|write_file|patch|terminal".
# Why: whatever the agent reads goes into its window, and the window goes to the model provider.
# Without jq every check below reads nothing and lets the call through: block instead.
command -v jq >/dev/null || { echo "Blocked: jq is missing: install it (see the setup guide)." >&2; exit 2; }
input=$(cat)
path=$(jq -r '.tool_input.file_path // .tool_input.path // empty' <<<"$input")
cmd=$(jq -r '.tool_input.command // empty' <<<"$input")

# A secrets file is .env or .env.<anything>, except the documented examples.
is_secret() { grep -Eq '(^|/)\.env(\.[A-Za-z0-9_-]+)?$' <<<"$1" && ! grep -Eq '\.env\.(example|sample|template)$' <<<"$1"; }

if [ -n "$path" ] && is_secret "$path"; then
  echo "Blocked: $path holds secrets. Read .env.example instead: it lists every variable without the values." >&2
  exit 2
fi
if [ -n "$cmd" ]; then
  for word in $cmd; do
    word=${word//[\"\'\;]/}
    if is_secret "$word"; then
      echo "Blocked: the command touches $word, which holds secrets. Use .env.example to see which variables exist." >&2
      exit 2
    fi
  done
fi
exit 0
