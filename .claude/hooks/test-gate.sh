#!/usr/bin/env bash
# Hook 3 · The test report (observes, never blocks).
# Claude Code: Stop.
# Runs the tests when the agent finishes with a dirty tree. Red -> a warning to the owner in the
# transcript, while the agent still stops: a red test first and a review finding are allowed. Green -> silent.
TEST_CMD=${TEST_CMD:-"npm test"}            # 🙋 your fast test command

input=$(cat)
# Plain JSON, as jq is the thing missing.
if ! command -v jq >/dev/null; then
  echo '{"systemMessage": "Test report: jq is missing, so the tests did not run."}'
  exit 0
fi
dir=$(jq -r '.cwd // empty' <<<"$input"); [ -n "$dir" ] && cd "$dir" 2>/dev/null

# Nothing changed in the repo (a chat, a question) -> nothing to test.
git rev-parse --is-inside-work-tree >/dev/null 2>&1 || exit 0
[ -z "$(git status --porcelain --untracked-files=no 2>/dev/null)" ] && [ -z "$(git ls-files --others --exclude-standard 2>/dev/null)" ] && exit 0

out=$(bash -c "$TEST_CMD" 2>&1) && exit 0
out=$(sed $'s/\x1b\\[[0-9;]*m//g' <<<"$out")
# Vitest's failed tests and totals; another runner's output tail.
summary=$(grep -E '×|^ *Tests +[0-9]' <<<"$out" | head -12)
[ -z "$summary" ] && summary=$(tail -8 <<<"$out")
# systemMessage reaches the owner only; decision "block" would keep the agent working.
jq -n --arg c "$TEST_CMD" --arg s "$summary" \
  '{systemMessage: ("Test report: red (" + $c + "). The agent was not told.\n" + $s)}'
exit 0
