import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import userEvent from "@testing-library/user-event";
import toast, { Toaster } from "react-hot-toast";
import { act, renderWithProviders, screen, waitFor } from "@/test/render";
import { GenerationProvider, type GenerationContextValue } from "@/context/GenerationContext";
import { useTripGeneration } from "@/hooks/useTripGeneration";
import { PLANNING_TOAST } from "@/components/ui/GenerationToasts";
import { generateTrip } from "@/app/api/anthropicApi";
import { generatedTripFixture, validInputs, validTripRequest } from "@/test/fixtures";
import { replace, resetNextStubs, routerState } from "@/test/stubs/next";
import { readFormDraft, writeFormDraft } from "@/lib/formDraft";
import { failure } from "@/components/form/content";

vi.mock("next/navigation", () => import("@/test/stubs/next"));
vi.mock("@/app/api/anthropicApi", () => ({ generateTrip: vi.fn() }));

const mockGenerate = vi.mocked(generateTrip);
const trip = generatedTripFixture;
const draft = { values: validInputs, step: 6, isWeatherSelected: false };

let ctx: GenerationContextValue;

function Probe() {
  ctx = useTripGeneration();
  return <span data-testid="pending">{String(ctx.state.pending !== null)}</span>;
}

// A fresh element per render: React skips re-rendering an identical one, and a navigation re-renders.
const tree = () => (
  <GenerationProvider>
    <Toaster />
    <Probe />
  </GenerationProvider>
);

/** A call that settles when the test says so. */
function heldCall() {
  let resolve: (value: typeof trip) => void = () => {};
  let reject: (error: Error) => void = () => {};
  mockGenerate.mockReturnValueOnce(
    new Promise((res, rej) => {
      resolve = res;
      reject = rej;
    }),
  );
  return {
    land: (value = trip) => act(async () => resolve(value)),
    fail: () => act(async () => reject(new Error("The model did not return a trip"))),
  };
}

function renderAt(path: string) {
  routerState.pathname = path;
  const view = renderWithProviders(tree());
  /** Moves the traveller: the router's path, then a render, as a navigation does. */
  const visit = (next: string) => {
    routerState.pathname = next;
    view.rerender(tree());
  };
  return { ...view, visit };
}

const start = () => act(async () => ctx.generateTrip(validTripRequest));

/** The View links still showing: a dismissed toast stays in the page 1s, `invisible` and inert. */
const shownViews = () =>
  screen.queryAllByRole("link", { name: "View" }).filter((link) => !link.closest(".invisible"));

beforeEach(() => {
  resetNextStubs("/form");
  mockGenerate.mockReset();
  sessionStorage.clear();
  vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  toast.remove();
});

