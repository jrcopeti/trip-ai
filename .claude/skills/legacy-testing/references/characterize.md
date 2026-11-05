# Characterize

The goal is to understand behaviour, not to find bugs. Each test **pins** what the code does today.

The cycle, per behaviour:
1. Write a test that calls the code with a realistic input.
2. Assert a value you expect to be wrong (e.g. `expect(result).toBe(null)`).
3. Run it. The failure message shows what really happened.
4. Replace the assertion with that real value. The test is now green and documents today's behaviour.
5. Repeat with the next input: the boundaries (zero, one, the limit, just past it), the empty case, the error case.

Name each test after the behaviour it pins ("rounds a 1-cent refund down to 0"). When a pinned value looks wrong, keep it pinned, name the test `pins current behaviour — suspected bug: <what is wrong>`, and add it to the "suspected bugs" list in the final report.

Done when every public function in the target area has pinned tests for its normal case, its boundaries and its error case, and you can explain its behaviour without reading its code.
