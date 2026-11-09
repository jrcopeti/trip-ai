# Property tests

A property test generates many inputs and checks a rule that must hold for every one of them. When a run fails, the library shrinks the input to the smallest failing case. Write two kinds, in this order:

1. **Crash hunt** at every entry point: no input crashes it. Use it on every target that outside input can reach.
2. **Business invariants**: the rules the business depends on hold. Use it where the code has rules.

## 1. Crash hunt: no input crashes an entry point

An entry point is where outside input enters the target: an HTTP endpoint, a CLI command, a message or queue handler, a file or string parser, an exported function that other code calls with user data. Legacy code crashes on inputs nobody tested: an empty result set, an invalid date, a missing field. Each crash is a 500 or an uncaught exception in production.

**The property, per entry point:** for any generated input, the call ends in a handled result.
- HTTP: the status is below 500, and the body parses as the documented type (JSON with the documented shape; an error body on 4xx).
- CLI: the exit code is 0 or a documented error code, and stderr has no stack trace.
- Handler or function: it returns a value, or throws the documented error type (e.g. a `ValidationError`). A `TypeError`, a `RangeError`, a null dereference, an index out of range or a timeout fails the property.

**Steps:**
1. List the entry points from the assessment: route files, CLI commands, handlers, exported functions that receive outside input. Trace each one to the target code (grep for the imports of the target outside the tests).
2. Write one generator per input. Mix valid and broken values with `oneof`, so most runs pass the validation and reach the logic. A generator that produces only broken input tests only the validator.
   - Strings: empty, whitespace, 10,000 characters, unicode (emoji, right-to-left text, combining marks), a NUL byte and other control characters, quotes, `;`, `../`, `%`.
   - Numbers: 0, -1, -0, `NaN`, `Infinity`, the largest safe integer, a decimal where an integer is expected, `"1e309"` as a string.
   - Dates and ranges: invalid dates (`2026-02-30`, `not-a-date`), `from` after `to`, a zero-length range, a range that contains no data, years far in the past and the future, month ends, leap days, daylight-saving change days.
   - IDs: a well-formed ID of a row that does not exist, an ID of another owner's row, a malformed ID.
   - Structure: a missing parameter, a repeated parameter (`?from=a&from=b`), a wrong type (an array where a string is expected), unknown extra fields, an empty body, a body that is not valid JSON.
   - Data state: the rows the code reads. Generate no rows, one row, rows with null or zero columns, many rows. "An event with no orders in the date range" is a data state, not a request parameter.
3. Call the entry point at the level it is exposed, in-process: a route handler with a `Request` (a Next.js route's `GET`, an Express app through supertest, FastAPI's `TestClient`, Spring's `MockMvc`), a CLI's main function with an argv array, a handler with a message object. Keep the real database (see `make-it-testable.md`).
4. Run with a fixed seed and a run count CI can afford: about 1,000 runs per property locally while hunting, 25–100 in CI. Print the seed on failure, so a failing run can be replayed.
5. When a run fails, take the shrunk input and:
   - Add it as a normal test that pins today's response, named `pins current behaviour — suspected bug: <input> crashes with <error>` (see `characterize.md`).
   - Add it to the suspected-bugs list in the final report.
   - Exclude that input class from the generator, with a comment that names the pinned test, so the property stays green and keeps hunting for other crashes.
   - Do not fix the crash. A fix changes behaviour; the user decides on it after the report.

Done when every entry point of the target has a crash-hunt property, a local hunt of 1,000 runs per property finds no new crash, and every crash found is pinned and listed.

## 2. Business invariants

Bugs hide in the edge cases of the rules. Write the rule in words first, then as a property:
- money: a refund never exceeds what was paid; the parts add up to the total
- limits: seats sold never exceed seats available
- round trips: `parse(format(x))` equals `x`
- order: a bigger input never gives a smaller fee, when the rule says so

When it fails, add the shrunk input as a normal test too. A failure on today's code is a suspected bug: pin it and list it, as in step 5 above.

Done when each load-bearing rule in the area has a property test.

## Libraries

| Stack | Library | Fixed seed and run count |
|---|---|---|
| JavaScript/TypeScript | fast-check https://fast-check.dev/ | `fc.assert(prop, { seed: 42, numRuns: 50 })` |
| Python | Hypothesis https://hypothesis.readthedocs.io/ | `@settings(derandomize=True, max_examples=50)` |
| Java/Kotlin | jqwik https://jqwik.net/ | `@Property(seed = "42", tries = 50)` |
| .NET | FsCheck https://fscheck.github.io/FsCheck/ | `Config`: `MaxTest`, `Replay` |
| Rust | proptest https://proptest-rs.github.io/proptest/ | `ProptestConfig`: `cases`, `rng_seed` |
| Go | rapid https://pkg.go.dev/pgregory.net/rapid | `-rapid.seed`, `-rapid.checks` |
