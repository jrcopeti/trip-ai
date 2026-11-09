# Refactor, last

Only after the net holds and the mutation score on the area meets the plan.

- Small steps, each ending green. Use the IDE's automated refactorings where possible.
- Every refactoring commit changes structure only. A behaviour change is its own commit, with its own test.
- Turn comments into well-named functions; remove duplication once it appears the third time.
- After the refactor, delete the approval tests that functional tests now cover.

Done when the area reads clearly, the full suite is green, and the mutation score is at least what it was before the refactor.
