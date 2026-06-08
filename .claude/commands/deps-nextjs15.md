# Next.js 15 + React 19 Migration

Upgrade Next.js 14 → 15 and React 18 → 19. Run `/deps-safe` first if you haven't already.

## Install

```bash
npm install next@15 react@19 react-dom@19
npm install --save-dev @types/react@19 @types/react-dom@19 eslint-config-next@15
```

## Breaking changes to fix

### 1. Async params and searchParams (Next.js 15)

In every page and layout that receives `params` or `searchParams` as props, these are now Promises. Check these files:

- `src/app/trips/[tripUrl]/page.tsx`
- `src/app/saved-trips/[id]/page.tsx`
- `src/app/saved-trips/[id]/not-found.tsx`
- `src/app/trips/[tripUrl]/not-found.tsx`

Update the pattern from:
```tsx
// Before
export default function Page({ params }: { params: { id: string } }) {
  const { id } = params;
```
To:
```tsx
// After
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
```

### 2. React 19 — removed APIs

- `ReactDOM.render` is removed (not used in this project, but verify)
- `React.FC` implicit `children` prop is removed — check all components that use `React.FC` with children
- `useFormState` from `react-dom` is renamed to `useActionState` — search the codebase for `useFormState`

### 3. `next/font` — verify fonts still load

The font setup in `src/app/layout.tsx` uses `Inter`, `League_Spartan`, and `Red_Hat_Display`. Confirm they still render correctly after the upgrade.

## After installing

1. Run `npx @next/codemod@latest upgrade` to apply any automatic codemods Next.js provides.
2. Run `npm run build` and fix any TypeScript or runtime errors.
3. Start `npm run dev` and test the form flow end-to-end.
4. Report all files changed and any issues found.
