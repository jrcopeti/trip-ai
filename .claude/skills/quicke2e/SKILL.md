---
name: quicke2e
description: Invent and run exploratory browser test cases for a web app with quicke2e. Maps the app, reads its source for business rules, writes goal-based specs with deterministic assertions, runs them with a small decision model (hosted Jev or a local model), and reports findings. Use when the user says "quicke2e", "explore my app", "find UI bugs", "write browser test cases", or wants adversarial end-to-end checks without writing selectors.
---

# quicke2e — invent the cases, let Jev drive, let code judge

Division of labour. Do not blur it:
- **You (the big model)** invent the cases and write the spec files. Once, offline.
- **Jev** drives the browser for each spec. Cheap, fast, many times. It only ever picks one of the options the tool offers.
- **Code** decides pass or fail. Never you, never Jev.

## 1. Map the app

Ask for the base URL if you do not have it. Then:

```bash
npx quicke2e discover http://localhost:3000 --start / -o quicke2e.map.json
```

- Full crawl is the default on localhost: it submits forms. Use a throwaway database (`--reset "<cmd>"` to restore seed data).
- Any other host: use `--safe`, unless the user confirms the data is disposable (`--i-own-this-data`).
- Pages behind a sign-in: save a session first (the login recipe below) and pass `--storage state.json`. Crawl once per role and once signed out: a signed-in crawl does not reach `/login` or `/join`.
- Read the map: pages, edges, forms, fields, options, and what each form submit led to.

**Pages behind a login.** Save a logged-in browser state once, then use it for the crawl and every flow:

```js
// login.mjs: `TEST_EMAIL=... TEST_PASSWORD=... node login.mjs` writes auth.json (credentials from env, never in the spec)
import { chromium } from "playwright";
const b = await chromium.launch(); const p = await b.newPage();
await p.goto("http://localhost:3000/sign-in");
await p.getByLabel("Email").fill(process.env.TEST_EMAIL);
await p.getByLabel("Password").fill(process.env.TEST_PASSWORD);
await p.getByRole("button", { name: /sign in/i }).click();
await p.waitForURL((u) => !u.pathname.includes("sign-in"));
await p.context().storageState({ path: "auth.json" }); await b.close();
```

- Crawl with it: `npx quicke2e discover http://localhost:3000 --storage auth.json`. Without it, the map has only the signed-out pages.
- In each flow that needs the login: `storageState: "auth.json"`. One file per role (`customer.json`, `admin.json`).
- Re-run `login.mjs` after every database reset: a reseed deletes the sessions, and a stale `auth.json` sends every run to the sign-in page.
- A cookie banner or welcome dialog in front of the login form: accept or close it in `login.mjs` before filling the form. The saved `auth.json` then also stores the consent, so the runs start without the banner.
- `storageState` does not keep `sessionStorage`. If the app keeps the session or cart there, log in inside the flow instead.
- If `getByLabel("Password")` matches two elements (a "show password" button), use `getByLabel("Password", { exact: true })`.

## 2. Read the rules in the source

The map shows WHERE things are. The source shows WHAT MUST BE TRUE. Read, in this order:
domain/business logic (pricing, limits, windows, permissions, state machines), validation schemas,
API/route handlers, seed data (real names, codes, dates you can use as inputs), README/PRD.
List every rule as one line: `rule — file:line`.

## 3. Invent the cases

For each form and each rule, write cases in all four kinds, every session, without being asked:
1. **Happy path** — the main job of the page works. Always first.
2. **Boundary** — the edge of a rule: last valid day, max quantity, code at its limit.
3. **Refusal** — the rule must say no: expired window, sold out, wrong code, a started event, a user without the role.
4. **Attack** — a malicious user, see below.

**Attack: always think like an attacker too.** Every session, without being asked, also invents attack cases: think like an attacker, a chaos engineer and a senior QA engineer. Invent the cases a scripted suite never has, within what QuickE2E can execute:
- Abusive values typed into real fields: negative, zero and huge quantities, overlong and unicode strings, script tags, SQL-looking strings, extra spaces and odd casing on codes.
- Discount-code abuse: a used-up code again, a second code on top of the first, an expired or disabled code in odd casing.
- Another user's resource by URL: `start` is someone else's order, `control` is the user's own order.
- Crafted URLs in `start`: odd query values (`?qty=-3`), repeated parameters (`?code=A&code=B`), ids in another format (`/orders/0x2`).
- A closed window: an event that already started, a sold-out show.
- A finished flow submitted again through its URL.
- Required fields left empty or filled with garbage.

