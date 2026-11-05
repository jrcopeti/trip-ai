# Writing `tour-<n>.notes.json`

The notes are the only place the model writes. `annotate.mjs` checks every
field against the diff and the author's text, and refuses the whole file on
any error — fix the notes and run it again (re-running on an annotated report
is safe; it replaces the previous notes).

## Shape

```json
{
  "attention": {
    "level": "high",
    "whatHappened": "Product prices are now cached for five minutes, and checkout reads the cache.",
    "why": "Customers can be charged a stale price; the PR says checkout always uses the live price.",
    "file": "src/cart/checkout.ts", "line": 41, "code": "getPrice(item.sku)"
  },
  "whatItDoes": "One or two sentences: what the diff actually does.",
  "why": "Prices change a few times a day, and every page load hit the database.",
  "points": [
    "prices are cached for five minutes in [getPrice](src/catalog/prices.ts)",
    "[checkout](src/cart/checkout.ts:41) now reads the cached price",
    "no test covers a price change during checkout"
  ],
  "shape": [
    { "title": "Where checkout gets its price", "kind": "call-tree", "lang": "diff",
      "code": " checkout(cart)\n   for item in cart\n-    getLivePrice(item.sku)\n+    getPrice(item.sku)\n+      cache.get(sku) ?? load(sku)" }
  ],
  "chapters": [
    { "title": "The cache", "description": "Where prices are stored and for how long.", "files": ["src/catalog/prices.ts"] },
    { "title": "Who reads it", "description": "Checkout switches to the cached price.", "files": ["src/cart/checkout.ts"] }
  ],
  "explains": [
    { "quote": "Cache product prices for five minutes", "files": ["src/catalog/prices.ts"] }
  ],
  "claims": [
    { "quote": "Checkout always charges the live price.",
      "file": "src/cart/checkout.ts", "line": 41,
      "code": "getPrice(item.sku)",
      "note": "Checkout now calls the cached getPrice. Check which price a cart pays after a price change." }
  ],
  "items": [
    { "severity": "high", "file": "src/cart/checkout.ts", "line": 41,
      "code": "getPrice(item.sku)",
      "title": "Checkout may charge a price up to five minutes old",
      "why": "getPrice is the cached function from prices.ts. The PR says checkout uses the live price." }
  ],
  "fileNotes": {
    "src/cart/checkout.ts": "**One call changed, and it decides what the customer pays.**\n- `getLivePrice` becomes the cached `getPrice`\n- nothing refreshes the cache when a price changes"
  }
}
```

## Attention (how much of a reviewer's attention this PR needs)

Judge the change after you have read it, not from its title or size.

| Level | Use when |
|---|---|
| **critical** | on a path that runs today, it will very likely break money, access, or stored data — or it destroys data that cannot be restored (a dropped column, a deleting migration) |
| **high** | it can change money, access, stored data, or who gets a scarce thing; or it contradicts what the author says; or it hides a change (a skipped test that covers it, an unstated change of behaviour) |
| **medium** | a real behaviour change a reader should understand, with a contained impact; or a high-level risk in code nothing calls yet |
| **low** | mechanical or contained: renames, formatting, tests only, dependency bumps with nothing notable |

- **When two rules pull both ways, take the higher level** and say why in
  `why`. Example: a hidden change (high) in code with no live caller (one
  lower) stays high.
- **Code nothing calls yet** is judged one level lower than it would be when
  wired, and the `why` says what happens once it is. This lowers the PR's
  attention only; item severities stay as they are.
- **Money moved or charged** counts as money. A wrong amount that is only
  displayed is medium at most.
- **A money or data action on a live route with no access check** is critical.
- **A draft is judged like any PR.** Say it is a draft in `why`; do not lower
  the level for it.
- **Notable in a dependency bump:** a major version change (direct or in the
  lockfile), a raised `engines` floor, a new package, a new install script.
  A notable bump is medium; a bump with nothing notable is low.

- `whatHappened`: one sentence, plain words, what the PR really does.
- `why`: one sentence, why it deserves this level. Name the risk, not a verdict.
- `file` / `line` / `code`: the one line that drives the judgement. Required for
  everything above **low**, allowed on low.
- Big is not heavy. A 900-line rename is **low**; a one-token change to a price
  is **critical**.

## The page (what each field becomes)

The reader sees, top to bottom: a **TL;DR** card (headline = `attention.whatHappened`,
What = `whatItDoes`, Why = `why`, Attention, Size, Intent), the **Overview**
(`points`), the **Shape of the change** (`shape`), **Where to look** (`items`),
**Intent and evidence**, then the **walkthrough** (`chapters`, each file card led by
its `fileNotes`). Everything is optional except `whatItDoes` and — when `pr-triage`
runs you — `attention`; empty fields simply do not show.

