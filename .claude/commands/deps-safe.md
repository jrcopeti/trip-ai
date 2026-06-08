# Safe Dependency Bump

Update all minor/patch packages that have no breaking changes.

## Packages to update

Run this install command:

```bash
npm install \
  @gsap/react@2.1.2 \
  @tanstack/react-query@5.100.11 \
  @tanstack/react-query-devtools@5.100.11 \
  @nextui-org/react@2.6.11 \
  @nextui-org/navbar@2.2.8 \
  axios@1.16.1 \
  dayjs@1.11.20 \
  gsap@3.15.0 \
  locomotive-scroll@5.0.1 \
  react-hook-form@7.76.0 \
  react-hot-toast@2.6.0 \
  react-icons@5.6.0 \
  react-spinners@0.17.0 \
  sharp@0.34.5 \
  autoprefixer@10.5.0 \
  postcss@8.5.15
```

Then update dev dependencies:

```bash
npm install --save-dev \
  @types/locomotive-scroll@4.1.4 \
  @types/node@20.19.41 \
  prettier@3.8.3
```

## After installing

1. Check `src/hooks/useLocomotiveScroll.ts` — locomotive-scroll moved from `5.0.0-beta.11` to `5.0.1` stable. Verify the import and any API calls still match the stable API.
2. Run `npm run build` and confirm it passes.
3. Start the dev server with `npm run dev` and visually check the homepage, form, and trip page.
4. Report a summary of what was updated and flag anything that needed a code fix.
