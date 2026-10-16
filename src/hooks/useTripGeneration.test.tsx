import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { renderWithProviders, screen, waitFor } from "@/test/render";
import { useIsMutating } from "@tanstack/react-query";
import toast, { Toaster } from "react-hot-toast";
import { generateTripKey, stopGeneration, useTripGeneration } from "@/hooks/useTripGeneration";
import { generateTrip } from "@/app/api/anthropicApi";
import { generatedTripFixture, validInputs, validTripRequest } from "@/test/fixtures";
import { replace, resetNextStubs, routerState } from "@/test/stubs/next";
import { readFormDraft, writeFormDraft } from "@/lib/formDraft";
import { failure } from "@/components/form/content";

vi.mock("next/navigation", () => import("@/test/stubs/next"));
vi.mock("@/app/api/anthropicApi", () => ({ generateTrip: vi.fn() }));

const mockFetch = vi.mocked(generateTrip);

let ctx: ReturnType<typeof useTripGeneration>;

// Pending as `Form` reads it: by the mutation's key, so one that outlived /form counts too.
function Probe() {
  ctx = useTripGeneration();
  const pending = useIsMutating({ mutationKey: generateTripKey }) > 0;
  return <span data-testid="pending">{String(pending)}</span>;
}

function renderTrip() {
  return renderWithProviders(
    <>
      <Toaster />
      <Probe />
    </>,
  );
}

/** Where the traveller is when the trip lands: the hook reads the live location, the toast the router's. */
function visit(path: string) {
  window.history.replaceState(null, "", path);
  routerState.pathname = path;
}

afterEach(() => {
  toast.remove();
  visit("/");
});

beforeEach(() => {
  resetNextStubs("/form");
  visit("/form");
  mockFetch.mockReset();
  vi.spyOn(console, "error").mockImplementation(() => {});
});

