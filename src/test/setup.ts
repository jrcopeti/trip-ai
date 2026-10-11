import "@testing-library/jest-dom/vitest";
import { afterEach, vi } from "vitest";
import { cleanup } from "@testing-library/react";

// RTL installs its own auto-cleanup only when `globals: true`. This project
// imports `describe`/`it`/`expect` explicitly (so tsconfig needs no `types`
// entry), so the unmount has to be registered here — otherwise every render
// piles up in the same document and `getBy*` starts finding duplicates.
afterEach(() => {
  cleanup();
});

// react-aria (under HeroUI) reads both of these on mount; jsdom ships neither.
if (!window.matchMedia) {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }),
  });
}

if (!globalThis.ResizeObserver) {
  globalThis.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as unknown as typeof ResizeObserver;
}

// Framer's `whileInView` (so every `Reveal`) constructs one on mount. Inert on
// purpose: it never reports an intersection, which is jsdom's reality anyway —
// assert that a `Reveal`'s children render, never that the animation ran.
if (!globalThis.IntersectionObserver) {
  globalThis.IntersectionObserver = class {
    root = null;
    rootMargin = "";
    thresholds = [];
    observe() {}
    unobserve() {}
    disconnect() {}
    takeRecords() {
      return [];
    }
  } as unknown as typeof IntersectionObserver;
}

// jsdom has no layout, so it has no `scrollIntoView` either. The saved-trips
// search calls it to bring results into view; a test that cares spies on it.
if (!Element.prototype.scrollIntoView) {
  Element.prototype.scrollIntoView = function scrollIntoView() {};
}
