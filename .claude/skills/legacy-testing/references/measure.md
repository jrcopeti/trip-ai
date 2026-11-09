# Measure

- **Coverage** shows which lines never ran. Use it to find blind spots, not as the target.
- **Mutation testing** shows which behaviour is never checked, even on covered lines: it plants small bugs and counts how many the tests catch. The mutation score on the load-bearing area is the target.

Run mutation testing on the target files only, explain every surviving mutant in one sentence, and add the test that kills it (or mark it as equivalent with the reason). The mutation-testing skill in this repo does exactly this.

### Scoped runs
A mutation run is a dry run of the tests, then one run per mutant. Scope both halves:
1. **Mutate only the target.** Stryker: `npx stryker run --mutate <file>`. Pitest: `targetClasses`. mutmut: `paths_to_mutate`.
2. **Run only the related tests.** `scripts/assess.sh <file>` lists the tests that import the target. Prefer a project script that already scopes the run. Otherwise point the runner at those tests: Stryker's vitest runner takes `vitest.dir` (a folder) or `vitest.configFile` (a config whose `include` lists the files).
3. **A scratch config is TEMPORARY.** Write `TEMPORARY` in its first line with the reason, never commit it, and delete it before the final report. Do not edit the repo's own mutation or CI config unless the plan lists it.

Done when the dry run covers only the related tests and the mutation score on the target area meets the target in the approved plan.

Official docs: Stryker https://stryker-mutator.io/docs/ · Pitest https://pitest.org/ · mutmut https://mutmut.readthedocs.io/ · Vitest coverage https://vitest.dev/guide/coverage
