import { afterEach, describe, expect, it } from "vitest";
import { render, renderHook } from "@testing-library/react";
import Intro from "./Intro";
import { IntroProvider, useIntro } from "./IntroContext";
import { INTRO_COOKIE } from "./introCookie";

function clearIntroCookie() {
  document.cookie = `${INTRO_COOKIE}=; Path=/; Max-Age=0`;
}

afterEach(clearIntroCookie);

describe("Intro", () => {
  it("marks the intro as seen once it starts, so the next visit skips it", () => {
    expect(document.cookie).not.toContain(`${INTRO_COOKIE}=1`);

    render(
      <IntroProvider>
        <Intro />
      </IntroProvider>,
    );

    expect(document.cookie).toContain(`${INTRO_COOKIE}=1`);
  });
});

describe("IntroProvider", () => {
  it("starts not done, so the hero waits for the curtain", () => {
    const { result } = renderHook(() => useIntro(), {
      wrapper: ({ children }) => <IntroProvider>{children}</IntroProvider>,
    });

    expect(result.current.done).toBe(false);
  });

  it("starts done when the intro was already seen, so the hero plays at once", () => {
    const { result } = renderHook(() => useIntro(), {
      wrapper: ({ children }) => <IntroProvider skip>{children}</IntroProvider>,
    });

    expect(result.current.done).toBe(true);
  });
});
