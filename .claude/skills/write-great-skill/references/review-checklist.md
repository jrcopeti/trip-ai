# Review checklist

Go through it with the user in step 6. Every "no" is a fix before the skill ships.

## Trigger

- Does the first sentence of the description name the task in at most 57 characters?
- Does the description contain the words the user said they would type?
- Would a request that does not name the skill still match it? Try three.
- Does it say what the skill never does, so a near-miss request does not pick it?
- Does another installed skill have a similar description? Make the difference explicit in both.

## Structure

- Is SKILL.md short enough to read in one pass (aim under 100 lines)?
- Does every file in `references/` and `examples/` have a step that says when to read it?
- Is every mechanical step a script call, with the exact command line?
- Does every script that changes something outside the working tree dry-run by default?

## Steps

- Does every step start with a verb and end with `Done when …`?
- Can the agent check each done-condition itself (a command's exit code, a file, a count)?
- Is there an approval stop before anything that leaves the machine?

## Lines

- Delete each line in your head: would the agent behave differently? If not, delete it.
- Is each thing called by one name everywhere?
- Is there an example where an adjective was ("good", "clean", "robust")?

## Gotchas

- Is every "never" from the interview in the gotchas or the steps?
- Does each gotcha name the symptom and the real cause, not only "be careful with X"?

## Safety

- No secrets, tokens or personal data in any file.
- No step runs a real push, deploy, publish or send just to test the skill.
