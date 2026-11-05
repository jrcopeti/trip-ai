#!/usr/bin/env bash
# Hook 5 · Load context at session start (observes).
# Claude Code: SessionStart (plain stdout is added to the context).
# Hermes: pre_llm_call, only on the first turn (returns {"context": ...}).
# Why: the agent starts every session knowing where things stand, without you retyping it.
DECISIONS_FILE=${DECISIONS_FILE:-"docs/decisions.md"}   # 🙋 your decisions file (skipped if missing)

# Without jq this hook cannot read the event: show the error (exit 1 never blocks).
command -v jq >/dev/null || { echo "jq is missing: install it (see the setup guide). The session-context hook loaded nothing." >&2; exit 1; }
input=$(cat)
event=$(jq -r '.hook_event_name // empty' <<<"$input")
if [ "$event" = "pre_llm_call" ] && [ "$(jq -r '.extra.is_first_turn // false' <<<"$input")" != "true" ]; then exit 0; fi
dir=$(jq -r '.cwd // empty' <<<"$input"); [ -n "$dir" ] && cd "$dir" 2>/dev/null
git rev-parse --is-inside-work-tree >/dev/null 2>&1 || exit 0

ctx="## Where things stand
Branch: $(git branch --show-current)
$(git status --short | head -30)

Last commits:
$(git log --oneline -8)"
[ -f "$DECISIONS_FILE" ] && ctx+=$'\n\n'"Recent decisions ($DECISIONS_FILE, last 40 lines):"$'\n'"$(tail -40 "$DECISIONS_FILE")"

if [ "$event" = "pre_llm_call" ]; then jq -n --arg c "$ctx" '{context: $c}'; else echo "$ctx"; fi
exit 0
