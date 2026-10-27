# Why `tours` arrived as a string: measurements (2m-b)

The measurements behind 2m-b's fix. The decision and its status are in `PLAN.md` (2m-b); this
file is the evidence.

## The failure

`submit_trip` is a strict tool (`strict: true`), and `tours` is an array of five objects. Now and
then the model sent `tours` as a JSON *string* holding the array instead. `parseListFields`
parses such a string back into a list, but when the text inside is not valid JSON the trip fails
`TripDataSchema` and the traveller gets "invalid trip". The call is billed in full either way.

- **Production, 2026-10-21** (`req_011CgFDwVfiV8gNm6phjUk9j`, recorded in 2k): `tours` arrived
  as 715 characters of JSON text holding only the first tour. The model escaped the inner quotes
  (`\"title\"`) until the end of that tour's description, where it wrote a bare `"`, which
  closed the outer string. Tours 2 to 5 were never written.
- **2m-a's real runs, 2026-10-22:** `tours` came back as JSON text that does not parse in 6 of
  15 runs: 4 of 9 on 2m-a's prompt, 2 of 6 on `main`'s.

## The suspect

2m-a's prompt describes the tours first, then the packing list, then the rest. `submit_trip`'s
schema put `tours` fifth, after `title`, `objectsList`, `mustHave` and `description`. The model
writes a tool call's fields in the schema's order, so the prompt and the schema disagreed about
what comes first.

## How it was measured

`scripts/string-tours/harness.ts` makes the production call: `buildSystemPrompt()`, the trip
message for `validTripRequest` (Ana, a couple, Lisbon, 7 nights, Brazilian passport, no
forecast), `submit_trip`, `claude-sonnet-5-5`, `max_tokens` 16000, `tool_choice: auto`, streamed
and read with `finalMessage()`. Nothing is written to the database and no photos are fetched.
Three calls at a time. Each run keeps the raw tool input whole, in
`scripts/string-tours/runs/` (gitignored).

Each run gets one outcome:

| Outcome | Meaning |
|---|---|
| ok | every list arrived as a list, and the trip passes `TripDataSchema` |
| parsed | a list arrived as JSON text that parses; production recovers it |
| broken | a list arrived as JSON text that does not parse; production fails the trip |
| invalid | lists fine, but `TripDataSchema` refuses the trip for another reason |
| error | the call failed, or made no tool call |

The order of the keys in the raw input is the order the model wrote the fields in.

## Results

Fifteen runs per variant, the passport Brazilian in all. `baseline` and `main-order` ran on
today's prompt (`main` at `d2ce293`, 2m-a merged); `pre-2m-a` sends `main`'s prompt, trip message
and tool from before 2m-a (`67a490e`), captured in `scripts/string-tours/main-before-2m-a.json`.

| Variant | Prompt | Schema order | Broken | OK | Thinking tokens, mean | Seconds | Output tokens |
|---|---|---|---|---|---|---|---|
| `baseline` | today's | tours first | 0 | 15 | 6,562 | 55–77, mean 66 | 9,318 |
| `main-order` | today's | tours fifth | 0 | 15 | 6,713 | 58–83, mean 66 | 9,535 |
| `pre-2m-a` | before 2m-a | tours fifth | **4** | 11 | **0** | 11–26, mean 20 | 2,218 |

### The prompt from before 2m-a still breaks, the same way production did

- **4 in 15** (27%), against 2 in 6 on 2026-10-22. The bug did not go away on the API's side.
- **Every broken run is production's string** of 2026-10-21: `tours` arrives as 654 to 735
  characters of JSON text holding the first tour only, cut off at the end of that tour's
  description, before its closing `}`. Then `tip` is the single character `"x"`, every time,
  filling the required field. The broken calls take 11 to 13s and about 1,300 output tokens, as
  production's did (13.6s, 1,554); the clean ones about 23s and 2,400 to 2,800.
- The model wrote the fields in the schema's order in all 15, as on today's prompt.

### Today's prompt never breaks, and it thinks

- **0 in 30**, in either schema order. At the old rate (27% to 40%) the chance of 30 clean runs
  is under 1 in 10,000; the rule of three puts today's rate below 10% at 95%.
