# PLAN — the logo after the wordmark

## Context

The nav showed the logo tile before "trip ai", the footer had no tile, and the
landing's lockup (#183) sized its tile at two-thirds of the word, bottom-aligned,
which read too small on a phone. Split out of `landing-content` (landing-refresh
Branch 6) so each PR does one thing; based on `main`, as it doesn't touch #184's
files.

## The change

- **Nav and footer:** the tile follows the word. The nav keeps `size="nav"`
  (32px); the footer gains `size="footer"` (40px, beside its `text-3xl` word),
  centred like the nav.
- **Lockup:** the nav and footer's alignment and proportion — centred beside the
  word, a touch taller than its line. `size="lockup"` is `size-[0.9em]` on the
  word's own `clamp(3.5rem,12vw,9rem)`, so it stays fluid: about 50px on a phone,
  130px at 1440.
- Tests: `SiteNav.test` and `SiteFooter.test` check the tile comes right after
  the word (both failed first); `Logo.test` the sizes; `landing.spec`'s lockup
  test, at 390/768/1440, that the tile is 0.9 of the word's font, follows it,
  and shares its centre line.
- Checked in the browser at 1440/768/390: nav, footer, lockup; no console errors.
