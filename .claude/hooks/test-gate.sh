#!/usr/bin/env bash
# Hook 3 · The test gate (a gate on "done").
# Claude Code: Stop.  Hermes: pre_verify (fires when the agent edited code and wants to finish).
# Why: the agent says "all tests pass" when some are still red; this runs them for real.
# Red -> the agent keeps working with the failures. Green -> silent, costs no context.
TEST_CMD=${TEST_CMD:-"npm test"}            # 🙋 your fast test command
MAX_ROUNDS=${MAX_ROUNDS:-3}                 # after this many red rounds, let it stop and tell you

input=$(cat)
# Without jq the gate cannot run: block once with the reason (plain JSON, no jq needed),
# and let the agent stop on the next try (stop_hook_active), so it is never trapped.
if ! command -v jq >/dev/null; then
  grep -Eq '"stop_hook_active"[[:space:]]*:[[:space:]]*true' <<<"$input" && exit 0
  echo '{"decision": "block", "reason": "jq is missing: install it (see the setup guide). The test gate did not run the tests. Tell the human, and do not say the tests pass."}'
  exit 0
fi
session=$(jq -r '.session_id // "none"' <<<"$input")
dir=$(jq -r '.cwd // empty' <<<"$input"); [ -n "$dir" ] && cd "$dir" 2>/dev/null

# Nothing changed in the repo (a chat, a question) -> nothing to test.
git rev-parse --is-inside-work-tree >/dev/null 2>&1 || exit 0
[ -z "$(git status --porcelain --untracked-files=no 2>/dev/null)" ] && [ -z "$(git ls-files --others --exclude-standard 2>/dev/null)" ] && exit 0

# Loop guard: stop_hook_active (Claude Code) is true when the agent is already continuing
# because of this hook; count rounds so a test that can never pass does not trap it forever.
counter="${TMPDIR:-/tmp}/test-gate-$session"
if [ "$(jq -r '.stop_hook_active // false' <<<"$input")" != "true" ] && [ "$(jq -r '.hook_event_name' <<<"$input")" = "Stop" ]; then
  echo 0 > "$counter"
fi
rounds=$(cat "$counter" 2>/dev/null || echo 0)

out=$(bash -c "$TEST_CMD" 2>&1)
if [ $? -eq 0 ]; then rm -f "$counter"; exit 0; fi
if [ "$rounds" -ge "$MAX_ROUNDS" ]; then
  rm -f "$counter"
  echo "{\"systemMessage\": \"Test gate: still red after $MAX_ROUNDS rounds, letting the agent stop. Check the tests yourself.\"}"
  exit 0
fi
echo $((rounds + 1)) > "$counter"
# One JSON shape both harnesses accept: Claude Code Stop and Hermes pre_verify read decision/reason.
jq -n --arg t "$(tail -c 3000 <<<"$out")" --arg c "$TEST_CMD" \
  '{decision: "block", reason: ("The tests are red (" + $c + "). You may not finish until they pass. Fix the code. Change a test only if the requirement changed, and say why. Output tail:\n" + $t)}'
exit 0