- **The schema order is not the cause:** tours fifth broke 4 in 15 on the old prompt and 0 in
  15 on today's.
- **The difference that shows is thinking.** Neither prompt sends a `thinking` setting, so
  Sonnet 5.5 runs adaptive thinking and decides itself whether to think. On the old prompt it
  never thought (0 tokens in all 15 runs); on today's it thought in all 30, about 6,600 tokens
  each. Every broken run is one without thinking. What in 2m-a's prompt makes it think is
  its entry rules (below).
- **So the fix in production is, so far, a side effect.** 2m-a's prompt made the model think,
  and a model that thinks first has not broken the list. Nothing pins that: a later prompt
  change could stop the thinking and bring the bug back.

### What differs between the prompts

The call is the same as 2m-a's real runs (2m-a's script: the same model, `max_tokens`,
`tool_choice` and stream; no `cache_control` on the system prompt, which changes only billing).
What was sent was not:

| | `main` before 2m-a (`67a490e`) | 2m-a's first commit (`41ce4fc`) | Today's `main` (`d2ce293`) |
|---|---|---|---|
| Broke | 2 in 6 (10-22), 4 in 15 (10-23) | 4 in 9 (10-22) | 0 in 30 (10-23) |
| Tours in the prompt | in "The rest of the trip", after the packing list | the same | their own section, first |
| Line-break rule | none | "never a written \\n": the prompt itself holds a backslash-n | names the characters, "not the characters backslash and n" |
| Entry rules in the tip | "check the requirements", any passport | the first summary rule | the reviewed rules (home, territories) |
| Passports run | Brazil (10-23); not recorded (10-22) | Brazil, Portugal (home), none | Brazil |

### The entry rules make it think

Today's prompt with one of 2m-a's changes put back as `67a490e` had it, everything else as
today. Three runs each: whether a run thinks is all or nothing here, so three show it.

| Variant | Put back | Thinking tokens per run | Seconds | Broken |
|---|---|---|---|---|
| `old-entry` | the tip's entry rule: "remind them to check… Do not state the rules yourself" | **0, 0, 0** | 21–24 | 0 |
| `no-linebreak` | no line-break rule, in the prompt or the tool | 5,196, 7,148, 7,965 | 60–75 | 0 |
| `tours-in-rest` | the tours inside "The rest of the trip", the old opening line | 6,024, 6,594, 7,439 | 60–72 | 0 |

- **2m-a's entry rules are what make the model think.** They ask it to recall what a passport
  needs ("as far as you know… visa-free and for how long, a visa on arrival, an eVisa…") and to
  choose between three cases (another country, home, none). With the old rule, which only asks
  for a reminder, it skips thinking, as on the old prompt.
- The line-break rule and where the tours sit change nothing about thinking.
- Three runs without thinking and without a break say nothing about the break rate: the old
  prompt broke 4 in 15 without thinking.
- **It thinks for every traveller, not only one who needs a visa summary.** Today's prompt with
  no passport and with a home one (`Passport: Portugal (the destination's own country)`):

  | Variant | Passport line | Thinking tokens per run | Seconds | Broken |
  |---|---|---|---|---|
  | `no-passport` | none | 5,424, 5,199, 6,623 | 57–64 | 0 |
  | `home-passport` | Portugal, marked as home | 5,882, 6,106, 5,790 | 58–60 | 0 |

  So the rules' presence in the system prompt brings on the thinking, whatever the trip asks of
  them: a little less (about 5,800, against 6,600 with a Brazilian passport), never none.

### Without thinking, today's prompt breaks less, but still breaks

Today's prompt with thinking set on purpose. `thinking-off` ran 15; the batch was stopped after
18 calls (45 was more than the question needed), and the two effort levels were then brought to
6 runs each.

| Variant | Setting | Runs | Broken | Thinking tokens | Seconds |
|---|---|---|---|---|---|
| `thinking-off` | `thinking: {type: "between_tools"}` | 15 | 0 | 0 in all | 23–31 |
| `effort-medium` | `output_config: {effort: "medium"}` | 6 | **1** | 0 in all | 5–21 |
| `effort-low` | `output_config: {effort: "low"}` | 6 | 0 | 0 in all | 21 |

