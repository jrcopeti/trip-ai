# Approval tests

For big outputs (JSON, HTML, text reports) where asserting every field by hand is painful.

1. Generate the output from the code with a fixed input.
2. Store it as the approved file, and review it once with the user.
3. Every later run compares the new output with the approved file; any difference fails the test and shows the diff.

In JS/TS, Vitest and Jest snapshots do this (`toMatchSnapshot`, `toMatchFileSnapshot`); other languages have ApprovalTests libraries.

They are temporary scaffolding: mark them (a `*.approval.test.*` name or a comment), and delete most of them once functional tests cover the behaviour.

Done when each big output in the target area has one approved file reviewed by the user.

Official docs: Vitest snapshots https://vitest.dev/guide/snapshot · Jest snapshots https://jestjs.io/docs/snapshot-testing · ApprovalTests https://approvaltests.com/
