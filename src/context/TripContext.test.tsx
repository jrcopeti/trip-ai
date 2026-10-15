import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderWithProviders, screen, waitFor } from "@/test/render";
import { TripProvider } from "@/context/TripContext";
import { useTripResponse } from "@/hooks/useTripResponse";
import { generateTrip } from "@/app/api/anthropicApi";
import { generatedTripFixture, validTripRequest } from "@/test/fixtures";
import { replace, resetNextStubs } from "@/test/stubs/next";
import type { TripContextType } from "@/types";

vi.mock("next/navigation", () => import("@/test/stubs/next"));
vi.mock("@/app/api/anthropicApi", () => ({ generateTrip: vi.fn() }));

const mockFetch = vi.mocked(generateTrip);

let ctx: TripContextType;

function Probe() {
  ctx = useTripResponse();
  return (
    <div>
      <span data-testid="pending">{String(ctx.isPendingResponseAI)}</span>
    </div>
  );
}

function renderTrip() {
  return renderWithProviders(
    <TripProvider>
      <Probe />
    </TripProvider>,
  );
}

beforeEach(() => {
  resetNextStubs();
  mockFetch.mockReset();
  vi.spyOn(console, "error").mockImplementation(() => {});
});

describe("TripContext", () => {
  it("starts with nothing pending", () => {
    renderTrip();
    expect(screen.getByTestId("pending")).toHaveTextContent("false");
  });

  it("passes the request straight through to the API module", async () => {
    mockFetch.mockResolvedValue(generatedTripFixture);
    renderTrip();

    ctx.generateResponseAI(validTripRequest);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(validTripRequest);
    });
  });

  it("redirects to the url the server gave the trip", async () => {
    mockFetch.mockResolvedValue(generatedTripFixture);
    renderTrip();

    ctx.generateResponseAI(validTripRequest);

    await waitFor(() => {
      expect(replace).toHaveBeenCalledWith(`/trips/${generatedTripFixture.tripUrl}`);
    });
  });

  it("reports pending while the request is in flight", async () => {
    let resolve: (value: typeof generatedTripFixture) => void = () => {};
    mockFetch.mockReturnValue(
      new Promise((r) => {
        resolve = r;
      }),
    );
    renderTrip();

    ctx.generateResponseAI(validTripRequest);

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

    ctx.generateResponseAI(validTripRequest);

    await waitFor(() => {
      expect(ctx.errorResponseAI).toBeInstanceOf(Error);
    });
    expect(replace).not.toHaveBeenCalled();
  });

  it("clears the error on reset, so the form can show again", async () => {
    mockFetch.mockRejectedValue(new Error("The model did not return a trip"));
    renderTrip();

    ctx.generateResponseAI(validTripRequest);
    await waitFor(() => expect(ctx.errorResponseAI).toBeInstanceOf(Error));

    ctx.resetResponseAI();
    await waitFor(() => expect(ctx.errorResponseAI).toBeNull());
  });
});
