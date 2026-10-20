# Design notes — the `sorbet` system

How Trip AI looks and behaves, written down so new work matches it without re-deriving
it. Every route is on this system; the landing page was the first and is still the
reference.

**Read this before styling any page.** If something here disagrees with the code, the
code is right and this file needs fixing.

- The reference: `src/app/page.tsx` and `src/components/landing/*`
- The tokens: the `sorbet` block at the end of `@theme` in `src/app/globals.css`
- Plans: `docs/<topic>/PLAN.md` — the migration's is `docs/sorbet-migration/PLAN.md`

## Status

| Area | State |
| --- | --- |
| `/` landing | Migrated. The reference implementation. |
| Shared shell — nav, footer, loaders, 404, toasters | Migrated. On every route. |
| `/form` | Migrated. One white surface on canvas. |
| `/trips/[tripUrl]` | Migrated. Polaroid title, alternating sections, lime save/discard close. |
| `/saved-trips` | Migrated. The polaroid grid. |
| `/saved-trips/[id]` | Migrated. Same sections as the generated trip; back button and a lime back/plan-another close. |
| `/about` | Migrated. |

Every route is on sorbet, and it is the only system in the tree: the old palettes,
the `Container`/`GridContainer`/`GradientBg` panels, the unlayered `.label` rule and the
GSAP, Locomotive Scroll, Swiper, daisyUI and react-spinners packages are gone, and
HeroUI's semantic colours are mapped to sorbet on `:root`. `src/test/hygiene.test.ts`
fails if an old-palette class, a removed package or a `data-sorbet` scope comes back.

## Colour

Twelve tokens. The name describes the colour, not the job, so they survive any one
page's use of them.

| Token | Hex | Where it actually goes |
| --- | --- | --- |
| `sorbet-ink` | `#302e2d` | All text. Dark buttons, circular arrows, focus rings, the footer ground. |
| `sorbet-canvas` | `#f7f0e7` | Warm page ground — hero, nav, "Three steps". The default backdrop. |
| `sorbet-offwhite` | `#f6f6f6` | Text on ink surfaces; also the trip-types ground and the weather card. |
| `sorbet-lime` | `#e2f3a7` | Primary accent — the closing CTA ground, secondary buttons, a sticker, the logo tile (always lime, glyph in ink). |
| `sorbet-lime-punch` | `#e8ff98` | Higher-energy lime — one card tint, one sticker, one chip. |
| `sorbet-orchid` | `#eea1ff` | Secondary accent — one card tint, stickers. |
| `sorbet-lavender` | `#e9daf1` | Tinted surface — packing list, one card tint, one chip. |
| `sorbet-blush` | `#f2d9d9` | Tinted surface — one card tint, one chip. |
| `sorbet-cyan` | `#a7fff7` | One sticker, one chip. |
| `sorbet-indigo` | `#5a4dff` | Unused since the hero's eyebrow became a plain label. Kept as a token; reach for it only for a single deliberate accent. |
| `sorbet-white` | `#ffffff` | Section grounds, card fills, chip fills, the polaroid frame. |
| `sorbet-alert` | `#c2150c` | Error glyphs and field errors. The only red in the system. |
| `sorbet-success` | `#1e7d34` | The check on a finished result's toast ("Your trip has been generated!"). The only green; a glyph, never a fill. |

### Section grounds alternate

Reading top to bottom, the landing page runs
`canvas → white → offwhite → white → canvas → white → lime → ink`.

Adjacent sections never share a ground. That alternation is what gives the page
rhythm without any dividers.

**On white:** `bg-white` was used directly as a section ground and for chip fills
(`bg-white/70`, `bg-white/90`) before it had a name. It now has one —
`--color-sorbet-white` — and it is the same `#ffffff`. Both spellings are live; prefer
`sorbet-white` in new work, and never invent a second, slightly-different white.

### Tint on ink, not grey

There is no grey ramp. Secondary text is `sorbet-ink` at reduced opacity, which keeps
it warm against the canvas. The ladder in use:

| Opacity | Use |
| --- | --- |
| `/75` | Lead paragraphs |
| `/70` | Body copy, supporting text |
| `/60` | De-emphasised half of a two-tone heading; captions |
| `/50`, `/45` | Eyebrows and `<dt>` labels |
| `/40` | Step numbers |
| `/15` | Hairline rules (`border-t`) |
| `/5` | Nav hover fill |

On the ink footer this inverts: `sorbet-offwhite` at `/80`, `/60`, `/45`.

## Typography

