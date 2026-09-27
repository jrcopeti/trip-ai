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