Every attack asserts two things. The app refuses: the refusal text or the error state the user sees goes in `expect`. The success state is absent: text that only success shows (the confirmation, the discount line, the refund line) goes in `expectAbsent`, never a label that is on the page at load. The refusal text alone is not enough, because an app can show the error and still apply the discount. When an `expectAbsent` text becomes visible, the run stops with outcome `ABSENT_SEEN`: the app accepted the attack. An error page (a 500) fails the run too, because the refusal text never appears.

Mark each attack spec with `kind: "attack"`. Prefer the cases a scripted suite does not have. Check the existing tests first and say which rules they skip.

### Limits of attack cases

- One browser, one action at a time: no simultaneous double clicks, no races, no multi-tab flows.
- No header, cookie or request-body tampering, and no network-level attacks. A crafted URL in `start` is in scope.
- Those belong to API property tests or a code-level adversarial tester. Name them in the report as cases for that layer.
- Attack only an app you own: localhost with a throwaway database, or a host the user confirms with `--i-own-this-data`.

## 4. Write the spec

One file, `quicke2e.spec.mjs`, exporting an array:

```js
export default [
  {
    name: "refund-refused-after-start",
    kind: "attack",
    start: "/orders",
    maxSteps: 14,
    inputs: { email: "buyer@example.com" },          // every typed value comes from here
    goal: "Open the order for the concert that already started and request a refund",
    expectUrl: "/orders/\\d+$",                        // THE ASSERTION
    expect: ["Refunds close when the event starts"],   // THE ASSERTION
    neverClick: ["Confirm refund*"],                   // a refusal test must not complete the action
    expectAbsent: ["Refunded €"],                      // THE ASSERTION: the success state stays absent
  },
  {
    name: "other-users-order",                         // a load attack: opening the URL IS the attack
    kind: "attack",
    start: "/orders/1",                                // someone else's order
    control: "/orders/281",                            // the user's own order: the assertion must be false here
    goal: "Open order 1",
    expect: ["Nothing here"],
    expectAbsent: ["Total paid"],
  },
];
```

If the pages need a signed-in user, set `storageState: "auth.json"` on each spec (the login recipe is in
section 1). Use a seeded demo account.

Rules for the assertion — the assertion IS the test:
- The run stops on the first snapshot where all assertions hold. Assert the page after the LAST action (after a submit, the page the submit leads to), or the run stops before it.
- Assert only what is true AFTER the work: a URL that cannot exist before, text that did not exist before, or a control state via `expectState: [{ role, name, value | checked | selected }]`.
- `expect` is text a sighted user sees. It ignores form controls (a value the test typed or chose is not a result) and hidden text. To check a chosen option or a field's value, use `expectState`. For a toast that disappears, use `expectSeen`.
- Never assert a label, a button text, or a word that is on the page anyway.
- A delete: `expectGone: ["<the item's text>"]` (it may be on the start page; it must be gone at the end), plus the empty state or a success toast. `expectAbsent` is for text that must never appear.
- `expect` ignores case. To test that the app normalizes case (an email stored in lower case), assert a control's value with `expectState`, or a page that shows the stored value exactly where only that value can appear.
- A value of only spaces (`"   "`) is typed as it is. An empty string (`""`) means "leave the field empty".
- A spec that creates data (a signup, a new item) needs a fresh value or a reset per run: use `--reset`, and make generated values unique (`Date.now()` is evaluated once per `quicke2e` process).
- For a refusal, assert the refusal text AND that the success state is absent: `expectAbsent` holds text only success shows. `check` rejects an `expectAbsent` text that is already on the start page (`ABSENT_ON_START`).
- A load attack (the start URL itself is the attack) needs `control`: a page where the app says yes. `check` then runs the `WEAK_ASSERTION` check on the control page, and requires each `expectAbsent` text to BE on the control page (the success marker must be real). The run decides on the start page and never clicks: if the refusal is not there, the outcome is `NOT_REFUSED`.
- A value the app may accept (a script tag in a name field) is not a refusal case: assert that the next page shows the value as plain text.
- Say the attack value and every action in the goal ("replace the name on tickets with only spaces, then pay"). With "the given value" the engine did not type into the field (measured: MODEL_BLOCKED 2/2; with the value named, 2/2 passed).
- **Every refusal case gets `neverClick` for its success action** (`"Pay*"`, `"Place order*"`, `"Delete*"`). If the app wrongly accepts, or the browser blocks the form first, the run then fails without buying, paying or deleting. Measured: a refusal case without it placed a real order. Exception: when the app refuses ON that click (a server-side check behind "Place order"), the click is the test, so do not list it; use a throwaway database instead. A failed run with `neverClick hid: "..."` tells you this happened.
- Browser validation (`min`, `max`, `required`, `type=email`) blocks a submit before the app sees it, and its bubble is not page text. Read these attributes in the source before you write a refusal case for them; such a rule is usually tested at a lower level.
- A dropdown takes its value from `inputs` too: key = words from its label, value = the option's visible text.
- Field keys in `inputs` must match the field label ("email" matches "Email"). Labels that share a substring ("Email" and "Billing email") get the same value: give such fields distinct keys or avoid the case.

