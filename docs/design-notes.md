# Design notes — the `sorbet` system

How the redesigned Trip AI looks and behaves, written down so the rest of the app can
be migrated without re-deriving it. Everything here is taken from the shipped landing
page, not from a mockup.

**Read this before styling any page.** If something here disagrees with the code, the
code is right and this file needs fixing.

- The reference: `src/app/page.tsx` and `src/components/landing/*`
- The tokens: the `sorbet` block at the end of `@theme` in `src/app/globals.css`
- Current plans: `docs/PLAN.md` (untracked, local)

## Status

| Area | State |
| --- | --- |
| `/` landing | Migrated. The reference implementation. |
| `/form` | Not migrated — previous look |
| `/trips/[tripUrl]` | Not migrated — previous look |
| `/saved-trips`, `/saved-trips/[id]` | Not migrated — previous look |
| `/about` | Not migrated — previous look |

Two visual systems coexist on purpose while the migration runs. The old palettes
(`neptune`, `tuna`, `shark`, `gallery`, `yellorange`, `deeporange`, `cabaret`, `violay`)
are still live on every unmigrated page.

**The `sorbet` tokens are additive. Never change a value in an older palette** — the
unmigrated pages depend on them being exactly what they are. Add, don't edit.

## Colour

Ten tokens. The name describes the colour, not the job, matching the existing
convention (`neptune`, `tuna`) so these survive past the landing page.

| Token | Hex | Where it actually goes |
| --- | --- | --- |
| `sorbet-ink` | `#302e2d` | All text. Dark buttons, circular arrows, focus rings, the footer ground. |
| `sorbet-canvas` | `#f7f0e7` | Warm page ground — hero, nav, "Three steps". The default backdrop. |
| `sorbet-offwhite` | `#f6f6f6` | Text on ink surfaces; also the trip-types ground and the weather card. |
| `sorbet-lime` | `#e2f3a7` | Primary accent — the closing CTA ground, secondary buttons, a sticker. |
| `sorbet-lime-punch` | `#e8ff98` | Higher-energy lime — one card tint, one sticker, one chip. |
| `sorbet-orchid` | `#eea1ff` | Secondary accent — the logo tiles, one card tint, stickers. |
| `sorbet-lavender` | `#e9daf1` | Tinted surface — packing list, one card tint, one chip. |
| `sorbet-blush` | `#f2d9d9` | Tinted surface — one card tint, one chip. |
| `sorbet-cyan` | `#a7fff7` | One sticker, one chip. |
| `sorbet-indigo` | `#5a4dff` | Used once, deliberately: the eyebrow dot in the hero. |

### Section grounds alternate

Reading top to bottom, the landing page runs
`canvas → white → offwhite → white → canvas → white → lime → ink`.

Adjacent sections never share a ground. That alternation is what gives the page
rhythm without any dividers.

**Note the gap:** `bg-white` is used directly as a section ground and for chip fills
(`bg-white/70`, `bg-white/90`) but is *not* a `sorbet` token. It reads as pure white
against the warm canvas, which is the intent. If you find yourself wanting a token for
it, add `--color-sorbet-white: #ffffff` rather than inventing a different white.

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

The old body face, Red Hat Display, is still on `<body>`; `font-sorbet` is opted into
on the migrated page's root wrapper. Migrating a page means adding `font-sorbet` to its
outermost element.

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

Only one shadow exists in the whole page, on the hero deck:
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

**Do not use HeroUI `Button` on migrated pages.** `--accent` is globally overridden to
neptune teal in `globals.css`, so a HeroUI button fights the system. Style plain
elements.

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
`MotionProvider` wraps the page with `<MotionConfig reducedMotion="user">`. Framer then
skips transform and layout animations and keeps opacity and colour.

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
| Sticker spin | `|spin|` seconds per turn, `linear`, `Infinity` |
| Parallax | `[0, 90]` slow / `[0, 170]` fast over the hero's scroll |
| Hover | `scale-[1.03]` buttons, `scale-105` pills, `-translate-y-2` deck cards |

Use Framer Motion on migrated pages. GSAP (`useScrollTrigger`) and Locomotive Scroll
are still wired into the trip pages — don't extend them, and don't mix them into a
migrated page.

### The intro

`Intro` plays once per visit: `Plan.` (450ms) → `Pack.` (350) → `Go.` (450) → wordmark
(850) → curtain exit (750), all constants at the top of the file.

