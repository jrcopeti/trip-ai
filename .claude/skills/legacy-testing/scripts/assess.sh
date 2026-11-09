#!/usr/bin/env bash
# assess.sh — read-only facts for a legacy-testing plan.
# Usage: scripts/assess.sh [path] [--ui]   (run from the repo root; path is a file or a directory, default .;
#        --ui lists untested UI files too)
# Prints: stack, package manager, test runner, CI, test/source counts, the tests anywhere in the
# repo that reference each target file, source files no test references (heuristic), dependency
# hotspots, and coverage from an existing report if one is present. Changes nothing.
set -uo pipefail

TARGET=${1:-.}
UI=${2:-}
[ "$TARGET" = "--ui" ] && { TARGET=.; UI=--ui; }
if [ ! -e "$TARGET" ]; then
  echo "assess.sh: $TARGET: no such file or directory (run it from the repo root)" >&2
  exit 2
fi
# repo-relative, no leading ./, no trailing /
TARGET=${TARGET#./}; while [ "$TARGET" != "/" ] && [ "${TARGET%/}" != "$TARGET" ]; do TARGET=${TARGET%/}; done
[ -z "$TARGET" ] && TARGET=.
PRUNE=(-path '*/node_modules' -o -path '*/.git' -o -path '*/dist' -o -path '*/build' -o -path '*/.next' -o -path '*/coverage'
  -o -path '*/vendor' -o -path '*/target' -o -path '*/.venv' -o -path '*/__pycache__' -o -path '*/.stryker-tmp' -o -path '*/.claude')
CODE=(-name '*.ts' -o -name '*.tsx' -o -name '*.js' -o -name '*.jsx' -o -name '*.mjs' -o -name '*.cjs' -o -name '*.py' -o -name '*.go'
  -o -name '*.rs' -o -name '*.java' -o -name '*.kt' -o -name '*.cs' -o -name '*.rb' -o -name '*.php')

section() { printf '\n== %s ==\n' "$1"; }

# ---------- stack ----------
section "Stack"
stack=()
[ -f package.json ] && stack+=("JavaScript/TypeScript (package.json)")
{ [ -f pyproject.toml ] || [ -f requirements.txt ] || [ -f setup.py ]; } && stack+=("Python")
[ -f go.mod ] && stack+=("Go")
[ -f Cargo.toml ] && stack+=("Rust")
{ [ -f pom.xml ] || [ -f build.gradle ] || [ -f build.gradle.kts ]; } && stack+=("Java/Kotlin")
ls ./*.csproj ./*.sln >/dev/null 2>&1 && stack+=(".NET")
[ -f Gemfile ] && stack+=("Ruby")
[ -f composer.json ] && stack+=("PHP")
[ ${#stack[@]} -eq 0 ] && stack+=("unknown — check the README")
printf '%s\n' "${stack[@]}"

if [ -f package.json ]; then
  pm=npm
  [ -f pnpm-lock.yaml ] && pm=pnpm
  [ -f yarn.lock ] && pm=yarn
  { [ -f bun.lockb ] || [ -f bun.lock ]; } && pm=bun
  echo "package manager: $pm"
fi

# ---------- test setup ----------
section "Test setup"
runners=()
if [ -f package.json ]; then
  for r in vitest jest mocha ava @playwright/test cypress fast-check @stryker-mutator/core testcontainers; do
    grep -q "\"$r\"" package.json && runners+=("$r")
  done
  echo "test scripts in package.json:"
  grep -E '"(test|test:[^"]*)"[[:space:]]*:' package.json | sed 's/^[[:space:]]*/  /' || echo "  (none)"
fi
[ -f pytest.ini ] || grep -qs pytest pyproject.toml requirements*.txt 2>/dev/null && runners+=("pytest")
[ -f go.mod ] && runners+=("go test")
[ -f Cargo.toml ] && runners+=("cargo test")
echo "runners/tools found: ${runners[*]:-none}"
if [ -d .github/workflows ]; then
  echo "CI: .github/workflows ($(ls .github/workflows | tr '\n' ' '))"
else
  echo "CI: none found"
fi

# ---------- files ----------
is_test() { case "$1" in *.test.*|*.spec.*|*_test.go|*/test_*.py|*_test.py|*/tests/*|*/test/*|*/__tests__/*|*/e2e/*) return 0;; *) return 1;; esac; }
is_skipped() { case "$1" in *.d.ts|*.config.*|*config.ts|*config.js) return 0;; *) return 1;; esac; }
code_files() { find "$1" \( "${PRUNE[@]}" \) -prune -o -type f \( "${CODE[@]}" \) -print | sed 's|^\./||' | sort; }

# Tests live anywhere in the repo (tests/integration/x.test.ts covers src/db/x.ts), so always search from the root.
TESTS=(); SRC=()
while IFS= read -r f; do
  is_skipped "$f" && continue
  is_test "/$f" && TESTS+=("$f")
done < <(code_files .)
if [ -f "$TARGET" ]; then
  SRC=("$TARGET")
else
  while IFS= read -r f; do
    is_skipped "$f" || is_test "/$f" || SRC+=("$f")
  done < <(code_files "$TARGET")
fi

section "Counts"
echo "source files under $TARGET: ${#SRC[@]}"
echo "test files in the repo:  ${#TESTS[@]}"

# Tests that import a source file: an import path ending in its name (with or without extension), or a python import.
refs() {
  local base; base=$(basename "$1"); base=${base%.*}
  [ "$base" = "index" ] && base=$(basename "$(dirname "$1")")
  [ ${#TESTS[@]} -eq 0 ] && return 0
  grep -lE "/${base}(\.[a-z]+)?['\"]|import[[:space:]]+${base}\b|from[[:space:]]+[.a-zA-Z_]*${base}[[:space:]]+import" "${TESTS[@]}" 2>/dev/null
}

tested=(); untested=()
for f in "${SRC[@]}"; do
  hits=$(refs "$f" | tr '\n' ' ')
  if [ -n "$hits" ]; then tested+=("$f <- ${hits% }"); else untested+=("$f"); fi
done

# ---------- tests that reference the target ----------
section "Tests that reference the target (heuristic: a test file imports it)"
if [ ${#tested[@]} -eq 0 ]; then
  echo "(none)"
elif [ ${#SRC[@]} -gt 20 ]; then
  echo "${#tested[@]} of ${#SRC[@]} source files have a test that imports them; pass a file or a folder to list the tests"
else
  # A file target lists every test; a folder lists 5 per file so the untested list stays on screen.
  max=5; [ -f "$TARGET" ] && max=1000
  for row in "${tested[@]}"; do
    echo "${row%% <- *}"
    n=0
    for t in ${row#* <- }; do
      n=$((n + 1)); [ $n -le $max ] && echo "  <- $t"
    done
    [ $n -gt $max ] && echo "  <- ... and $((n - max)) more"
  done
fi

# ---------- untested (heuristic) ----------
section "Source files no test references (heuristic: no test file imports it)"
if [ ${#TESTS[@]} -eq 0 ]; then
  echo "no test files in the repo — every source file is untested"
fi
if [ ${#untested[@]} -eq 0 ]; then
  echo "(none)"
else
  # Logic first: decisions (if/else/switch/ternary/&&/||) are where bugs live, so rank by branch count.
  # UI components and tooling are listed separately: usually covered by UI flows, rarely the money code.
  logic=(); ui=(); tooling=()
  for f in "${untested[@]}"; do
    case "$f" in
      *.tsx|*.jsx|*.vue|*.svelte|components/*|*/components/*|*/screens/*|*/pages/*|*/views/*) ui+=("$f");;
      scripts/*|*/scripts/*|bin/*|tools/*) tooling+=("$f");;
      *) logic+=("$f");;
    esac
  done
  echo "-- logic (ranked by branch count = decisions to pin) --"
  if [ ${#logic[@]} -eq 0 ]; then echo "(none)"; else
    for f in "${logic[@]}"; do
      b=$(grep -cE '\bif\b|\belse\b|\bswitch\b|\bcase\b|\?[^.?]|&&|\|\||\bcatch\b|\belif\b|\bexcept\b|\bmatch\b' "$f" 2>/dev/null || true)
      printf '%4s branches  %5s lines  %s\n' "${b:-0}" "$(wc -l < "$f" | tr -d ' ')" "$f"
    done | sort -rn | head -20
  fi
  echo "-- UI components (${#ui[@]}): usually covered by UI flows; list with --ui --"
  if [ "$UI" = "--ui" ] && [ ${#ui[@]} -gt 0 ]; then printf '  %s\n' "${ui[@]}"; fi
  [ ${#tooling[@]} -gt 0 ] && echo "-- tooling scripts (${#tooling[@]}): ${tooling[*]}"
fi

# ---------- dependency hotspots ----------
section "Dependency hotspots (files reaching the outside world directly)"
PAT='fetch\(|axios|http\.request|https?://|prisma|drizzle|\bpg\b|knex|sequelize|mongoose|typeorm|sqlite|\bsql`|SELECT |INSERT |readFile|writeFile|fs\.|Date\.now\(|new Date\(|process\.env|redis|kafka|amqp|sqs|nodemailer|smtp|stripe|requests\.|urllib|psycopg|sqlalchemy|datetime\.now|os\.environ|open\('
for f in "${SRC[@]}"; do
  n=$(grep -cE "$PAT" "$f" 2>/dev/null || true)
  [ "${n:-0}" -gt 0 ] && printf '%4d  %s\n' "$n" "$f"
done | sort -rn | head -15
echo "(count = lines that touch a database, network, filesystem, clock or env; these need a seam or a real test instance)"

# ---------- coverage ----------
section "Coverage (from an existing report, if any)"
if [ -f coverage/coverage-summary.json ] && command -v node >/dev/null; then
  node -e '
    const s=require(process.cwd()+"/coverage/coverage-summary.json");
    const rows=Object.entries(s).filter(([k])=>k!=="total").map(([k,v])=>[v.lines.pct,k.replace(process.cwd()+"/","")]);
    rows.sort((a,b)=>a[0]-b[0]); console.log("total lines:",s.total.lines.pct+"%");
    for (const [p,k] of rows.slice(0,15)) console.log(String(p).padStart(6)+"%  "+k);'
elif [ -f coverage/lcov.info ]; then
  awk -F: '/^SF:/{f=$2} /^LF:/{lf=$2} /^LH:/{lh=$2; if(lf>0) printf "%6.1f%%  %s\n", lh*100/lf, f}' coverage/lcov.info | sort -n | head -15
else
  echo "no coverage report found. To get one (JS/TS with Vitest): npx vitest run --coverage --coverage.reporter=json-summary"
fi

section "Next"
echo "Read the tests that reference the target and the biggest untested areas above, name their load-bearing behaviour, then write the plan (SKILL.md step 2)."