**Rubik**, exposed as `font-sorbet`. Loaded in `src/app/layout.tsx` with weights
**400, 500, 600, 800**.

**700 is not loaded.** `font-bold` will synthesise a fake bold. Use `font-semibold`
(600) or `font-extrabold` (800).

`font-sorbet` is on `<body>`, so everything inherits Rubik — portals and toasters
included. Pages and the shared pieces (`SiteNav`, `SiteFooter`, the toasters, the
loaders, `NotFoundComponent`) also set it on their own root; that predates `<body>`
having it, and is harmless. Rubik is the only Google font loaded.

**One exception to Rubik: `font-sorbet-hand`.** Caveat (variable, 400–700), self-hosted
from `src/assets/fonts/` with `next/font/local` in `layout.tsx` as `--font-caveat`
(gotcha #10). It is for handwritten polaroid captions and nothing else. Caveat's x-height
is small, so never set it below `text-xl`.

### The scale is fluid, not stepped

Headings use `clamp()` so they resize continuously. These four are the whole vocabulary:

| Role | Class |
| --- | --- |
| Page h1 | `text-[clamp(2.75rem,7vw,5.5rem)] leading-[0.96] tracking-[-0.03em]` |
| Section h2 | `text-[clamp(2rem,5vw,3.5rem)] leading-[1.02] tracking-[-0.03em]` |
| Closing h2 | `text-[clamp(2.5rem,8vw,6rem)] leading-[0.95] tracking-[-0.04em]` |
| Wordmark | `text-[clamp(3.5rem,12vw,9rem)] leading-[0.8] tracking-[-0.05em]` |

**Bigger type gets tighter tracking and tighter leading.** That relationship is the
system; keep it if you add a size.

Everything else is Tailwind's default steps:

- Body — `text-lg leading-relaxed text-sorbet-ink/75 md:text-xl`
- Card title — `text-lg font-semibold leading-snug md:text-xl`, capped at `max-w-[14ch]`
- Step title — `text-2xl font-semibold`
- Eyebrow — `text-sm font-medium uppercase tracking-[0.18em] text-sorbet-ink/50`
- Meta label — `text-xs font-medium uppercase tracking-[0.12em] text-sorbet-ink/45`
- Chip — `text-xs font-medium` or `text-sm font-medium`

### Two-tone headings

A recurring device: one heading, two weights, two opacities — the claim in
`font-extrabold`, the qualifier in `font-medium text-sorbet-ink/60`.

```tsx
<h2 className="text-[clamp(2rem,5vw,3.5rem)] leading-[1.02] tracking-[-0.03em] text-sorbet-ink">
  <span className="font-extrabold">The packing list</span>{" "}
  <span className="font-medium text-sorbet-ink/60">reads the forecast first.</span>
</h2>
```

## Layout

One measure and one gutter, everywhere:

```tsx
<section className="bg-… px-5 py-20 sm:px-8 md:py-28">
  <div className="mx-auto max-w-6xl">…</div>
</section>
```

- **Measure** — `max-w-6xl` (72rem). No section is wider.
- **Gutter** — `px-5 sm:px-8`. Never less than 20px at any width.
- **Section rhythm** — `py-20 md:py-28`. The closing CTA takes `py-28 md:py-40`
  because it is the last beat.
- **Asymmetric splits** — `lg:grid-cols-[1.6fr_1fr]`, `md:grid-cols-[1.15fr_1fr]`,
  `lg:grid-cols-[1fr_0.8fr]`. Content column wider than its companion; never 50/50.
- **Breakpoints** — a custom `xs: 390px` exists before `sm`. Most work happens at
  `sm`, `md`, `lg`.

## Shape

Radius carries meaning; there are three tiers.

| Radius | What gets it |
| --- | --- |
| `rounded-full` | Every interactive thing: buttons, nav links, pills, chips, circular arrows |
| `rounded-3xl` / `rounded-2xl` | Cards and the logo tile |
| `rounded-[1.75rem]` / `rounded-[2rem]` | Media frames — larger than the cards they sit near |

Interactive is always a pill. If it can be clicked, it is `rounded-full` — that is the
single strongest signal in the system.

Only one shadow exists in the system, on the hero deck and the polaroid:
`shadow-[0_18px_40px_-24px_rgba(48,46,45,0.55)]`. It is ink-tinted, not black. Elevation
is otherwise expressed by background colour, not shadow.

### Buttons

```tsx
// Primary
className="rounded-full bg-sorbet-ink px-7 py-4 text-base font-semibold text-sorbet-offwhite
           transition-transform hover:scale-[1.03]
           focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sorbet-ink"

// Secondary — same geometry, lime ground, ink text
className="… bg-sorbet-lime … text-sorbet-ink"
```

Nav-sized: `px-5 py-2.5 text-sm`.

**A `<button>` needs `cursor-pointer`.** Tailwind v4's preflight resets buttons to the
default arrow; links keep the pointer on their own. Disabled-while-loading takes
`disabled:cursor-wait`.

**Do not use HeroUI `Button`.** Its shape, padding and press states are HeroUI's, not
the system's pills, and overriding all of them is more code than a plain element. Style
plain elements.

### The circular arrow

The system's one repeated ornament — a filled ink disc with a white arrow, bottom-right
of cards and inside chips:

```tsx
<span aria-hidden className="grid size-9 shrink-0 place-items-center rounded-full bg-sorbet-ink text-sorbet-offwhite">
  <FaArrowRight size={13} />
</span>
```

Sizes seen: `size-8` (chip), `size-9` (card), `size-11` (closing CTA, lime on ink).

## Motion

### The two rules that matter

**1. Reduced motion is handled centrally, never per component.**
`MotionProvider` is mounted once, in `src/app/providers.tsx`, so `<MotionConfig
reducedMotion="user">` is in force on every route. Framer then skips transform and layout
animations and keeps opacity and colour. Don't nest a second one around a page.

**Never branch what you render on `useReducedMotion()`.** It returns `null` on the
server and the real value on the client, so any branch that changes the rendered tree
produces a hydration mismatch — and React does not patch attribute mismatches. The
server's `opacity: 0` survives into the DOM with no animation left to clear it, and the
page goes blank for exactly the people who asked for less motion. This shipped once.

**2. Scroll-bound `MotionValue`s are not animations**, so `MotionConfig` does not cover
them. They write an inline transform. The opt-out is CSS:

```css
@media (prefers-reduced-motion: reduce) {
  .parallax-drift { transform: none !important; }
}
```

Any element whose `style` takes a `useTransform` output needs `className="parallax-drift"`.

### The shared reveal

`Reveal` is the only entrance animation. One import, one behaviour:

```tsx
<Reveal delay={0.08}>…</Reveal>
```

`opacity 0→1`, `y 16→0`, `duration 0.55`, `ease [0.22, 1, 0.36, 1]`,
`viewport={{ once: true, margin: "-80px" }}`. Stagger siblings with
`delay={0.06 * i}`.

### Values in use

| Thing | Values |
| --- | --- |
| Standard ease | `[0.22, 1, 0.36, 1]` |
| Intro ease | `[0.76, 0, 0.24, 1]` |
| Reveal | 0.55s |
| Hero deck | 0.6s, `y 28→0`, delay `0.3 + 0.15i` |
| Squiggle draw | 1.0s `easeInOut` on `pathLength` |
| Squiggle loader | 2.4s loop, `pathLength [0,1,1]` + `pathOffset [0,0,1]`, 0.2s rest |
| Loader sentence | words staggered 0.09s: `y 18→0`, `rotate ±6→0`, `blur 6px→0`, 0.7s; out 0.04s stagger, 0.35s |
| Sticker spin | `\|spin\|` seconds per turn, `linear`, `Infinity` |
| Parallax | `[0, 90]` slow / `[0, 170]` fast over the hero's scroll |
| Hover | `scale-[1.03]` buttons, `scale-105` pills, `-translate-y-2` deck cards and polaroids; the trip page's packing cards and Essentials pills drift — a per-item lift and lean (`trips/drift.ts`: `CARD_DRIFT`, and the gentler `PILL_DRIFT`), 0.5s with an overshoot ease `[0.34, 1.56, 0.64, 1]` |

Framer Motion is the only motion library. GSAP and Locomotive Scroll are gone, packages
and all.

### The intro

`Intro` plays at most once a day per browser: `Plan.` (450ms) → `Pack.` (350) → `Go.`
(450) → wordmark (850) → curtain exit (750), all constants at the top of the file.

It sets the `trip-ai-intro-seen` cookie (`landing/introCookie.ts`, 24 hours) when it
starts, and the landing reads it on the server: a browser carrying it gets no `Intro`
in the HTML at all, and `IntroProvider skip` starts `done`, so the hero plays at once.
Keep it a cookie — with localStorage the server can't know, sends the curtain, and the
client pulls it down after hydration: a flash of ink on every repeat visit.

It overlays the server-rendered page rather than gating it, so the hero is in the DOM
from the first byte. Two consequences:

- It measures `[data-wordmark]` in the nav to fly the wordmark into place. **Keep that
  attribute on the nav wordmark.**
- Anything in the hero that animates on mount would play behind the curtain and finish
  unseen. `IntroContext` exists for this: `useIntro().done` flips when the curtain
  lifts, and the hero gates the deck and the squiggle on it. `done` starts the same on
  server and client (`false`, or `true` under `skip`) so hydration stays clean.
- The hero's deck streams in: the page wraps `LatestTripsDeck` in `<Suspense>` with
  `HeroDeckFallback` (a `SquiggleLoader`, one polaroid tall) and hands it to `Hero` as
  its `deck` slot, so the landing is sent without waiting on the database.

Reduced motion and JS failure are both handled in CSS on `.landing-intro`
(`display: none` under reduce; a failsafe keyframe hides it at 4.5s).

## Components

Three directories, and which one a component lives in is the statement about its reach:

- **`src/components/sorbet/`** — the system's general-purpose pieces. Use these anywhere.
- **`src/components/ui/`** — the shared shell and the app-wide chrome.
- **`src/components/landing/`** — the landing page's own sections. Nothing else imports
  from here. The same goes for each page's directory (`about/`, `saved-trips/`, `form/`,
  `trips/`).

