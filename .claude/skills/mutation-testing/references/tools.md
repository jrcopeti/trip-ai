# Mutation tools by stack — setup and scoped runs

Every entry follows the same shape: install, minimal config, **scoped first
run** (one file or module — never the whole repo first), where the report
lands. Prefer the tool's incremental mode once it exists for the stack.

Never run a tool's interactive init wizard (`stryker init`, Infection's
first-run wizard, `mutmut browse`) — they hang a non-TTY session. Write the
config file yourself from the snippets below.

These tools drop output into the repo: `mutants/`, `.stryker-tmp/`,
`reports/`, `StrykerOutput/`, `target/pit-reports/`, `mutants.out/`,
`infection.log`. Prefer a console-only run that writes none of it (StrykerJS
can: `--reporters clear-text`). For the tools that always write it, delete it with one
`rm -rf <dir>` call before reporting; if the harness refuses the delete,
name the folder in the report's files line.

Version numbers and flags drift. If a command below fails, check the tool's
current docs before improvising — do not switch tools because one flag moved.
To confirm a current version, read the registry's own metadata (Maven
Central's `maven-metadata.xml`, `npm view <pkg> version`, the NuGet flat
index) — search-endpoint results are ranked, not sorted by release, and will
hand you a stale number.

## Excluding an approved equivalent

Only after the user approved the claim (SKILL.md step 9). Put the reason in
the comment: it is the record of what the judge tried and who approved it.

| Tool | Narrowest exclusion |
|---|---|
| StrykerJS | `// Stryker disable next-line EqualityOperator: equivalent, judged and approved — <reason>` on the line above |
| Stryker.NET | `// Stryker disable once Equality : equivalent, judged and approved — <reason>` on the line above |
| mutmut | `# pragma: no mutate` at the end of the line; the reason in a comment on the line above |
| Infection | `/** @infection-ignore-all */` docblock above the statement; the reason inside the docblock |
| Pitest | no line comment: an annotation named `@DoNotMutate` on the method excludes the whole method |
| cargo-mutants | no line comment: `#[mutants::skip]` on the function (needs the `mutants` crate as a dependency) excludes the whole function |

- Stryker's comment disables every mutant of that mutator on the line, not
  only the equivalent one. `fee < 100` has two EqualityOperator mutants:
  `<=` may be equivalent while `>=` is killable. Tell the user which killed
  mutants the comment also switches off, and name the line in the report.
- Pitest and cargo-mutants exclude a whole method or function. Say so when
  you ask for approval: the user approves a wider hole than one line.
- Syntax drifts: if the tool still reports the mutant after the comment,
  check its current docs before trying variants.

## JavaScript / TypeScript — StrykerJS

```bash
npm install --save-dev @stryker-mutator/core @stryker-mutator/vitest-runner
# jest project: @stryker-mutator/jest-runner instead, "testRunner": "jest"
```

Write `stryker.config.json` yourself (do not run `stryker init` — it is an
interactive wizard):

```json
{
  "testRunner": "vitest",
  "mutate": ["src/billing/refund.ts"],
  "coverageAnalysis": "perTest",
  "ignorePatterns": ["coverage", "reports", "test-results"],
  "reporters": ["clear-text"]
}
```

Scoped first run, console only (the project's config may list `html` or
`json` reporters, which write `reports/`; the flag overrides them):

```bash
npx stryker run --mutate src/billing/refund.ts --reporters clear-text
```

`clear-text` prints every survivor with its diff and the score table.
Stryker deletes its `.stryker-tmp/` sandbox after a successful run.

- `"coverageAnalysis": "perTest"` is a large speedup — keep it. Keep
  generated folders in `ignorePatterns`: Stryker copies the project into a
  sandbox, and a concurrent process writing those folders crashes the copy.
- With the `html` reporter: `reports/mutation/mutation.html`. Delete
  `reports/` before reporting.
- Later runs: widen the `mutate` globs; `--incremental` reuses previous
  results and only retests what changed.

## C# / .NET — Stryker.NET

Install as a local tool, not globally:

```bash
dotnet new tool-manifest      # once per repo, if .config/dotnet-tools.json is missing
dotnet tool install dotnet-stryker
```

Run from the **test project** directory. Scoped first run:

```bash
dotnet stryker --mutate "**/RefundService.cs"
```

- Multi-project solutions: `--project MyLib.csproj` picks the source project
  under test.
- Report: `StrykerOutput/<timestamp>/reports/mutation-report.html`.
- Config file `stryker-config.json` is optional; flags cover the first run.

## Java / Kotlin — Pitest

Maven — most modern projects use JUnit 5, which needs the extra plugin
dependency, so ship the full block:

```xml
<plugin>
  <groupId>org.pitest</groupId>
  <artifactId>pitest-maven</artifactId>
  <version>1.30.0</version> <!-- latest: repo1.maven.org/maven2/org/pitest/pitest-maven/maven-metadata.xml -->
  <dependencies>
    <dependency>
      <groupId>org.pitest</groupId>
      <artifactId>pitest-junit5-plugin</artifactId>
      <version>1.2.3</version>
    </dependency>
  </dependencies>
</plugin>
```