describe("GenerationProvider", () => {
  it("starts with nothing pending", () => {
    renderAt("/form");
    expect(ctx.state).toEqual({ pending: null, result: null });
  });

  it("passes the request straight through to the API module", async () => {
    heldCall();
    renderAt("/form");
    await start();
    expect(mockGenerate).toHaveBeenCalledWith(validTripRequest);
    expect(screen.getByTestId("pending")).toHaveTextContent("true");
  });

  describe("landing on /form", () => {
    it("opens the trip, says so without a View, and clears the draft", async () => {
      writeFormDraft(draft);
      const call = heldCall();
      renderAt("/form");
      await start();

      await call.land();

      expect(replace).toHaveBeenCalledWith(`/trips/${trip.tripUrl}`);
      expect(await screen.findByRole("status")).toHaveTextContent("Your trip has been generated!");
      expect(screen.queryByRole("link", { name: "View" })).toBeNull();
      expect(readFormDraft()).toBeNull();
      expect(ctx.state).toEqual({ pending: null, result: null });
    });

    it("fails into the failure panel's state, with an alert, keeping the draft", async () => {
      writeFormDraft(draft);
      const call = heldCall();
      renderAt("/form");
      await start();

      await call.fail();

      expect(ctx.state.result).toEqual({ kind: "failed", fresh: false });
      expect(await screen.findByRole("alert")).toHaveTextContent(failure.message);
      expect(readFormDraft()).toEqual(draft);
      expect(replace).not.toHaveBeenCalled();
      expect(console.error).toHaveBeenCalledTimes(1);
    });

    it("clears the failure on clearResult, so the form shows again", async () => {
      const call = heldCall();
      renderAt("/form");
      await start();
      await call.fail();

      act(() => ctx.clearResult());

      expect(ctx.state).toEqual({ pending: null, result: null });
    });
  });

  describe("off /form", () => {
    it("shows the planning toast, with Cancel and a View back to the loader", async () => {
      heldCall();
      renderAt("/about");
      await start();

      const planning = await screen.findByRole("status");
      expect(planning).toHaveTextContent("Your trip is being planned");
      expect(screen.getByRole("button", { name: "Cancel" })).toBeInTheDocument();
      expect(screen.getByRole("link", { name: "View" })).toHaveAttribute("href", "/form");
    });

    it("shows no planning toast on /form, where the loader says it", async () => {
      heldCall();
      renderAt("/form");
      await start();
      expect(screen.queryByText("Your trip is being planned")).toBeNull();
    });

    it("offers the landed trip with View, without moving the traveller, and clears the draft", async () => {
      writeFormDraft(draft);
      const call = heldCall();
      const { visit } = renderAt("/form");
      await start();
      visit("/saved-trips");

      await call.land();

      await waitFor(() => expect(shownViews()).toHaveLength(1));
      expect(shownViews()[0]).toHaveAttribute("href", `/trips/${trip.tripUrl}`);
      expect(shownViews()[0].closest("[role=status]")).toHaveTextContent("Your trip has been generated!");
      expect(screen.queryByRole("button", { name: "Dismiss" })).toBeNull();
      expect(replace).not.toHaveBeenCalled();
      expect(readFormDraft()).toBeNull();
    });

    it("drops the trip's toast once the traveller is on the trip's page", async () => {
      const call = heldCall();
      const { visit } = renderAt("/about");
      await start();
      await call.land();
      await waitFor(() => expect(shownViews()).toHaveLength(1));

      visit(`/trips/${trip.tripUrl}`);

      await waitFor(() => expect(ctx.state.result).toBeNull());
      expect(screen.getByText("Your trip has been generated!").closest(".invisible")).not.toBeNull();
    });

    it("turns a failure into a way back to the form, where the draft waits", async () => {
      writeFormDraft(draft);
      const call = heldCall();
      renderAt("/about");
      await start();

      await call.fail();

      const back = await screen.findByRole("link", { name: "Back to the form" });
      expect(screen.getByRole("alert")).toHaveTextContent("There was an error generating your trip.");
      expect(back).toHaveAttribute("href", "/form");
      expect(readFormDraft()).toEqual(draft);
    });

    it("hands the failure to the form's panel on /form, and its Dismiss drops it", async () => {
      const call = heldCall();
      const { visit } = renderAt("/about");
      await start();
      await call.fail();
      await screen.findByRole("link", { name: "Back to the form" });

      visit("/form");
      // The failure panel shows it there; the toast steps aside.
      expect(ctx.state.result).toEqual({ kind: "failed", fresh: false });
      expect(screen.getByRole("link", { name: "Back to the form" }).closest(".invisible")).not.toBeNull();

      visit("/about");
      await userEvent.click(await screen.findByRole("button", { name: "Dismiss" }));
      expect(ctx.state.result).toBeNull();
    });
  });

  describe("cancelled", () => {
    it("by keyboard from the planning toast: says so, and its trip lands to nothing", async () => {
      writeFormDraft(draft);
      const user = userEvent.setup();
      const call = heldCall();
      renderAt("/about");
      await start();
      await screen.findByText("Your trip is being planned");

      await user.tab();
      expect(screen.getByRole("button", { name: "Cancel" })).toHaveFocus();
      await user.keyboard("{Enter}");

      expect(screen.getByTestId("pending")).toHaveTextContent("false");
      expect(await screen.findByRole("alert")).toHaveTextContent("Your trip was cancelled");

      await call.land();
      expect(ctx.state).toEqual({ pending: null, result: null });
      expect(screen.queryByText("Your trip has been generated!")).toBeNull();
      expect(replace).not.toHaveBeenCalled();
      expect(readFormDraft()).toEqual(draft);
    });

    it("from the loader, then a failure: the cancellation, no failure, nothing logged", async () => {
      const call = heldCall();
      renderAt("/form");
      await start();

      act(() => ctx.cancel());
      await call.fail();

      expect(screen.getByRole("alert")).toHaveTextContent("Your trip was cancelled");
      expect(ctx.state.result).toBeNull();
      expect(console.error).not.toHaveBeenCalled();
    });

    it("in the same instant it started: its trip still lands to nothing", async () => {
      const call = heldCall();
      renderAt("/form");

      act(() => {
        ctx.generateTrip(validTripRequest);
        ctx.cancel();
      });
      await call.land();

      expect(replace).not.toHaveBeenCalled();
      expect(ctx.state).toEqual({ pending: null, result: null });
    });

    it("with nothing pending, says nothing", async () => {
      renderAt("/form");
      const custom = vi.spyOn(toast, "custom");

      act(() => ctx.cancel());

      expect(custom).not.toHaveBeenCalled();
    });

    it("leaves the same request, sent again, to land normally", async () => {
      const first = heldCall();
      const second = heldCall();
      renderAt("/form");
      await start();
      act(() => ctx.cancel());
      await first.land();

      await start();
      await second.land();

      expect(replace).toHaveBeenCalledTimes(1);
      expect(replace).toHaveBeenCalledWith(`/trips/${trip.tripUrl}`);
    });
  });

  it("lets only the latest generation land when one supersedes another", async () => {
    const first = heldCall();
    const second = heldCall();
    renderAt("/form");
    await start();
    await start();

    await first.land({ ...trip, tripUrl: "0123456789ab" });
    expect(replace).not.toHaveBeenCalled();

    await second.land();
    expect(replace).toHaveBeenCalledWith(`/trips/${trip.tripUrl}`);
  });

  describe("the planning toast", () => {
    it("is shown once, however often the traveller changes route", async () => {
      const custom = vi.spyOn(toast, "custom");
      heldCall();
      const { visit } = renderAt("/about");
      await start();
      await screen.findByText("Your trip is being planned");

      for (const path of ["/saved-trips", "/saved-trips/1", "/about"]) visit(path);

      const planning = custom.mock.calls.filter(([, options]) => options?.id === PLANNING_TOAST);
      expect(planning).toHaveLength(1);
    });

    // react-hot-toast keeps a dismissed toast in the page 1s, unanimated; over the loader it must
    // be neither seen nor reached. And never removed: a toast removed under the cursor leaves the
    // Toaster's hover pause on, holding every later toast.
    it("is hidden and inert at once, and dismissed rather than removed, back on /form", async () => {
      const remove = vi.spyOn(toast, "remove");
      heldCall();
      const { visit } = renderAt("/about");
      await start();
      await screen.findByText("Your trip is being planned");

      visit("/form");

      const frame = screen.getByText("Your trip is being planned").closest("[inert]");
      expect(frame).toHaveClass("invisible");
      expect(remove).not.toHaveBeenCalled();
    });
  });

  it("asks before a reload while a generation is pending, and not after", async () => {
    const add = vi.spyOn(window, "addEventListener");
    const removeListener = vi.spyOn(window, "removeEventListener");
    const call = heldCall();
    renderAt("/about");
    expect(add).not.toHaveBeenCalledWith("beforeunload", expect.any(Function));

    await start();
    expect(add).toHaveBeenCalledWith("beforeunload", expect.any(Function));

    await call.land();
    expect(removeListener).toHaveBeenCalledWith("beforeunload", expect.any(Function));
  });

  // Only the latest finished trip keeps a toast; starting a new one on /form removes nothing.
  it("keeps the last trip's toast through the next generation, then replaces it", async () => {
    const second = { ...trip, tripUrl: "f0e1d2c3b4a5" };
    const firstCall = heldCall();
    const secondCall = heldCall();
    const { visit } = renderAt("/about");

    await start();
    await firstCall.land();
    await waitFor(() => expect(shownViews()).toHaveLength(1));

    visit("/form");
    await start();
    expect(shownViews().map((link) => link.getAttribute("href"))).toEqual([`/trips/${trip.tripUrl}`]);

    visit("/about");
    await secondCall.land({ ...second });
    await waitFor(() =>
      expect(shownViews().map((link) => link.getAttribute("href"))).toEqual([
        `/trips/${second.tripUrl}`,
      ]),
    );
  });
});