### Copy lives in `content.ts`

Every migrated page keeps its words in a `content.ts` beside its components —
`landing/content.ts`, `about/content.ts`. Headings, leads, eyebrows, button labels, link
targets, alts and sample data go there as plain exported objects; the components hold
layout and styling and render `{intro.lead}`, never a literal sentence. One file to read
to review or rewrite a page's copy, and JSX that is only structure.

What does *not* go in it:

- **Data the app produces or stores** — the AI's `tripData`, a `Trip` row, the weather.
  That arrives through props and queries as it does now; only the static copy *around*
  it (section headings, empty states, labels) moves.
- **Option lists that feed the form schema** — `sortedTypes`, `luggageSizes` and the rest
  stay in `src/data/index.ts`, because the schema and more than one route read them.
- **Shared-shell copy** — `SiteNav`, `SiteFooter` and the other `ui/` pieces keep their
  own, since they are not a page.

Keep strings as plain text (`you're`, not `you&apos;re`): JSX escaping only applies to
text written inline in JSX, and the file should read like copy.

`landing/copy.test.ts` holds the landing to this: it parses each component and fails
on JSX text with a letter in it, or a literal `label`, `alt`, `title`, `aria-label`,
`caption` or `href`. Units beside a number (`ºC`) stay inline, as on the trip pages.
The landing's wordmark is one constant in `content.ts` shared by the intro and the
lockup. `SiteNav` keeps its own (shell copy), and `SiteNav.test.tsx` checks the two
spell the same, since the intro's flight to the nav scales by the word's width.