- `why` — the author's **own** reason, quoted verbatim (4+ characters, exact case)
  from the description, an issue, a commit, or the spec. Pick the sentence that
  says why, not what. Leave it out when no source gives a reason; the page then
  quotes the description's first sentence, or shows UNKNOWN.
- `points` — 3–5 short lines (max 6, 240 chars each) that together tell the whole
  change. Link the **keyword**, not the whole line: `[checkout](src/cart/checkout.ts:41)`.
  Every link target must be a file (optionally `:line`, new side) in the diff.
- `shape` — 1–3 compact views of the code's **structure**, show-me style, each at
  most 30 lines: `call-tree`, `schema`, `types`, `pseudocode`, `component-tree`,
  `file-tree`, `contract`. `lang` is `diff` (with `+`/`-` lines, when an
  existing shape changes), `text` (trees and pseudocode), or the code's
  language (`ts`, `sql`, `py`, `go`) when you show a whole new shape. Keep only the calls,
  fields, and files the reader needs. Skip `shape` for a rename or a bump.
- `chapters` — the walkthrough, in the order a reader should go: most important
  first (the core change → the wiring → tests and config). Every non-noise file
  once, and never a noise file (noise stays collapsed); a test with a paired
  code file follows it by itself. A PR that is all noise has no chapters. Each chapter gets a
  one-line `description`. Up to 6 chapters; a small PR needs one or two.
- `fileNotes` — per file: a **bold one-line takeaway**, then 2–5 `- ` bullets with
  the specific changes, identifiers in backticks. A trivial file needs only the
  takeaway. A paragraph of prose triggers a warning.

## Writing: one person talking to another

These rules apply to every field a reader sees. They are adapted from
`visual-skills`' plain-language guide and HumanLayer's `show-me` (both MIT).

- Start with the point. Put context after it.
- One idea per sentence; aim for under 20 words.
- Use the plainest accurate word. Name a technical term only when it helps, and
  explain it in the same sentence.
- Keep code names, paths, and quotes exact, in backticks.
- No filler ("essentially", "it's worth noting", "simply"), no metaphors, no
  closing summary of what the reader just read.
- Show structure (a `shape` view, bullets) instead of describing it in prose.
- Never a verdict. The gate refuses "LGTM", "looks good", "looks safe", "is
  safe", "approve(d)", "ready to merge", "good to go", "ship it", "no issues",
  "nothing to review", "exploitable", "is secure" — in any field, even inside
  a longer phrase ("intended and approved"). Say what to check instead.

## Diagrams

Two kinds of picture appear above the code:

- **Where it fits** — computed, no model: the changed files and which uses
  which, read from the imports at the PR head. It shows only when three or
  more files are involved and at least two non-test files are linked. Red and
  amber mark files with high and medium findings. Hide it with
  `"changeMap": false` when it adds nothing.
  `changeMap: null` in `tour-N.json` means no map will show — then say
  nothing. Hide a map that only repeats the chapters (three files in a line).
  `false` hides it; the computed map stays in the JSON for agents.
- **`diagrams`** — yours, 0–2, only where **flow or structure changes** and a
  picture explains it faster than the diff. Most PRs need none. Both
  `diagrams` and `changeMap` are top-level fields of the notes.
- **A flow gets one picture.** A diagram shows how several parts talk; a
  `shape` view shows the structure of one function, type, or table. Never
  draw the same flow as both.

| When the change… | Draw a |
|---|---|
| alters who calls whom, or the order of calls | `sequence` (`sequenceDiagram`) |
| sends a wrong value through the same calls | `sequence` with the numbers in the messages |
| changes what happens when a step fails | `sequence` with `alt` / `else` for the failure path |
| adds or changes a lifecycle (paid → refunded) | `state` (`stateDiagram-v2`) |
| changes tables or relations | `er` (`erDiagram`) |
| reroutes a decision or a pipeline | `flowchart` (`flowchart LR`) |
| reshapes types and their links | `class` (`classDiagram`) |

```json
"diagrams": [{
  "title": "What a full cancel pays",
  "kind": "sequence",
  "mermaid": "sequenceDiagram\n  participant S as cancelOrder\n  participant R as refund module\n  participant P as payments\n  S->>R: previewCancellation()\n  R-->>S: gross 100.00, fee 2.00, net 98.00\n  S->>P: refund(net - fee) = 96.00",
  "caption": "The fee comes off twice: `netCents` already excludes it."
}]
```

