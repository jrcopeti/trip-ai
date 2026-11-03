# The trip generation

`GenerationProvider` owns the generation for the whole app, so it outlives `/form`. `GenerationToast`
keeps the lasting toasts (planning, ready, failed) equal to `toastsFor`; the provider's effects show
the one-off notices (trip opening, failed on `/form`, cancelled).

## The state, as tables

The state is a generation in flight (a token, or none), a last trip and a last failure:

| Slot | Value | Meaning |
|---|---|---|
| trip | `ready` | landed off `/form`; a toast offers it until its page |
| trip | `opening` | landed on `/form`; the traveller is being sent to it, and the loader stays until its page |
| failure | unseen | its toast shows off `/form` |
| failure | `seenOnForm` | the failure panel on `/form` has shown it; leaving `/form` drops it |

What each action does, from any state (anything not listed leaves that part as it is):

| Action | Next state | Effects, in order |
|---|---|---|
| `start` (token) | that token in flight; the failure dropped | abort the one in flight, if any |
| `land` on `/form`, the token in flight | none in flight; trip `opening` | clear the draft, remember the trip, open it |
| `land` elsewhere, the token in flight | none in flight; trip `ready` | clear the draft, remember the trip |
| `fail` on `/form`, the token in flight | none in flight; failure seen | the failure alert |
| `fail` elsewhere, the token in flight | none in flight; failure unseen | — |
| `land` / `fail`, any other token | unchanged (cancelled or superseded) | — |
| `cancel`, one in flight | none in flight | abort it, "Your trip was cancelled" |
| `route` to `/form` | an unseen failure becomes seen | — |
| `route` to the trip's page | the trip cleared; a seen failure dropped | — |
| `route` anywhere else | `opening` becomes `ready` (left before the redirect); a seen failure dropped | — |
| `clearFailure` | no failure | — |

The loader on `/form` (`isLoading`) and the prompt before a reload or a closed tab (`asksBeforeReload`):

| State | Loader on `/form` | Asks before a reload |
|---|---|---|
| one in flight | yes | yes |
| none in flight, trip `opening` | yes | no: a prompt can't tell a reload from the redirect falling back to a full load |
| anything else | no | no |

The planning toast shows while one is in flight, off `/form`. The trip and failure toasts, by route:

| State | `/form` | the trip's page | elsewhere |
|---|---|---|---|
| trip `ready` | ready, with View | — | ready, with View |
| failure unseen | — | failed | failed |
| trip `opening`, failure seen | — | — | — |

These tables are `transition`, `isLoading`, `asksBeforeReload` and `toastsFor` in `src/lib/generation.ts`, and
`src/lib/generation.test.ts` asserts every row from every state. A change to one row changes all
three places: the code, its test table and this page. "The trip's page" is that trip's own
page; another trip's page is "elsewhere".

## Accepted limits

- `land` and `fail` read the router's path as of the last committed navigation. A trip landing
  while a navigation is still committing is decided against the page being left: off `/form`
  it opens the trip; onto `/form` it shows the ready toast over the form, and the draft it
  cleared can come back, as the form already holds the answers and saves them on the next change.
- `opening` ends only on reaching the trip's page or leaving `/form`. Nothing on the loader can
  keep the traveller on `/form` meanwhile: it covers the nav, offers no Cancel while opening, and
  its one link leaves `/form`.

## One unanswered trip at a time, per browser

"Remember the trip" adds its url to a list in
localStorage (`src/lib/openTrip.ts`; a list, as two tabs can plan at once); either answer
(`useSaveTrip`) drops it. While one is stored, `/form` shows `OpenTripNotice` above every step,
with a View to the newest, and the review
step disables "Plan my trip"; the form stays usable and its answers wait in the draft.
`useOpenTrip` asks `isTripOpen` once per trip (not again on refocus) and drops one whose row is gone or saved.
It guides, it doesn't guard: a private window gets around it. Nothing on the server guards this
yet; the rate limit is planned for the grounded agent's branch 3.