It overlays the server-rendered page rather than gating it, so the hero is in the DOM
from the first byte. Two consequences:

- It measures `[data-wordmark]` in the nav to fly the wordmark into place. **Keep that
  attribute on the nav wordmark.**
- Anything in the hero that animates on mount would play behind the curtain and finish
  unseen. `IntroContext` exists for this: `useIntro().done` flips when the curtain
  lifts, and the hero gates the deck and the squiggle on it. `done` starts `false` on
  both server and client so hydration stays clean.

Reduced motion and JS failure are both handled in CSS on `.landing-intro`
(`display: none` under reduce; a failsafe keyframe hides it at 4.5s).

## Components

In `src/components/landing/`. The first three are general-purpose — use them when
migrating other pages.

| Component | Reusable? | Notes |
| --- | --- | --- |
| `Reveal` | **Yes** | Use for every scroll entrance. |
| `MotionProvider` | **Yes** | Wrap any page using the system. |
| `TripCard` | **Yes** | Pastel card: title, chip, arrow. Takes `{ card, className, interactive }`. |
| `StickerBadge` | Decorative | Circular text on `<textPath>`, slow spin. |
| `Squiggle` | Decorative | Ink loop, draws on. Optional `play` gate. |
| `LandingNav` / `LandingFooter` | Landing-only | Will generalise when more pages migrate. |
| `Intro`, `IntroContext` | Landing-only | |
| `Hero`, `WordmarkBlock`, `TripTypePills`, `PhotoBand`, `HowItWorks`, `WeatherPacking`, `ClosingCta` | Sections | |

Server components by default. Only these are `"use client"`: `Hero`, `Intro`,
`IntroContext`, `MotionProvider`, `Reveal`, `Squiggle`, `StickerBadge` — i.e. only what
needs hooks or motion.

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

## Gotchas that cost real time

Each of these was a bug, not a theory.

1. **The font variable must be on `<html>`, not `<body>`.** `--font-sorbet` is defined
   on `:root` inside `@theme`. CSS variable substitution happens where the variable is
   *defined*, not where it is used, so if `--font-rubik` is declared one level lower the
   `var()` is unresolvable and the whole declaration is invalid — silently falling back
   to Red Hat Display.

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

7. **`NavbarComponent` hides itself on `/`** via `if (pathname === "/") return null;`
   because the landing ships its own nav. Migrating another page to a bespoke nav means
   extending that guard.

8. **`homepageImages` in `src/data/index.ts` has fabricated city labels**, and entries
   11–16 share copy-pasted `alt` text and image 10's blur placeholder. The landing's
   `content.ts` describes what is in frame and claims no place. Do not caption a photo
   from that array's `city` field.

## Migrating a page

1. Wrap the outermost element: `font-sorbet text-sorbet-ink` plus a `sorbet` ground.
2. Wrap in `MotionProvider` if anything animates.
3. Replace old palette classes with `sorbet` equivalents. Secondary text becomes
   `text-sorbet-ink/70`, not a grey.
4. Drop `Container`/`GridContainer`/`GradientBg`; use the section/measure/gutter pattern.
5. Replace HeroUI `Button` with plain pill elements.
6. Alternate the ground against the section above it.
7. Wrap entrances in `Reveal`; stagger with `delay={0.06 * i}`.
8. Add the focus-visible triad to everything interactive.
9. Check it at 390px — the custom `xs` breakpoint is there for a reason.
10. Verify with `npx tsc --noEmit` (`npm run lint` is broken — see CLAUDE.md).

## Known debt

- `src/components/home/` (`HomepageComponent`, `Preloader`, `SwiperWithThumbs`,
  `HomepageTitle`) is **entirely unreferenced** since the landing took over `/`. Nothing
  imports it. It is a deletion candidate, deliberately left for a separate decision.
- `daisyui` is a dependency but is never loaded — no `@plugin "daisyui"`, no
  `data-theme` anywhere in `src/`.
- `tailwind.config.ts` is an empty stub. Tailwind v4 reads the `@theme` block in
  `globals.css`; the file is vestigial and adding config to it would do nothing.
- `next.config.mjs` still whitelists the DALL-E host
  (`oaidalleapiprodscus.blob.core.windows.net`) though image generation is gone.
- HeroUI's semantic overrides in `:root` (`--accent` → neptune) still apply globally.
  They will need revisiting when form and trip pages migrate.