Rules: at most 40 lines; 3–8 boxes or participants; real names from the
code; the numbers of a concrete example when it makes the point. Quote any
label with brackets, parentheses, or a slash: `A["refund (net)"]`. Write
sequence messages as `A->>B: text`. The gate rejects a diagram that does
not parse into real content, and it is rendered to SVG when the page is
packed — a broken one shows its source instead.

## Reading the diff

Read it as a diff — `gh pr diff <n>` or `git diff <base>...<head>` — in the
reading order from the JSON. The JSON's `files[].hunks[].lines[]` holds the
same lines as objects (`t` add/del/ctx, `s` text, `n` new line number, `o` old
line number); use it to look up a line number, not to read.

**Skim the noise, do not skip it.** Collapsed files are hidden from the human,
not from you. A lockfile can carry the real change (a transitive major bump,
a new install script). Items may point at noise files.

## Pointers: `line` + `code`

`line` is the **new-file** line number (`n`). For a removed line set
`"side": "old"` and use the old number (`o`). `code` is a verbatim fragment of
that line, 3+ characters; the gate checks the line contains it, which catches
the off-by-one a bare number cannot. Get both from the JSON, or from
`git show <head>:<file> | sed -n '<line>p'`.

## The intent map (`explains`)

Split the author's words into the things they say the PR does. Each `quote`
is verbatim (exact case, 4+ characters) from any intent source — title,
description, issue, commit, spec.

- Title "Gift cards: issue, redeem at checkout, expire after a year" → four
  entries: the part before the colon, and each listed action.
- Quotes may span a line break in the source; whitespace is normalised.
- Use the most specific words. When the description says it better than the
  title, map the description and let the title map to nothing — an unmatched
  title is fine.
- List **code files only**. A test inherits the explanation of the code it
  tests; list a test only when it has no changed code file to pair with.
  Noise never needs a reason; you may map it, and it never shows as ASK WHY.
- Map a file when the quote explains its main change. When the file also
  does something unstated (a migration that adds the described column *and*
  drops another), still map it, and point a high or medium item at the
  unstated part — that item is the finding. Leave a file out only when
  nothing the author wrote explains it at all.
- A PR whose every file is noise needs no intent map.
- A file with a small unstated extra (one added attribute) is still ASK WHY —
  that is honest; say it is small in its file note.
- A sentence about tests maps to the test file (list it, even when paired).
- A quote whose whole change is noise (a rename) maps to the noise files.
- Quotes are verbatim: backticks, if the author wrote them, are part of it.
- A quote with no matching change: `"files": []`.
- A file nothing explains: leave it out. The gate lists it as ASK WHY.

## Claims

A claim is a **checkable promise** — a sentence that could turn out false:
"no behaviour change for X", "idempotent", "only formatting", "seats stay
sold", "the UI comes in a follow-up", "no new dependencies" — and a title
that promises an outcome ("Speed up booking tests"). List every checkable
promise, whether it holds or not; the `note` says what to check. A sentence
can be both an intent-map quote and a claim. Descriptive text
("adds gift cards") is intent-map material, not a claim. Point each claim at
the line where a reader can test it (`side: "old"` works here too); a claim
with no single line gets no `file`. No claims is a valid answer. When the
code contradicts a claim, also add a high item at that line.

## Items (LOOK HERE), at most 8 of yours

The eight counts only your items; FACT and ASK WHY items come on top. Do not
restate a FACT. To add what a FACT cannot know — the consequence — point
your item at where the consequence lands (the caller that loses the dropped
column), or at the same line with the connection in `why` ("the skipped test
is the one this change breaks").


| Severity | Use for |
|---|---|
| **high** | can change money, permissions, stored data, or who gets a scarce thing (seats, stock, quota); or contradicts a stated claim |
| **medium** | a behaviour change nobody mentioned, or one worth a test |
| **low** | worth a glance: cost, naming, a missing edge case with small impact |

Items point inside the diff hunks: at added, removed (`side: "old"`), or
context lines shown in the hunk. Something outside the diff goes in the
`why` of an item that points at the line in the diff it affects. A low PR
needs items only for what a reader should still check. Look for: a claim
the code contradicts; a risky decision nobody mentioned; a
missing security decision (a new input with no validation, a new action with
no authorization check, a secret reaching a log); an edge case the tests skip;
a code comment that promises something the code does not do (comments are not
intent, so they are items, never claims).

Phrase each as what to check. Skip what the typecheck, linter or CI already
catch.

**Dependency-only PRs:** CI runs the tests, so point at what CI does not
decide — transitive major bumps in the lockfile, changed `engines`, new
install scripts, packages that changed owner, a tool whose output (coverage,
mutation score) can shift silently.
