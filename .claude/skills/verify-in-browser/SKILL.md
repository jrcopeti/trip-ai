---
name: verify-in-browser
description: "Verify a visible change in a real browser. Use when the user says verify it in the browser, check in the browser, check in playwright, check it at 390, does it look right on mobile, take a screenshot of the page or check for hydration errors, and after any change a traveller can see, before staging it. Serves a production build on the local e2e database with API fixtures, checks each page at 390, 768 and 1440 and under reduced motion, and reports what it saw. Never uses the production database, and never fixes what it finds."
---

# Verify in the browser

Check the pages a change touches, then report. The job ends with the report and the server stopped.

## Steps

1. **Start the server.** Run `.claude/skills/verify-in-browser/scripts/verify-in-browser.sh`. Add `--skip-build` only when no source file changed since the last build. Done when it prints `Ready: http://localhost:3100`.
2. **List the pages the change touches.** Reach each one from the table below. Done when every page has a route and a way to reach it.
3. **Check each page at each width,** in the order 390, 768, 1440, with `browser_resize` then `browser_navigate`:
   - `browser_evaluate` with `() => document.documentElement.scrollWidth > document.documentElement.clientWidth`. It must return `false`.
   - `browser_snapshot`. A bare `link` with no name is a real bug.
   - `browser_evaluate` to scroll through the page, so every `Reveal` fires: `async () => { const step = window.innerHeight / 2; for (let y = 0; y < document.documentElement.scrollHeight; y += step) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 250)); } await new Promise((r) => setTimeout(r, 800)); window.scrollTo(0, 0); }`
   - `browser_take_screenshot` with `scale: "css"`, `fullPage: true` and `filename: ".playwright-mcp/<page>-<width>.png"`. Read the file and look at it.

   Done when every page has a snapshot, an overflow result and a viewed screenshot at all three widths.
4. **Check reduced motion.** Run `browser_emulate_media` with `reducedMotion: "reduce"`, reload at 390, and compare the snapshot with step 3. The content must be the same; only the movement goes. Then run it with `reducedMotion: null`. Done when each page has been compared.
5. **Read the console.** Run `browser_console_messages` with `level: "warning"` and `all: true`. Done when you've listed every hydration error and any other error or warning.
6. **Stop the server.** Run `.claude/skills/verify-in-browser/scripts/verify-in-browser.sh --stop`. Done when it prints `Stopped`.
7. **Report what you saw,** one row per page and width, with the screenshot path and any problem. Fix nothing unless fixing it was already the task. Done when every claim has a snapshot or screenshot behind it.

| Page | How to reach it |
| --- | --- |
| `/`, `/about`, `/form` | Directly. |
| `/saved-trips` | Directly. Shows the seeded rows, Lisbon and Kyoto. |
| `/saved-trips/[id]` | Click a card on `/saved-trips`. |
| `/trips/[tripUrl]` | Walk `/form` with Portugal and Lisbon (steps in `e2e/formWalk.ts`) and submit. The fixture trip lands after about 2 seconds. |

## Gotchas

- `npm run dev` on port 3000 reads `.env`, which is production on the owner's machine. Use it only when the user asks, and never submit the form or save or discard a trip on it: that writes real rows and calls paid APIs.
- Run `npm run seed:e2e` only through the script. It deletes every trip, and the script refuses a remote database even with `ALLOW_REMOTE_E2E_SEED` set.
- If the `browser_*` tools are missing, say so and stop. The Playwright server comes from this repo's `.mcp.json`. Don't ask for a manual pass, and don't report a pass.
- Never delete screenshots or other files in `.playwright-mcp/` without asking. The user wants to see them.
- Under reduced motion, a moving squiggle isn't a bug. `SquiggleLoader` keeps running on purpose, as the only sign a wait isn't stuck.
- Under `npm run dev`, a new token with no effect is usually Turbopack's stale CSS, not a bug. Stop it, run `rm -rf .next` and restart.
- A blank gap in a full-page screenshot, where the snapshot lists the content, means the page wasn't scrolled first. `Reveal` keeps off-screen content at opacity 0 until it scrolls into view. It isn't a page bug.
- jsdom passes unnamed links, so unit tests don't catch what the snapshot in step 3 does. One reached CI this way.
- Screenshots for the README go in `public/screenshots/`, and only when the user asks. Everything else stays in `.playwright-mcp/`, which is gitignored.

Last verified: 2026-11-04 with Claude Code and Docker Desktop 4.97.0 (setup script run end to end; overflow, snapshot, screenshot and console run on `/saved-trips` at 390; other widths and the reduced-motion comparison not run)
