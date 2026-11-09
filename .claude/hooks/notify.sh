#!/usr/bin/env bash
# Bonus hook B · Tell me when you need me (observes, never blocks).
# Claude Code: Notification (waiting for you) and Stop (done).
# Hermes: not needed; it already reports to your chat (Discord, Telegram…).
# Why: you stop watching the terminal; it pings you when it's done or waiting.
NTFY_TOPIC=${NTFY_TOPIC:-""}   # 🙋 optional: a private ntfy.sh topic name for phone pushes

# Without jq this hook cannot read the event: show the error (exit 1 never blocks).
command -v jq >/dev/null || { echo "jq is missing: install it (see the setup guide). The notify hook sent nothing." >&2; exit 1; }
input=$(cat)
event=$(jq -r '.hook_event_name // "Stop"' <<<"$input")
msg=$([ "$event" = "Notification" ] && jq -r '.message // "Claude needs you"' <<<"$input" || echo "Claude is done")
repo=$(basename "$(jq -r '.cwd // "."' <<<"$input")")

if command -v afplay >/dev/null 2>&1; then afplay /System/Library/Sounds/Ping.aiff >/dev/null 2>&1 & fi
if [ -n "$NTFY_TOPIC" ]; then curl -s -m 5 -d "$repo: $msg" "https://ntfy.sh/$NTFY_TOPIC" >/dev/null 2>&1 & fi
exit 0
