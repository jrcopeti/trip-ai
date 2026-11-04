#!/usr/bin/env bash
# Runs in the box at every start, after the firewall (postStartCommand), as the node user.
# Gives Claude Code in the box its own copy of your second brain: clones your brain
# repo into the box's brain volume the first time, pulls it on every later start, then runs the
# brain's install script, node install.mjs (skills + pointer line in /home/node/.claude). The box
# shares nothing with your laptop's brain folder: it pushes with the brain's sync script
# (node sync.mjs), and your laptop gets that at its next pull.
# Never stops the box from starting: without a brain it says so in one line.
set -uo pipefail
brain=/home/node/brain

if [ -z "${BRAIN_REPO:-}" ] || [ ! -f "${BRAIN_SSH_KEY:-}" ]; then
  echo "brain: none in this box (needs BRAIN_REPO in ~/.config/brain/box.env and the deploy key ~/.config/brain/box_deploy_key, see .devcontainer/README.md)"
  exit 0
fi

# The deploy key is used for these git commands only, never in a git config.
export GIT_SSH_COMMAND="ssh -i $BRAIN_SSH_KEY -o IdentitiesOnly=yes -o StrictHostKeyChecking=accept-new"
mkdir -p -m 700 /home/node/.ssh
if [ ! -d "$brain/.git" ]; then
  if ! git clone -q "$BRAIN_REPO" "$brain"; then
    echo "brain: could not clone $BRAIN_REPO (see above), so the box starts without a brain"
    exit 0
  fi
  echo "brain: cloned $BRAIN_REPO"
elif ! git -C "$brain" pull -q --rebase --autostash; then
  echo "brain: could not pull (see above); the box uses the copy it has. Fix it in the box: cd $brain && git status"
fi
if [ ! -f "$brain/install.mjs" ]; then
  echo "brain: $brain has no install.mjs (made from the brain template before 2026-10-05): copy install.mjs and sync.mjs from github.com/dmoka/brain-template into your brain repo, then start the box again"
  exit 0
fi
CLAUDE_DIR=/home/node/.claude node "$brain/install.mjs" || echo "brain: install.mjs failed (see above)"