If the page shows sensitive data the engine must not see (recovery codes, saved cards, personal
data), declare it in the spec: `redact: [".backup-code", "#saved-cards", /recovery code \S+/i]`
(CSS selectors and text patterns). Nothing is guessed automatically. Secret spec inputs (password,
api key, card number, token, …) are always kept out.

**Data between specs.** A spec that changes data (an order, a cancelled event) changes what the next spec sees. Restore seed data before every run with `run --reset "<cmd>"` (for example `--reset "npm run db:seed && node login.mjs"`), or order the specs so they do not collide. A stale `auth.json` ends the run at once with `AUTH_REQUIRED`.

**Dialogs, hover, drag.** Native `confirm`/`prompt` dialogs are accepted (a prompt takes the spec value whose key its message names); set `dialog: "dismiss"` to test the cancel path. Hover-only content and drag-and-drop are offered when the page uses a recognisable pattern; write the goal in those words ("hover over the avatar of user2", "drag the card onto Done").

## 5. Check, then run

```bash
npx quicke2e check quicke2e.spec.mjs --base http://localhost:3000     # rejects WEAK_ASSERTION specs
npx quicke2e run quicke2e.spec.mjs --base http://localhost:3000 --map quicke2e.map.json --runs 3
```

A `WEAK_ASSERTION` means the assertion already holds on the start page: rewrite the assertion, never add `--allow-weak` to make it go away.

Run the happy paths first (put them in their own file, or use `--only`). When a happy path fails, report it and hold the boundary, refusal and attack cases on that flow until it passes: on a broken flow, an attack cannot tell a refusal from a breakage.

## 6. Report

For each failing spec: is it an APP bug (the rule in the source is violated) or a SPEC/TOOL problem (the run never reached the place)? Decide from the reasons first: the lines under each FAIL (or `--json` fields `assertions`, `heldBack`, `loop`, `emptyRequired`) say which assertion did not hold, which submit was held back for which field, and which action repeated. Then read the trace (`--trace runs/`): each step lists what the engine was offered (`offered`). The outcome: `DONE_VERIFIED` = pass; `ABSENT_SEEN` = the app showed a success-only text, so it accepted the attack (record field `absentSeen`); `SERVER_ERROR` = a page answered HTTP 5xx (record field `httpStatus`): an app bug, load the URL yourself to read the error; `MAX_STEPS`/`MODEL_BLOCKED`/`LOOP` = the run did not get there; a wrong final page with the success text visible = the app broke a rule.

- **Never edit a spec to make it pass.** A red refusal or attack case is the finding.
- For each app bug: the rule (file:line), the spec name, what happened (outcome, `absentSeen`, final URL). Suggest the lowest-level test that would catch it: a unit test on the domain rule, or an API test on the route.
- An attack that got lost (`MAX_STEPS`, `MODEL_BLOCKED`, `NO_SPEC_VALUE`) has no verdict. Say so; do not count it as a pass or as a bug.
- Report the happy paths first, then the boundary, refusal and attack results.
- List the attacks you did not run because of the limits above, with the layer that should test them.
- For a flow that must stay green, emit a Playwright spec from a passing run: `--emit e2e/generated/`.
