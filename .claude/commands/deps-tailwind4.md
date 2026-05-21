# Tailwind v4 + DaisyUI v5 Migration

Upgrade Tailwind CSS 3 → 4 and DaisyUI 4 → 5. Run `/deps-nextjs15` first.

Tailwind v4 is a full rewrite: `tailwind.config.ts` is gone — all config moves into `globals.css` using `@theme`. This is the highest-risk update in the chain.

## Install

```bash
npm install tailwindcss@4 daisyui@5
npm install --save-dev prettier-plugin-tailwindcss@0.8.0
```

## Migration steps

### 1. Run the official codemod first

```bash
npx @tailwindcss/upgrade@next
```

This handles most of the mechanical changes automatically. Review what it does before accepting.

### 2. Remove `tailwind.config.ts`

All configuration moves to `src/app/globals.css`. The codemod should handle this, but verify the output matches the original config in `tailwind.config.ts`:

- Custom colors, fonts, breakpoints → `@theme` block in CSS
- DaisyUI plugin → `@plugin "daisyui"` in CSS
- Content paths → no longer needed (v4 uses automatic content detection)

### 3. Update `postcss.config.js`

Tailwind v4 uses a new PostCSS plugin:
```js
// postcss.config.js
module.exports = {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};
```

### 4. Update globals.css

Replace the old Tailwind directives:
```css
/* Remove these */
@tailwind base;
@tailwind components;
@tailwind utilities;

/* Add this */
@import "tailwindcss";
@plugin "daisyui";
```

### 5. Check DaisyUI v5 component changes

DaisyUI v5 renamed and changed several component classes. Search the codebase for:
- `btn-*` classes — some variants renamed
- `card`, `modal`, `drawer` — structure changes
- Check the DaisyUI v5 migration guide for full list

### 6. Verify `cn()` utility still works

`src/lib/utils.ts` uses `clsx` + `tailwind-merge`. Check that `tailwind-merge` is compatible with Tailwind v4 class names (may need `tailwind-merge@3`).

## After installing

1. Run `npm run build`.
2. Run `npm run dev` and visually inspect every page — homepage, form (all 7 steps), trip result page, saved trips. Look for broken layouts or missing styles.
3. Report all files changed and any visual regressions found.
