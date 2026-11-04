#!/usr/bin/env bash
# Runs on your machine before the Docker box starts (./box --docker, and initializeCommand in
# docker/devcontainer.json). The box gets the engine's Docker socket, and a socket can bind-mount
# anything its engine can see. So the engine must be a Colima VM that shares only this repo and
# the brain settings folder, which the box mounts read-only anyway.
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd -P)"
brain_config="$(cd "${BOX_BRAIN_CONFIG:-$HOME/.config/brain}" && pwd -P)"
fail() { echo "box --docker: $*" >&2; exit 1; }

name="$(docker info --format '{{.Name}}' 2>/dev/null)" || fail "no Docker engine answers. Start the box with ./box --docker."
case "$name" in
  colima-*) profile="${name#colima-}" ;;
  *) fail "the Docker engine is '$name', not a Colima VM. Its socket would give the box your machine. Start the box with ./box --docker." ;;
esac

# Every folder the VM shares with your machine (virtiofs, 9p or sshfs mounts).
shared="$(colima ssh -p "$profile" -- findmnt -rn -t virtiofs,9p,fuse.sshfs -o TARGET)" ||
  fail "could not list the folders the Colima VM '$profile' shares."
want="$(printf '%s\n' "$repo_root" "$brain_config" | sort -u)"
[ "$(printf '%s\n' "$shared" | sort -u)" = "$want" ] || fail "the Colima VM '$profile' shares:
$shared
It must share only these:
$want
Stop it (colima stop $profile) and run ./box --docker again. Still refused? Delete it (colima delete $profile)."
