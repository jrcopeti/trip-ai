# Gotchas — the ways mutation results lie to you

## Scores from different tools are not comparable

Every tool ships its own mutator set, and they differ by more than most
people expect. Stryker and Pitest rewrite a comparison one boundary at a time
(`>=` → `>`), which is exactly the probe that finds off-by-one errors.
cargo-mutants mostly replaces whole function bodies and flips an operator to
its opposite (`<=` → `>`), which never lands on the boundary. So a 100% from
cargo-mutants is a far weaker statement than a 100% from Stryker — verified:
a crate at 100% still passed every test with a real off-by-one planted at its
threshold.

Two consequences for the report:

- Name the tool next to the score. "100% (cargo-mutants)" and "100%
  (Stryker)" are different claims.
- Before trusting a high score, look at what was actually generated —
  `cargo mutants --list`, Stryker's HTML report, Pitest's mutator summary.
  If no mutant probes a boundary you care about, the score says nothing
  about that boundary.

**Constants that never bind are a common shared blind spot.** A cap like
`min(raw, 500)` produces no useful mutant when every test input lands below
the cap: the capped branch is never taken, so nothing distinguishes 500 from
5000. Several tools miss this entirely. When code has a limit, check by hand
that some test actually reaches it.

## Equivalent mutants

Some mutants change the code without changing behavior (`i < len` vs
`i != len` on a loop that only counts up). No test can kill them. The agent
that ran the tool does not get to say which ones these are: it writes a
claim, a fresh judge tries to kill the mutant
([judge.md](judge.md)), and only a claim that survives the judge goes to the
user for an exclusion. An agent that wants a green gate calls hard mutants
equivalent; every one it gets wrong is a hole in the tests hidden behind an
exclusion comment.

Two traps when writing a claim:

- **Use the language's strictest equality.** In JavaScript, `-0 !== 0` is
  `false`, so a differential check built on `!==` is blind to signed zero —
  while `expect().toBe()` uses `Object.is` and is not. A mutant "proven"
  equivalent with loose equality may be killable. Other languages have their
  own versions of this trap (NaN, negative zero, integer overflow wrapping).
- **Say which kind of equivalent it is.** Equivalent *in isolation* (no input
  can distinguish it) is a stronger claim than equivalent *in context*
  (distinguishable, but unreachable given every current caller). The second
  kind stops being equivalent when a new caller appears. On an exported
  function it is no claim at all: a test can call the export with the
  distinguishing input, so the mutant is killable. Verified: a refund fee
  function capped at the refund looked equivalent because its only caller
  clamps the net amount at zero; `refundFee(30)` returns 50 under the mutant.

## Timeouts scored as kills

Most tools count a timed-out mutant as killed. If a run reports timeouts on
trivial expressions, suspect resource contention, not detection — especially
when tests use containers or real services. A parallel run against Docker
measures Docker. Rerun at concurrency 1 before believing the number.

## The missing-code blind spot

A suite can score 95% on a refund module that never checks the event date —
the score is honest about the code that exists and silent about the code
that does not. Only reading the spec against the behavior catches an
unimplemented rule. Say so in every report where it applies.

## String and SQL mutants are shallow

Tools typically mutate a string literal by replacing the whole thing with
`""`. They will not produce a semantically altered SQL statement, so a score
says nothing about whether a `WHERE` guard is tested. When the scoped code
builds queries, name that gap in the report or the number tells exactly the
kind of lie you are here to catch.

## Flaky tests poison everything

A test that fails 1 run in 50 kills mutants it never checked and survives
mutants it should catch — in both directions the verdict is noise. Fix or
quarantine flaky tests before the first mutation run, and treat a suspicious
cluster of kills in one file as a flake signal, not a victory.

## Score-gaming moves, all forbidden

Each of these raises the number and lowers the truth. Recognize them in
existing config too — inherited exclusions are findings:

- excluding files or folders from mutation to hide survivors
- excluding or skipping a failing test to unblock the run
- raising timeouts until slow mutants count as killed
- disabling the mutator kinds that keep surviving
- asserting a mutant's exact behavior to force a kill (the test now protects
  nothing — it breaks on the next honest refactor)

## Keep runs affordable

Mutation testing is expensive by construction: mutants × suite runtime.

- First run: one module (see the loop). Never whole-repo on a first contact.
- Use per-test coverage analysis where the tool offers it — it runs only the
  tests that touch each mutant.
- In CI, test the diff, not the world: `--incremental` (StrykerJS),
  `--in-diff` (cargo-mutants), mutmut's cache, Pitest's `-DwithHistory`.
  Cache the tool's incremental/history file between CI runs or the flag does
  nothing.
- A nightly full run plus a per-PR diff run beats one heroic weekly run that
  everyone ignores.
