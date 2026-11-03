#!/bin/sh
# Asks the user before anything AGENTS.md says needs their go-ahead: a commit, a push, a PR's merge
# or text, a repository write, a deploy, a worktree. Skipped in GitHub Actions, where nobody can
# answer and `@claude` must still be able to commit. Quoted text and heredoc bodies are ignored,
# so a command that only mentions one of these doesn't ask.
[ -n "$GITHUB_ACTIONS" ] && exit 0

ask() {
  printf '%s\n' '{"hookSpecificOutput":{"hookEventName":"PreToolUse","permissionDecision":"ask","permissionDecisionReason":"AGENTS.md: this needs the user'"'"'s go-ahead, after they have reviewed the diff."}}'
  exit 0
}

# Without jq the command can't be read, so nothing would ever ask.
command -v jq >/dev/null 2>&1 || ask

input=$(cat)
tool=$(printf '%s' "$input" | jq -r '.tool_name // empty') || ask
# Heredocs first: a quote inside one would otherwise pair with a quote outside it.
UNQUOTED='
  (.tool_input.command // "")
  | gsub("<<-?\\s*[\"\\x27]?(?<tag>\\w+)[\"\\x27]?(?<rest>[^\\n]*)\\n([\\s\\S]*?\\n)?\\s*\\k<tag>(\\n|$)"; "\(.rest)\n")
  | gsub("\"(\\\\.|[^\"\\\\])*\"|\\x27[^\\x27]*\\x27"; "")
'
command=$(printf '%s' "$input" | jq -r "$UNQUOTED") || ask
isolation=$(printf '%s' "$input" | jq -r '.tool_input.isolation // empty') || ask

[ "$tool" = "EnterWorktree" ] && ask
[ "$tool" = "Agent" ] && [ "$isolation" = "worktree" ] && ask

S='[[:space:]]+'
START='(^|[^[:alnum:]_-])'
END='([^[:alnum:]_-]|$)'
# Global options come before the subcommand: `git -C <path> commit`, `git --no-pager push`.
GIT="git($S-[^[:space:]]+($S[^-[:space:]][^[:space:]]*)?)*$S(commit|push|worktree${S}add)"
GH_WRITE="gh${S}pr${S}(create|merge|edit|comment|review|close|reopen|ready)|gh${S}repo${S}edit"
# `-f`, `-F` and `--input` make `gh api` a POST even without `-X`.
GH_API="gh${S}api$S(.*[[:space:]])?(-X|--method|-f|-F|--field|--raw-field|--input)([[:space:]=].*|$)"
VERCEL="vercel($S-[^[:space:]]+)*($S(deploy|promote|rollback)|$S--prod)"
# What `bash -c` runs is quoted, so it can't be read once the quotes are gone.
SHELL_C="(bash|sh|zsh)($S-[^[:space:]]+)*$S-[[:alnum:]]*c"

printf '%s' "$command" | grep -Eq "$START($GIT|$GH_WRITE|$GH_API|$VERCEL|$SHELL_C)$END" && ask
exit 0
