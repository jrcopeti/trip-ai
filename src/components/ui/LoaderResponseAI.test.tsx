import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, renderWithProviders, screen } from "@/test/render";
import LoaderResponseAI from "@/components/ui/LoaderResponseAI";

vi.mock("next/navigation", () => import("@/test/stubs/next"));
// `useConfirmOnPageExit` reaches TripContext, which constructs the Anthropic
// client at module scope — mocked at the boundary so nothing is constructed.
vi.mock("@/app/api/anthropicApi", () => ({ fetchResponseAI: vi.fn() }));

/** The rotation, in the component's order. */
const messages = [
  "Planning your trip",
  "Please Wait",
  "Analyzing your preferences",
  "Getting the best tours",
  "Checking the weather",
  "Packing your stuff",
  "We are almost there",
  "Thank you for using Trip AI",
];

const STEP = 100;
const GIVE_UP_AFTER = 20_000;

/**
 * Runs the clock forward until `text` is the message on screen.
 *
 * Deliberately not an assertion at a fixed timestamp. The 2.8s interval decides
 * when the *index* changes, but AnimatePresence `mode="wait"` holds the new
 * message behind the outgoing one's 1.3s exit, and under fake timers Framer's
 * frame loop does not track the clock closely enough for "the next message is
 * up at exactly t + 4.1s" to hold. Order is what matters, so each call scans
 * forward from wherever the last one stopped: a message that never arrives, or
 * arrives out of turn, runs this out of budget and fails.
 */
async function advanceUntil(text: string) {
  for (let elapsed = 0; elapsed <= GIVE_UP_AFTER; elapsed += STEP) {
    if (screen.getByRole("heading").textContent === text) return;
    await act(async () => {
      await vi.advanceTimersByTimeAsync(STEP);
    });
  }
  throw new Error(
    `"${text}" never came up; on screen: "${screen.getByRole("heading").textContent}"`,
  );
}

beforeEach(() => {
  // `requestAnimationFrame` is not in Vitest's default `toFake` list, and
  // without it Framer's frame loop never runs at all: the exit animation can
  // never complete, so the message stays on the first one however far the clock
  // is advanced.
  vi.useFakeTimers({
    toFake: [
      "setTimeout",
      "clearTimeout",
      "setInterval",
      "clearInterval",
      "Date",
      "performance",
      "requestAnimationFrame",
      "cancelAnimationFrame",
    ],
  });
});

afterEach(() => {
  // Framer's frame loop is a module-level singleton, and it will not restart
  // under a fresh fake clock while it still believes a frame is pending. Leave
  // one hanging and the *next* test in this file sits on the first message
  // forever, however far it advances the clock. So: unmount, let the last
  // scheduled frame resolve, and only then hand the timers back.
  cleanup();
  act(() => {
    vi.runOnlyPendingTimers();
  });
  vi.useRealTimers();
});

describe("LoaderResponseAI", () => {
  it("opens on the first message", () => {
    renderWithProviders(<LoaderResponseAI />);

    expect(screen.getByRole("heading")).toHaveTextContent(messages[0]);
  });

  it("rotates through the messages in order", async () => {
    renderWithProviders(<LoaderResponseAI />);

    for (const message of messages) {
      await advanceUntil(message);
    }
  });

  it("wraps back to the first message after the last", async () => {
    renderWithProviders(<LoaderResponseAI />);

    for (const message of messages.slice(1)) {
      await advanceUntil(message);
    }
    await advanceUntil(messages[0]);
  });

  it("warns before the page is abandoned mid-generation", () => {
    const addEventListener = vi.spyOn(window, "addEventListener");
    renderWithProviders(<LoaderResponseAI />);

    // useConfirmOnPageExit: the trip is still generating and unsaved.
    expect(addEventListener).toHaveBeenCalledWith(
      "beforeunload",
      expect.any(Function),
    );
  });
});
