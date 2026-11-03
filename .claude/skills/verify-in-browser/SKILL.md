---
name: verify-in-browser
description: Verifies a visible change in a real browser with the Playwright MCP tools, at phone, tablet and desktop widths and with reduced motion. Use after changing anything a traveller can see, before staging the work.
---

# Verify in the browser

The Playwright MCP server comes from your user config, not this repo's `.mcp.json`. If its tools are
missing, say so rather than asking for a manual pass.

1. `browser_navigate` to each page the change touches.
2. `browser_resize` at 1440, 768 and **390**.
3. `browser_emulate_media` with `prefers-reduced-motion: reduce`.
4. `browser_console_messages` for hydration errors.
5. `browser_snapshot` for the a11y tree.
6. `browser_take_screenshot` for the record.
