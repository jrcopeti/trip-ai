#!/bin/sh
# Asks the user before a commit, push, PR or worktree. Skipped in GitHub Actions, where nobody
# can answer and `@claude` must still be able to commit.
[ -n "$GITHUB_ACTIONS" ] && exit 0

input=$(cat)
tool=$(printf '%s' "$input" | jq -r '.tool_name // empty')
command=$(printf '%s' "$input" | jq -r '.tool_input.command // empty')

if [ "$tool" = "EnterWorktree" ] ||
  printf '%s' "$command" | grep -Eq '(^|[^[:alnum:]_-])(git[[:space:]]+(commit|push|worktree[[:space:]]+add)|gh[[:space:]]+pr[[:space:]]+create)([^[:alnum:]_-]|$)'; then
  printf '%s\n' '{"hookSpecificOutput":{"hookEventName":"PreToolUse","permissionDecision":"ask","permissionDecisionReason":"AGENTS.md: commits, pushes, PRs and worktrees need the user'"'"'s go-ahead, after they have reviewed the diff."}}'
fi