- **The break is production's string again, now with the tours first**: `tours` holds one tour
  (749 characters, cut off before its `}`), and every field after it is filler that satisfies
  the schema: `objectsList: []`, `mustHave: []`, `title`, `description` and `tip` all `"x"`.
  The call ends after 5s and 469 output tokens.
- **Neither effort level thinks on this request**, so all three variants make the same call:
  today's prompt without thinking. Together: **1 broken in 27** (about 4%; between 0.1% and 19%
  at 95%).
- **Today's prompt lowers the rate; it does not remove it.** Without thinking the old prompt
  broke 4 in 15 (27%), today's 1 in 27.
- **With thinking, today's prompt has not broken: 0 in 36** (`baseline`, `main-order`,
  `no-passport`, `home-passport`). Against 1 in 27 without, that is not enough runs to say
  thinking prevents it; it may only make it rarer.
- **What in today's prompt lowers the rate is not measured.** Not the entry rules, which only
  bring on the thinking. The candidates: the line-break rule, which names the characters ("not
  the characters backslash and n") in the prompt and in three tool fields, and is about how
  text is escaped, which is how the list breaks; and the tours in their own section, first.

## Quality of the trips

Read from the saved runs, broken ones left out; no new calls. The trip is the same in all
(`validTripRequest`: Ana, a couple, Lisbon 1 to 8 May 2030, cultural, balanced, comfort,
carry-on, art and food, "Wants a day trip to Sintra", a Brazilian passport unless the variant
says otherwise). Grouped by what decides the content: the prompt and whether the model thought.

| | Today's prompt, thinking | Today's, no thinking (`thinking-off`) | Today's, `effort: low` / `medium` | Before 2m-a (`pre-2m-a`) |
|---|---|---|---|---|
| Trips read | 42 | 15 | 11 | 11 |
| Tour words (110–130 asked) | 108–129 | 108–126 | 103–126 | **95–164** |
| Sintra among the tours (the note) | all | all | all | all |
| Description, words | 82–111 | 90 | **65–66** | 114 |
| Tip, words | 130–189 | 163 | **112–119** | 120 |
| Tip states the entry rule (visa-free, 90 days, Schengen) | all with a Brazilian passport | 15 of 15 | 11 of 11 | none: a reminder only, as asked |
| Tip mentions ETIAS | all with a Brazilian passport | 8 of 15 | 5 of 11 | none |
| **Spots that 1 May is Labour Day** | **36 of 42** | **0 of 15** | **0 of 11** | **0 of 11** |
| Knows the trip is in 2030 (ETIAS "may apply by 2030") | 30 of 36 with a foreign passport | 0 | 2 | 0 |
| An entry item in the must-haves | 15 of 36 | 0 | 0 | 0 |
| Written `\n` in the description and tip | **12 of 42** | 1 of 15 | 0 | 0 |
| Packing list, items | 11–15 | 12–13 | 11–12 | 11–13 |
| Repeats the traveller's camera or walking shoes | none | none | none | none |
| Name in the title / in the description | all / about once | all / under once | all / about once | all / about once |

- **Thinking buys the details that need working out.** The trip starts on Wednesday 1 May,
  Portugal's Labour Day: a thinking trip says so in 36 of 42 and moves Sintra to a weekday
  ("Wednesday 1 May is Labour Day in Portugal, so some museums and shops may close and Sintra
  will be busy… consider saving Sintra for Thursday 2 May"); no trip without thinking does, in
  any prompt: 0 of 40, `old-entry`'s three included. A thinking trip also places ETIAS against the trip's year and adds
  the entry document to the must-haves.
- **Without thinking the trip is still good and personal.** The tours, the packing list, the
  note (Sintra), the interests, the carry-on and the couple are covered as well as with
  thinking; the tours stay in their word range. What it lacks is the calendar: the holiday,
  the year, weekday closures. One typo was seen ("miyadouros", `thinking-off`), not counted
  elsewhere.
- **`low` and `medium` write less**: a description of about 65 words against 90 or more, a tip
  of about 115 against 160, and a shorter entry summary ("you can usually enter Portugal
  visa-free for short stays of up to 90 days… confirm them with Portugal's official sources").
  `thinking-off` keeps the full length; at its default effort (`high`) only the thinking is off.
- **The prompt from before 2m-a** misses the tours' word range (95 to 164) and gives no entry
  rule, as it was told to.
- **A written `\n` comes mostly with thinking**: 12 of 42 trips, always in the description and
  the tip together, against 1 of 26 without. 2l renders the tip's; the description's is 2m-c.

## Cost and time

Sonnet 5.5's output is $10 per million tokens, thinking included. Input is about 2,800 tokens a
call, mostly read from the cache, under a cent.

| Variant | Output tokens | Thinking | Visible trip | Per run | Mean time |
|---|---|---|---|---|---|
| `baseline` | 9,318 | 6,562 | 2,757 | $0.095 | 66s |
| `main-order` | 9,535 | 6,713 | 2,823 | $0.098 | 66s |
| `pre-2m-a` | 2,218 | 0 | 2,218 | $0.024 | 20s |
| `thinking-off` | 2,703 | 0 | 2,703 | $0.028 | 25s |
| `effort-medium` | 2,040 | 0 | 2,040 | $0.021 | 18s |
| `effort-low` | 2,389 | 0 | 2,389 | $0.025 | 21s |

The thinking that stops the bug makes every trip about **4× the cost and 3× the time** of the
prompt before 2m-a. Production makes the same call, so this is what PR #239 changed there too.
A trip that broke cost $0.013 for nothing; a thinking trip costs about $0.07 more every time.

With the thinking off, today's prompt costs what the old one did: about $0.025 a trip and 20 to
25s, a quarter of the cost and a third of the time of production today. A break fails early
(5 to 13s, under $0.015), so a retry after one costs less than any trip. That holds without
thinking: with it no break was seen (0 in 36), and one would come after the thinking, so its
retry could cost a whole thinking trip again, up to about 80s and $0.095.

The measurements so far: $1.43, $1.46, $0.36, $0.71 for the three trigger
variants, $0.53 for the no-passport and home ones, $0.47 for `thinking-off` and
the first `effort-medium` runs, and $0.21 for the rest of the two effort levels: about $5.50.

## Conclusion

- **Cause, as far as measured:** the slip happens when the model writes the trip without
  thinking (4 in 15, 2 in 6), and has not happened with thinking (0 in 30). The schema order is
  not the cause. What brings on the thinking is 2m-a's entry rules, in the system prompt, for
  every traveller (no passport and a home one think too). It is a side effect: nothing in the
  request asks for it, and a later change to those rules could stop it. Without thinking,
  today's prompt still breaks (1 in 27, the old one 4 in 15); with thinking it has not (0 in
  36), too few runs to say thinking prevents it.
- **The schema order stays aligned with the prompt**: the model writes in the schema's order,
  so the two should agree. It is not the fix.
- **Decided (2026-10-27): one retry on a broken list, and the thinking left as it is.** No
  setting makes Sonnet 5.5 think, so the thinking can't be counted on to protect the list; the
  retry protects it whatever the prompt does: cheap without thinking, up to a whole trip again
  with it (a case not seen in 36). The thinking stays for the trip's quality, and branch 6
  weighs it against its cost across many cases. `PLAN.md` (2m-b) has the build.
- **The two ways that were weighed:**
  - **Keep the thinking, on purpose:** production as it is (0 in 36), at 4× the cost and 3× the
    time, with the setting made explicit so a prompt change can't switch it off. Not shown to
    be zero. It also writes the better trip: the calendar (Labour Day in 36 of 42, never without
    thinking), the trip's year, the entry document among the must-haves.
  - **Thinking off, and one retry on a broken list:** about 4% of trips break; a break fails in
    5 to 13s for under $0.015, so a retry adds about 1% to the cost, against 4× for the
    thinking. A retry was ruled out in 2k as "a second paid call per failure"; at these numbers
    that call is the cheaper one. The trip stays personal but loses the calendar; keep
    `effort` at `high`, as `low` and `medium` shorten the description and tip by a third.
- **Either way the list can break**, so `generateTrip`'s check stays, and the production string
  comes back as a fixture for whichever fix is built.
- **Open:** whether production has logged "generateTrip: invalid trip" since 2m-a deployed.