Scoped first run:

```bash
mvn test-compile org.pitest:pitest-maven:mutationCoverage \
  -DtargetClasses=com.example.billing.* -DtargetTests=com.example.billing.*
```

- Gradle: plugin id `info.solidsoft.pitest`, same `targetClasses` idea.
- Report: `target/pit-reports/index.html`.
- Kotlin: expect noise — Pitest mutates compiler-generated code (null-check
  intrinsics), so many survivors are artifacts, not findings. Say so in the
  report instead of chasing them.

## Python — mutmut

Install into the project's virtualenv, never system-wide (bare `pip install`
hits PEP 668 on modern systems):

```bash
python -m pip install mutmut     # inside the venv; or: uv add --dev mutmut
```

Config in `pyproject.toml` — the value **must be an array**; a plain string
gets iterated character by character and mutates nothing:

```toml
[tool.mutmut]
source_paths = [ "src/billing/" ]   # mutmut 3 key; paths_to_mutate is the deprecated name
```

(In `setup.cfg` the section is INI-style `[mutmut]`, not `[tool.mutmut]`.)

Scoped first run — scope by pointing `source_paths` at one module:

```bash
mutmut run
mutmut results              # list survivors
mutmut show <mutant-name>   # diff of one mutant; names come from results
```

- Never open `mutmut browse` — it is an interactive TUI.
- **Delete `mutants/` before every confirming rerun.** mutmut caches verdicts
  and the cache goes stale: after you add a test that genuinely kills a
  mutant, a plain `mutmut run` reports the *old* survivors and prints
  `0.00 mutations/second`, meaning it re-executed nothing. It logs
  `Found N new tests` while still serving stale results, so the run looks
  legitimate. `rm -rf mutants && mutmut run` gives the true score. Verified
  against mutmut 3.7.0.
- The scope persists in `pyproject.toml`: widen or remove it when you finish.
- mutmut copies the source tree into a `mutants/` directory in the repo —
  gitignore or delete it before reporting.
- Tests must be runnable via `pytest` from the repo root.
- Windows: mutmut requires `fork`, so it runs only under WSL.

## Rust — cargo-mutants

```bash
cargo install cargo-mutants   # Rust has no project-local binary install; this is always per-user (~/.cargo). Ask first.
```

**Read the score with care — cargo-mutants has a narrow mutator set.** It
mostly replaces whole function bodies with fixed values (`true`, `false`,
`0`, `Default::default()`) and swaps a relational operator for its opposite
(`<=` → `>`). It does *not* generate the adjacent-boundary mutant
(`<=` → `<`) that Stryker and Pitest use to probe off-by-one errors. A
verified consequence: a crate scoring **100%** still passed every test after
`units <= LOW_STOCK_THRESHOLD` was changed to `units < LOW_STOCK_THRESHOLD`,
because no test covered the exact threshold and no mutant existed to expose
it. Run `cargo mutants --list` to see exactly what is being tested, and state
in the report that boundary conditions are outside what this score covers.

There is no config file to write — scope is a per-invocation `-f` flag, so
nothing persists and there is no scope to widen afterwards.

Rust keeps unit tests in the source file under `#[cfg(test)] mod tests`.
Adding a test there means editing a file in `src/`; that is allowed, but say
so in the report and never touch the code above the test module.

Scoped first run:

```bash
cargo mutants -f src/billing.rs
```

- Report and logs: `mutants.out/` (`caught.txt`, `missed.txt`,
  `unviable.txt`). "Missed" = survivor.
- On a PR: `cargo mutants --in-diff <(git diff main)` tests only changed
  code — the cheapest CI gate this list has.

## PHP — Infection

```bash
composer require --dev infection/infection
```

Write `infection.json5` yourself before the first run — without it Infection
starts an interactive wizard:

```json5
{ "source": { "directories": ["src"] }, "logs": { "text": "infection.log" } }
```

Scoped first run:

```bash
vendor/bin/infection src/Billing/RefundService.php --threads=4 --no-progress
```

The file to mutate is a positional argument. The older `--filter=` flag still
runs but has been deprecated since Infection 0.34 and prints a warning.

- Report: console + `infection.log`.
- Needs Xdebug or PCOV for coverage; PCOV is much faster.

## Go, Ruby, and everything else

- **Go**: `gremlins` (github.com/go-gremlins/gremlins) — works but moves
  slowly; expect rough edges. Scope with `gremlins unleash ./billing/...`.
- **Ruby**: `mutant` (github.com/mbj/mutant) — mature and precise, but
  **free only for open source** (`--usage opensource`); commercial use needs
  a paid license, so say that before installing anything at work.
  `bundle add mutant-rspec --group development`, then
  `bundle exec mutant run --use rspec --usage opensource --require ./lib/billing 'Billing*'`.
- **Anything else**: search "<language> mutation testing tool", prefer the
  one with recent releases, and apply the same loop: baseline, scope to one
  module, run, explain survivors, kill or prove equivalent. If no maintained
  tool exists, say so — do not hand-mutate the codebase; the manual version
  of this loop (flip one operator, run the suite, revert) is a demonstration,
  not a practice.
