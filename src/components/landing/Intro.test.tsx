import { afterEach, describe, expect, it, vi } from "vitest";
import { render, renderHook } from "@testing-library/react";
import Intro from "./Intro";
import { BEATS } from "./introBeats";
import { IntroProvider, useIntro } from "./IntroContext";
import { INTRO_COOKIE } from "./introCookie";

// One more word than `BEAT_HOLDS` has timings for.
vi.mock("./content", async (importOriginal) => {
  const content = await importOriginal<typeof import("./content")>();
  return { ...content, intro: { ...content.intro, beats: ["Plan.", "Pack.", "Go.", "Again."] } };
});

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

describe("Intro beats", () => {
  it("holds a word with no timing of its own for the default, not zero", () => {
    expect(BEATS).toHaveLength(4);
    expect(BEATS[3].hold).toBeGreaterThan(0);
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
