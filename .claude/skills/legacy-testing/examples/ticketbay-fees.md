# Example: a plan for TicketBay's untested fee code

A real run (2026-09-29). The tests for `src/domain/fees.ts` had been deleted; the prompt was
"Some of the domain code has no tests anymore and I want a safety net before I refactor it."
The skill was not named; the agent picked it from the description.

## What the assessment surfaced
- Stack: TypeScript, npm, Vitest, fast-check, Stryker, Playwright; CI gate present.
- Untested logic, ranked by decisions: `lib/status.ts` (5), `lib/clock.ts` (3), `src/domain/fees.ts` (2).

## The plan the agent proposed, then stopped
```
Area: src/domain/fees.ts — load-bearing: the service fee + VAT on every invoice
1. Measure (baseline) on fees.ts — why: invoice tests may already kill some fee mutants.
2. Characterize serviceFee + vatPortion — why: pin today's results at 0, the 100/2000
   limits (3333/3334, 66666/66667 cents), rounding at .5, the 27% VAT rate.
3. Property tests — why: money math with limits: 100 ≤ fee ≤ 2000; fee never decreases
   as the total grows; 0 ≤ vat ≤ gross; vat + net = gross.
4. Measure — done when no surviving mutant changes the fee or the VAT.

Area: lib/status.ts — load-bearing: the right badge (sold-out / past / cancelled)
5. Characterize eventStatus — pin each status and the priority order.

Area: lib/clock.ts — load-bearing: the test clock must stay off in production
6. Characterize now() with a mocked cookie reader.

Skipped: make it testable (fees and status are pure), approval tests (small outputs),
refactor (after the net).
```

## Why it is a good plan
- It aims at the money first and says why for every step.
- It found a suspected bug (`serviceFee(0)` is 100, so a 100%-discount order still pays a fee)
  and pinned it for the user instead of "fixing" it.
- It skipped the steps this repo does not need, with the reason.

This run predates two defaults added on 2026-10-04: a crash-hunt property on every entry point of the target, and the refactor as the plan's last step. A plan written today lists both.