| Component | Where | Notes |
| --- | --- | --- |
| `Reveal` | `sorbet/` | Use for every scroll entrance. |
| `MotionProvider` | `sorbet/` | Mounted once in `providers.tsx`; don't nest another. |
| `TripCard` | `sorbet/` | Pastel card: title, optional `body` line, chip, arrow. Takes `{ card, className, interactive }`. Owns the `ItineraryCard` type. |
| `Polaroid` | `sorbet/` | White frame, handwritten caption. `card` (default): a link, the traveller's username, arrow, fan tilt by `index` from `sm` up. `lg`: the trip title as h1, no link; rests on the fan's first angle from `sm` up and straightens and lifts on hover, like the cards. The caller wraps it in `Reveal`. Never on a white ground: the frame is white paper and only its shadow would show. |
| `SquiggleLoader` | `sorbet/` | Decorative: the `Squiggle` loop drawn on, carried along and drawn off on repeat — the app's only loading mark: `LoaderResponseAI`, the route `Loader`, the saved-trips grid and the form's city check. `react-spinners` is no longer imported anywhere (step 6 drops the dependency). Keeps running under reduced motion (it animates `pathLength`, not a transform), since it is the only sign the wait is not stuck. |
| `SquiggleArrow` | `sorbet/` | Decorative: the `Squiggle` hand, a loop dropping into a down arrow; draws on mount (see gotcha 14). Hangs from the `/saved-trips` search to point at the grid, with the phone's camera sticker opposite it below `md`. |
| `Logo` | `sorbet/` | Decorative (`aria-hidden`): the lime tile with the suitcase-and-passport glyph in ink. The glyph is `bg-sorbet-ink` masked by `src/assets/logo.png` (`mask-(--logo-mask)`, the static import's URL passed as that custom property), so only the PNG's alpha is used and the colour is the token's. It always follows the word. `size="nav"` (32px) in `SiteNav`, `size="footer"` (40px) beside the footer's `text-3xl` wordmark, `size="lockup"` in `WordmarkBlock`, fluid at 0.9 of the word's font (its own `clamp`, corners and inset in `em`). All three sit centred beside the word, after it, a touch taller than the word's line — at two-thirds of the word the lockup read too small on a phone. The wordmark text beside it is the accessible name. The favicons are `logo.png` as drawn — its own teal gradient, no tile, transparent ground — resized by `node scripts/render-icons.mjs` to `src/app/icon.png` (512px) and `apple-icon.png` (180px). Rerun it if the logo changes. |
| `SiteNav` | `ui/` | The nav, on every route. See below. |
| `SiteFooter` | `ui/` | The ink footer. Rendered per page, not by the layout. |
| `NotFoundComponent`, `Loader`, `LoaderResponseAI`, `ButtonBackOutlined` | `ui/` | Shell pieces, in the system. |
| `ToastCard`, and on it `CustomToaster`, `ErrorToaster` and `GenerationToasts` (planning, cancelled, ready, failed) | `ui/` | Every toast is one white card with the system's shadow, an info, success (green check) or alert glyph, all three message-square icons from `react-icons/bi`, and optional nav-sized pills below. A custom toast gets no live region from react-hot-toast, so the card carries `role` (`status`, or `alert` for the alert tone). It sizes to its text, and takes a fixed width only when it has actions. |
| `StickerBadge` | `sorbet/` | Decorative: circular text on `<textPath>`, slow spin. Takes `icon: ReactNode`. On the landing and the `/saved-trips` header. |
| `Squiggle` | `landing/` | Decorative: ink loop, draws on. Optional `play` gate. |
| `Intro`, `IntroContext` | `landing/` | Once a day per browser, by cookie (`introCookie.ts`). See "The intro". |
| `HeroDeck`, `LatestTripsDeck`, `HeroDeckFallback` | `landing/` | The hero's polaroid deck; the server half fetches, the page streams it in `<Suspense>`. |
| `Hero`, `WordmarkBlock`, `TripTypePills`, `PhotoBand`, `HowItWorks`, `WeatherPacking`, `ClosingCta` | `landing/` | Sections. The page renders per request (`connection()`): `PhotoBand` takes a photo picked by `pickTravelPhoto` (`src/lib/`), as `/about` does, then shows five sample tours as `TripCard`s with their kind chips. `Hero` deals the three latest saved trips (`getLatestSavedTrips`, through its `deck` slot, streamed) as `Polaroid` cards; a database error (Prisma's own timeouts included; there is no app-side limit, since only the deck's loader waits) or nothing saved means no deck — the hero just ends after its buttons. Below `md` they stack in a column with a gap, not overlapping. |
| `kindIcon`, `CARD_TINTS` | `sorbet/` (`kinds.ts`, `tints.ts`) | A tour kind's icon (compass off the list), and the five pastel card grounds cycled by index. Shared by the trip pages' tours and packing cards and the landing's sample tours. |
| `TripPage`, `Section`, `SectionHeading`, `MediaFrame`, `Closing` and the sections | `trips/` | Both trip routes. `TripPage` lays out the shared sections and takes the route's closing; `PhotoSection` is the trip's third photo between Tours and Packing, centred in a 4:3 frame at `max-w-4xl` (Unsplash photos are mostly 3:2, sometimes portrait; a full-width band cropped most of them away); Essentials has a spinning sticker in place of a photo; `Closing` is the lime last section (tip, then the route's pills — ink primary, ink-outline secondary, because a lime secondary vanishes on lime). `MediaFrame` is 16:10 when stacked, 4:5 beside copy from `lg`. |
| `ToursCarousel` | `trips/` | The suggested tours, one wide pastel card at a time. Controls **above** the card (counter, dots, previous/next ink discs, wrapping) so they never move; arrow keys and swipe too. WAI carousel semantics — named `carousel` region, `slide` groups labelled "n of total", a polite live region. Chips, title (`text-xl` → `lg:text-[1.75rem]`) and description (`text-lg md:text-xl`, ink/75) sit at the top of the card, so a short tour reads at once. Two chips: the number ("Tour 01", map pin) and the tour's kind with its own icon, as on the landing's itinerary cards. The AI returns five tours as `{ title, kind, description }`, `kind` one word from `TOUR_KINDS` (`src/lib/tourKinds.ts`), icons in `sorbet/kinds.ts` with a compass for anything off the list. Older saved trips may lack the kind (no kind chip) or the title too (plain strings: no title, no stand-in); `toTours` reads every shape. **Every tour is also rendered invisibly in the same grid cell**, so the card is as tall as the longest tour and the page below never shifts; `trip-journey.spec` pins the height with a deliberately long fixture tour. HeroUI v3 has no carousel. |

Server components by default. Only these are `"use client"`: `Hero`, `HeroDeck`, `Intro`,
`IntroContext`, `MotionProvider`, `Reveal`, `SiteNav`, `Squiggle`, `SquiggleArrow`, `StickerBadge`,
`LoaderResponseAI`, `ButtonBackOutlined` — i.e. only what needs hooks or motion.

### The polaroid

`Polaroid` (`sorbet/`) is the one component with a fixed spec — change it here first.
It is a photo on white paper with a fat bottom lip and a handwritten caption.

- **Frame** — `rounded-2xl bg-white p-3 pb-0` plus the system's one shadow
  (`shadow-[0_18px_40px_-24px_rgba(48,46,45,0.55)]`).
- **Photo** — `relative aspect-square overflow-hidden rounded-xl`, a radius tier below
  the frame.
- **Lip** — `px-1 pb-4 pt-3`.
- **Caption** — `font-sorbet-hand`, ink, `leading-none`. Never below `text-xl`: Caveat's
  x-height is small.
- **Tilt** — `POLAROID_TILT`, the fan the Hero deck once used
  (`sm:-rotate-2`, `sm:rotate-1`, `sm:-rotate-1`, `sm:rotate-2`), by index. **Never
  below `sm`** — a rotated card overflows the gutter at 390px.
- **Hover** — `hover:-translate-y-2 sm:hover:rotate-0`, `duration-300`,
  `motion-reduce:transition-none`.
- **Entrance** — the caller's: wrap it in `Reveal`, `delay={0.06 * i}` in a grid.

Two sizes:

- **`card`** (default), the `/saved-trips` tile. The whole card is a `<Link>` around an
  `<article>`, with an explicit `aria-label` (gotcha in Accessibility) and the
  focus-visible outline at `outline-offset-4`. Caption `text-2xl capitalize` as an h2:
  `{city}, {country}`. Under it the username in the meta-label idiom
  (`text-xs font-medium uppercase tracking-[0.12em] text-sorbet-ink/45`), and a `size-8`
  ink arrow disc, `aria-hidden`, bottom-right of the lip. Tilt by `index`.
- **`lg`**, the trip title on both trip routes. Same frame at `max-w-md`; the caption is
  the trip title, the page's h1, at `text-[clamp(1.75rem,4vw,2.75rem)] text-balance`.
  No link, no username, no arrow; rests on the first tilt and straightens on hover.
  `TitleSection` renders it unconditionally — no variant prop, no fork.

### The shared shell

`SiteNav` is rendered once by `src/app/layout.tsx`, so it is on every route and there is
no per-page nav any more. Three things follow from that:

- **It is above the page wrapper**, so it carries its own `font-sorbet` and the canvas
  ground lives on `<body>` — the bar is `bg-sorbet-canvas/90`, and over a white body
  those 10% read as a pale band.
- **The bar is `h-16` (4rem).** Anything that sizes itself against the viewport minus the
  nav uses `calc(100dvh-4rem)`.
- **`[data-wordmark]` still lives on it.** `Intro` measures that element to fly the
  wordmark into place; it is load-bearing, not decoration.

Active route: `aria-current="page"` plus a `bg-sorbet-ink/5` fill, matched on the exact
path or a child of it (`/saved-trips/42` lights `Saved trips`).

Below `md` the links collapse into a disclosure panel — ink-outline `Menu` pill,
`aria-expanded` / `aria-controls="site-menu"`, a canvas sheet under the sticky bar with
the links as `text-lg` pills and the "Plan a trip" ink pill last. Escape closes it and
returns focus to the trigger; a link click or a pathname change closes it. **The hiding
is CSS (`md:hidden`), never a `matchMedia` branch** — see the motion rule below; a
client-only value deciding what gets rendered is the same hydration trap in a different
coat.

`SiteFooter` is rendered by each page rather than by the layout, so a page can choose not
to have one (the form does not).

### The weather card breakout

`WeatherPacking` follows `src/components/trips/WeatherSection.tsx`: the weather icon
**overflows the card** via negative margins — top edge on mobile, left edge from `sm`
up. The card therefore carries asymmetric padding to make room (`pt-0 sm:pl-0 sm:pt-8`).
Reuse this when a section needs an image to break its container.

## Accessibility

- **Focus** — every interactive element gets
  `focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sorbet-ink`.
  `outline-offset-4` where the target is tight; `outline-sorbet-lime` on ink grounds.
- **Decoration is hidden** — `StickerBadge` and `Squiggle` are `aria-hidden`; so are the
  circular arrows and the eyebrow dot. They carry no information.
- **Weather icons** get `alt=""` and `aria-hidden`; the condition is in adjacent text.
- **Contrast** — ink on canvas, ink on lime, and offwhite on ink all clear AA. Any new
  pairing needs checking; the pastels are light, so ink is the only safe text colour on
  them.
- **Semantics** — numbered steps are an `<ol>`, metadata is a `<dl>`, cards are
  `<article>`. Don't flatten these to divs.
- **A link around an `<article>` needs an explicit name.** Chromium does not compute a
  link's name from content inside an `<article>`, so `Polaroid` sets
  `aria-label={caption, username}` on its `<Link>`. jsdom *does* compute it, so unit
  tests pass either way — check the Playwright snapshot, where an unnamed card shows
  as a bare `link`. This one reached CI.

## Gotchas that cost real time

Each of these was a bug, not a theory.

1. **The font variable must be on `<html>`, not `<body>`.** `--font-sorbet` is defined
   on `:root` inside `@theme`. CSS variable substitution happens where the variable is
   *defined*, not where it is used, so if `--font-rubik` is declared one level lower the
   `var()` is unresolvable and the whole declaration is invalid — silently falling back
   to the browser's default face (it fell back to Red Hat Display, back when `<body>`
   still loaded it).

2. **Turbopack caches stale CSS.** New tokens appearing to have no effect, while the
   Tailwind CLI generates them correctly, means the dev server is serving an old chunk.
   Kill it, `rm -rf .next`, restart. Triggered reliably by `git stash` under a running
   dev server. (Note `build` runs `next build --webpack`, so this is a dev-only trap.)

3. **Server components cannot pass function references to client components.**
   `Icon={FaPlaneUp}` across that boundary is a runtime 500 — and `tsc` does not catch
   it. `StickerBadge` takes `icon: ReactNode`; call sites pass `icon={<FaPlaneUp />}`.

4. **`react-icons` glyphs default to `1em`**, so size them with `fontSize` on a wrapper
   (see `StickerBadge`) or pass `size={n}`.

5. **Verify icon names exist before using them.** They are not guessable — it is
   `LuTreePalm`, not `LuPalmtree`. Check `node_modules/react-icons/<set>/index.d.ts`.

6. **Don't use `Container` / `GridContainer` / `GradientBg`** on a migrated page. They
   lock the page to `h-[calc(100dvh-3.5rem)] overflow-hidden`, which cannot scroll.

7. **The nav is global and 4rem tall.** `SiteNav` comes from the root layout on every
   route, so a page that also wants to fill the screen measures `calc(100dvh-4rem)`, not
   `100dvh` — otherwise it buys a scrollbar it does not use. (This replaces the old
   `NavbarComponent` and its `pathname === "/"` guard, both deleted: a nav that hides
   itself on one route was a guard waiting to be extended once per migration.)

8. **Photo text describes what is in frame, never a place.** `travelPhotos` in
   `src/data/index.ts` once carried `city` labels that did not match the photographs
   (Cappadocia's balloons as "Berlin", seven different photos as "Sydney") and a
   copy-pasted alt and blur on half the entries. It now has a real `alt`, a `tripType`
   and its own blur per photo, with a test pinning alt and blur uniqueness. None of the
   photos is identifiable as a particular city, so none claims one — keep it that way
   when adding photos, and regenerate the blur with `node generatePlaceholder.mjs`.

9. **HeroUI's input needs its focus put back.** It bit the `/saved-trips` search.
   (That search also once needed `!` on its `Label` colour, against an *unlayered*
   `.label` rule for the old form — unlayered CSS beats every layered utility. The rule
   is gone; keep any new global rule inside a layer for the same reason.)
   - HeroUI's `.input` applies `outline-none`, which in Tailwind v4 sets
     `--tw-outline-style: none`. `focus-visible:outline-2` reads that variable, so the
     focus triad silently draws nothing. Add `focus-visible:outline-solid`. Its focus ring
     is a Tailwind ring in the `--focus` colour: clear it with `focus:ring-0`, not
     `shadow-none`.

10. **Caveat cannot come from `next/font/google` under Turbopack.** Google sometimes
    serves it from `fonts.gstatic.com/l/font?kit=…&skey=…`, and Turbopack's font loader
    rejects a URL with two query parameters ("next/font/google queries have exactly one
    entry"). `next dev` then drops the font while the webpack build is fine, so the bug
    only shows locally. It is self-hosted with `next/font/local`; keep it that way.

11. **HeroUI's colours live on `:root`, and must stay there.** `globals.css` maps its
    semantic variables (`--accent`, `--focus`, `--field-*`) to ink. During the migration
    they sat on a `[data-sorbet]` wrapper instead, and two things went wrong with a
    scope: **popovers portal out of the page**, so each one had to carry the attribute
    itself; and HeroUI computes its derived colours (`--accent-soft`, `--danger-soft`)
    once, at `:root`, so inside the scope they still mixed from teal. Override the
    variables on `:root` and both come out right.

12. **Three HeroUI traps the form hit.**
    - `Popover.Trigger` renders its own `role="button"` element. Put the field's look on
      the trigger itself; a `<button>` inside it is a button in a button with two tab
      stops.
    - `ComboBox` filters `defaultItems` but treats `items` as already filtered, and
      HeroUI's `ListBoxItem` wraps its label with an indicator, so react-aria cannot
      read the text. A searchable list needs `defaultItems` **and** `textValue` on each
      item — with either missing, typing filters nothing.
    - `AlertDialog.Trigger` is the same: a `role="button"` div around what it holds. Open
      the dialog from a plain pill with `isOpen`/`onOpenChange` on `AlertDialog.Backdrop`
      (`form/StartOver.tsx`).
    - Radios and checkboxes are a `<label>` around a visually hidden `<input>`. In
      Playwright, click the label; a forced click on the input does not toggle it.
      Style the selected state with `data-selected:` on the label.

13. **A sticker in the gutter is placed from the content column, not the viewport.**
    The hero's cyan sticker sat at `left-[4%]`, on "Plan the trip." at every width
    below ~1440px, and the orchid one at `top-[38%]` of the hero, under the buttons.
    Measure from the column (`left-[calc(50%-41.5rem)]` is 1rem outside a
    `max-w-6xl` with `sm:px-8`), show it only from the width where the gutter fits
    it, and give a vertical position in rem rather than a percentage of a section
    whose height the deck changes. Keep one sticker on a phone, in the flow rather
    than absolute, so a wrapping heading cannot reach it. `landing.spec` measures
    all three.

14. **A drawn-on path can be stuck as dots — don't trust `whileInView` on a `<path>`.**
    `SquiggleArrow` on `/saved-trips` showed as three dots on a real phone (Chrome),
    while every emulation drew it. An undrawn path is a zero-length dash, and round
    caps still paint it as a dot at each end; the in-view trigger on its paths never
    fired there. It now draws on mount (it is on screen at load) and starts at
    `opacity: 0` with `pathLength: 0`, so a draw that never starts shows nothing
    rather than dots; `Squiggle` got the same opacity. For anything drawn on scroll,
    observe a box (`motion.svg`, or `Reveal`'s `div`) and drive the paths by variants.

## Building a page

1. Put `text-sorbet-ink` on the page's outermost element and a `sorbet` ground on each
   section. The face is already set on `<body>`.
2. Nothing to do for motion — `MotionProvider` is already above you, from `providers.tsx`.
3. Use the section/measure/gutter pattern (see Layout). Secondary text is
   `text-sorbet-ink/70`, never a grey.
4. Buttons are plain pill elements, not HeroUI `Button`.
5. Alternate the ground against the section above it.
6. Wrap entrances in `Reveal`; stagger with `delay={0.06 * i}`.
7. Add the focus-visible triad to everything interactive.
8. Move every word on the page into the page's `content.ts` (see "Copy lives in
   `content.ts`" above).
9. `priority` on a `next/image` only when it is above the fold on first paint — never
   inside a `Reveal`, which starts it at opacity 0, so the preload buys nothing.
10. Check it at 390px — the custom `xs` breakpoint is there for a reason.
11. Verify and test as CLAUDE.md's per-branch checklist says.

## Known debt

- `tailwind.config.ts` is an empty stub. Tailwind v4 reads the `@theme` block in
  `globals.css`; the file is vestigial and adding config to it would do nothing.