describe("useTripGeneration", () => {
  it("starts with nothing pending", () => {
    renderTrip();
    expect(screen.getByTestId("pending")).toHaveTextContent("false");
  });

  it("passes the request straight through to the API module", async () => {
    mockFetch.mockResolvedValue(generatedTripFixture);
    renderTrip();

    ctx.generateTrip(validTripRequest);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(validTripRequest);
    });
  });

  it("redirects to the url the server gave the trip", async () => {
    mockFetch.mockResolvedValue(generatedTripFixture);
    renderTrip();

    ctx.generateTrip(validTripRequest);

    await waitFor(() => {
      expect(replace).toHaveBeenCalledWith(`/trips/${generatedTripFixture.tripUrl}`);
    });
  });

  // The traveller is on the way to the trip, so the toast offers no View.
  it("says the trip was generated, without a View, as it opens it", async () => {
    mockFetch.mockResolvedValue(generatedTripFixture);
    renderTrip();

    ctx.generateTrip(validTripRequest);

    expect(await screen.findByRole("status")).toHaveTextContent("Your trip has been generated!");
    expect(replace).toHaveBeenCalledWith(`/trips/${generatedTripFixture.tripUrl}`);
    expect(screen.queryByRole("link", { name: "View" })).toBeNull();
  });

  // The answers are spent; coming back to /form starts a new trip.
  it("clears the form's draft when the trip comes back", async () => {
    writeFormDraft({ values: validInputs, step: 6, isWeatherSelected: false });
    mockFetch.mockResolvedValue(generatedTripFixture);
    renderTrip();

    ctx.generateTrip(validTripRequest);

    await waitFor(() => expect(replace).toHaveBeenCalled());
    expect(readFormDraft()).toBeNull();
  });

  it("keeps the draft when the call fails, for another try", async () => {
    const draft = { values: validInputs, step: 6, isWeatherSelected: false };
    writeFormDraft(draft);
    mockFetch.mockRejectedValue(new Error("The model did not return a trip"));
    renderTrip();

    ctx.generateTrip(validTripRequest);

    await waitFor(() => expect(ctx.error).toBeInstanceOf(Error));
    expect(readFormDraft()).toEqual(draft);
  });

  it("reports pending while the request is in flight", async () => {
    let resolve: (value: typeof generatedTripFixture) => void = () => {};
    mockFetch.mockReturnValue(
      new Promise((r) => {
        resolve = r;
      }),
    );
    renderTrip();

    ctx.generateTrip(validTripRequest);

    await waitFor(() => {
      expect(screen.getByTestId("pending")).toHaveTextContent("true");
    });

    resolve(generatedTripFixture);

    await waitFor(() => {
      expect(screen.getByTestId("pending")).toHaveTextContent("false");
    });
  });

  it("surfaces the error and does not redirect when the call fails", async () => {
    mockFetch.mockRejectedValue(new Error("Error in generating response from AI"));
    renderTrip();

    ctx.generateTrip(validTripRequest);

    // The form's own failure copy, from content.ts.
    expect(await screen.findByRole("alert")).toHaveTextContent(failure.message);

    await waitFor(() => {
      expect(ctx.error).toBeInstanceOf(Error);
    });
    expect(replace).not.toHaveBeenCalled();
  });

  it("clears the error on reset, so the form can show again", async () => {
    mockFetch.mockRejectedValue(new Error("The model did not return a trip"));
    renderTrip();

    ctx.generateTrip(validTripRequest);
    await waitFor(() => expect(ctx.error).toBeInstanceOf(Error));

    ctx.reset();
    await waitFor(() => expect(ctx.error).toBeNull());
  });

  describe("once the traveller has left /form", () => {
    it("offers the trip instead of moving them to it", async () => {
      mockFetch.mockResolvedValue(generatedTripFixture);
      renderTrip();

      ctx.generateTrip(validTripRequest);
      visit("/saved-trips");

      const view = await screen.findByRole("link", { name: "View" });
      expect(screen.getByRole("status")).toHaveTextContent("Your trip has been generated!");
      expect(view).toHaveAttribute("href", `/trips/${generatedTripFixture.tripUrl}`);
      expect(replace).not.toHaveBeenCalled();
    });

    it("clears the draft when the trip lands there too", async () => {
      writeFormDraft({ values: validInputs, step: 6, isWeatherSelected: false });
      mockFetch.mockResolvedValue(generatedTripFixture);
      renderTrip();

      ctx.generateTrip(validTripRequest);
      visit("/about");

      await screen.findByRole("link", { name: "View" });
      expect(readFormDraft()).toBeNull();
    });

    it("turns a failure into a way back to the form, where the draft waits", async () => {
      const draft = { values: validInputs, step: 6, isWeatherSelected: false };
      writeFormDraft(draft);
      mockFetch.mockRejectedValue(new Error("The model did not return a trip"));
      renderTrip();

      ctx.generateTrip(validTripRequest);
      visit("/about");

      const back = await screen.findByRole("link", { name: "Back to the form" });
      expect(screen.getByRole("alert")).toHaveTextContent("There was an error generating your trip.");
      expect(back).toHaveAttribute("href", "/form");
      expect(readFormDraft()).toEqual(draft);
    });
  });

  describe("stopped", () => {
    function pendingCall() {
      let settle = { resolve: (_: typeof generatedTripFixture) => {}, reject: (_: Error) => {} };
      mockFetch.mockReturnValue(
        new Promise((resolve, reject) => {
          settle = { resolve, reject };
        }),
      );
      return () => settle;
    }

    it("is no longer pending, and its trip shows nothing when it lands", async () => {
      const settle = pendingCall();
      const draft = { values: validInputs, step: 6, isWeatherSelected: false };
      writeFormDraft(draft);
      const { queryClient } = renderTrip();

      ctx.generateTrip(validTripRequest);
      visit("/about");
      await waitFor(() => expect(screen.getByTestId("pending")).toHaveTextContent("true"));

      stopGeneration(queryClient);
      await waitFor(() => expect(screen.getByTestId("pending")).toHaveTextContent("false"));

      expect(await screen.findByRole("alert")).toHaveTextContent("Your trip was cancelled");

      settle().resolve(generatedTripFixture);
      await new Promise((r) => setTimeout(r, 20));
      expect(screen.queryByText("Your trip has been generated!")).toBeNull();
      expect(replace).not.toHaveBeenCalled();
      // Stopped, not spent: the answers are still there for another try.
      expect(readFormDraft()).toEqual(draft);
    });

    it("shows the cancellation, not a failure, when it fails after", async () => {
      const settle = pendingCall();
      const { queryClient } = renderTrip();

      ctx.generateTrip(validTripRequest);
      await waitFor(() => expect(screen.getByTestId("pending")).toHaveTextContent("true"));

      stopGeneration(queryClient);
      settle().reject(new Error("The model did not return a trip"));
      await new Promise((r) => setTimeout(r, 20));
      expect(screen.getByRole("alert")).toHaveTextContent("Your trip was cancelled");
      expect(screen.queryByText(/error generating your trip/)).toBeNull();
      expect(console.error).not.toHaveBeenCalled();
    });
  });

  // A stop marks that generation, not the request object it was sent with.
  it("lands normally when the same request is sent again after a stop", async () => {
    let resolveFirst: (value: typeof generatedTripFixture) => void = () => {};
    mockFetch.mockReturnValueOnce(new Promise((r) => (resolveFirst = r)));
    const { queryClient } = renderTrip();

    ctx.generateTrip(validTripRequest);
    await waitFor(() => expect(screen.getByTestId("pending")).toHaveTextContent("true"));
    stopGeneration(queryClient);
    resolveFirst(generatedTripFixture);

    mockFetch.mockResolvedValueOnce(generatedTripFixture);
    ctx.generateTrip(validTripRequest);

    await waitFor(() =>
      expect(replace).toHaveBeenCalledWith(`/trips/${generatedTripFixture.tripUrl}`),
    );
    expect(replace).toHaveBeenCalledTimes(1);
  });
});
