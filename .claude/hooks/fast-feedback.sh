#!/usr/bin/env bash
# Hook 4 · Fast feedback (observes and hands errors back).
# Claude Code: PostToolUse, matcher "Edit|Write|MultiEdit|Bash" -> runs after every edit,
#   including edits made with a shell command (Edit|Write alone misses those).
# Hermes: pre_verify (shell hooks cannot feed back after each edit; this checks the edited
#         files when the agent wants to finish; per-edit feedback needs a Python plugin).
# Why: the agent sees its mistake seconds after making it, not twenty edits later.
TYPECHECK_CMD=${TYPECHECK_CMD:-"npx tsc --noEmit --pretty false"}   # 🙋 project typecheck (errors are filtered to the edited file)
LINT_CMD=${LINT_CMD:-""}                                           # 🙋 optional, gets the file path appended, e.g. "npx eslint"
EXT_RE='\.(ts|tsx|mts|cts)$'                                      # only check these files

# Without jq this hook cannot read which file changed: say so to the agent (exit 2 on PostToolUse).
command -v jq >/dev/null || { echo "jq is missing: install it (see the setup guide). The fast-feedback hook did not check this edit." >&2; exit 2; }
input=$(cat)
dir=$(jq -r '.cwd // empty' <<<"$input"); [ -n "$dir" ] && cd "$dir" 2>/dev/null
cmd=$(jq -r '.tool_input.command // empty' <<<"$input")
if [ -n "$cmd" ]; then
  # A shell command: only act if it writes files, then find what changed with git.
  grep -Eq '(sed[[:space:]]+(-[a-zA-Z]*i|--in-place)|perl[[:space:]]+-[a-zA-Z]*i|>|tee[[:space:]]|(^|[;&|[:space:]])(mv|cp|patch)[[:space:]])' <<<"$cmd" || exit 0
  files=$( { git diff --name-only; git ls-files --others --exclude-standard; } 2>/dev/null | grep -E "$EXT_RE" | sort -u)
else
  files=$(jq -r '.tool_input.file_path // .tool_input.path // empty, (.extra.changed_paths[]? // empty)' <<<"$input" | grep -E "$EXT_RE" | sort -u)
fi
[ -z "$files" ] && exit 0

report=""
tc=$(bash -c "$TYPECHECK_CMD" 2>&1)
for f in $files; do
  rel=${f#"$PWD/"}
  errs=$(grep -F "$rel" <<<"$tc" | head -20)
  [ -n "$errs" ] && report+="Type errors in $rel:"$'\n'"$errs"$'\n'
  if [ -n "$LINT_CMD" ]; then
    lint=$(bash -c "$LINT_CMD \"$f\"" 2>&1) || report+="Lint errors in $rel:"$'\n'"$(head -20 <<<"$lint")"$'\n'
  fi
done
[ -z "$report" ] && exit 0
jq -n --arg r "$report" '{decision: "block", reason: ("Fix these before you go on:\n" + $r)}'
exit 0
