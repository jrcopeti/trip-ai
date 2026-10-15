import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderWithProviders, screen, waitFor } from "@/test/render";
import { useIsMutating } from "@tanstack/react-query";
import { generateTripKey, useTripGeneration } from "@/hooks/useTripGeneration";
import { generateTrip } from "@/app/api/anthropicApi";
import { generatedTripFixture, validInputs, validTripRequest } from "@/test/fixtures";
import { replace, resetNextStubs } from "@/test/stubs/next";
import { readFormDraft, writeFormDraft } from "@/lib/formDraft";

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
  return renderWithProviders(<Probe />);
}

beforeEach(() => {
  resetNextStubs();
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
});
