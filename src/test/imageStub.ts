/**
 * Stands in for every static image import under Vitest.
 *
 * Next's image loader returns an object; Vite returns a bare URL string. Helpers
 * and components read `.src` (`src/lib/utils.ts` does it on ten weather PNGs), so
 * the object shape is the one that has to survive into tests.
 *
 * The stub is keyed by filename rather than shared, so a test can tell `sun.png`
 * from `moon.png` — otherwise every branch of `placeWeatherIcons` looks alike.
 */
export function makeImageStub(name: string) {
  return {
    src: `/test-assets/${name}`,
    width: 100,
    height: 100,
    blurDataURL: `data:image/png;base64,${name}`,
    blurWidth: 8,
    blurHeight: 8,
  };
}

/** The `src` a given asset resolves to in tests, for assertions. */
export function stubSrc(name: string) {
  return makeImageStub(name).src;
}

export default makeImageStub("stub.png");
