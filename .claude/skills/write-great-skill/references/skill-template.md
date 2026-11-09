# Skill template

Copy the parts you need. Replace every `<…>`. Delete a section that has nothing real in it.

## Folder

```
<name>/
  SKILL.md            frontmatter + steps + gotchas
  scripts/<step>.sh   one script per mechanical step (chmod +x)
  references/<topic>.md   long material one step needs
  examples/<case>.md  one finished case, start to end (optional)
```

## SKILL.md

```markdown
---
name: <name, same as the folder>
description: "<Task in at most 57 characters.> Use when <phrasing 1>, <phrasing 2>, <phrasing 3>, or <situation>. <What it does, in one sentence.> <What it never does.>"
---

# <Title>

<One or two sentences: what the job is and where it ends.>

## Steps

1. **<Verb> <object>.** Run `scripts/<step>.sh <args>`. Done when <check the agent can verify>.
2. **<Judgment step>.** <What to decide, and from which facts.> Read [references/<topic>.md](references/<topic>.md) when <condition>. Done when <check>.
3. **Stop for approval** before anything that leaves the machine: show <the dry run / the diff / the plan>. Done when the user says yes.
4. **<Act>.** Run `scripts/<step>.sh --yes`. Done when <check>.

## Gotchas

- <A "never" from the interview: what, and why.>
- <A trap: the symptom, the real cause, what to do.>

Last verified: <YYYY-MM-DD> with <tool and version> (<what was tested>)
```

## Script (bash)

```bash
#!/usr/bin/env bash
# <name>.sh — <what it does, one line>.
# Usage: scripts/<name>.sh <args> [--yes]   (dry run unless --yes)
set -euo pipefail

YES=0
ARGS=()
for a in "$@"; do
  case "$a" in
    --yes) YES=1 ;;
    -h|--help) sed -n '2,3p' "$0"; exit 0 ;;
    *) ARGS+=("$a") ;;
  esac
done
[ "${#ARGS[@]}" -eq 1 ] || { echo "usage: $0 <arg> [--yes]" >&2; exit 2; }

run() {                     # print every step; act only with --yes
  echo "+ $*"
  if [ "$YES" -eq 1 ]; then "$@"; fi
}

# Preconditions: fail early with a message that says what to fix.
git diff --quiet || { echo "working tree not clean: commit or stash first" >&2; exit 1; }

run <command 1>
run <command 2>
[ "$YES" -eq 1 ] || echo "Dry run only. Run again with --yes to act."
```

Steps that only read (build, test, lint, checks) can run for real without `--yes`;
wrap only the steps that change something outside the working tree in `run`.
