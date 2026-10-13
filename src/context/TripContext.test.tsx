import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderWithProviders, screen, waitFor } from "@/test/render";
import { TripProvider } from "@/context/TripContext";
import { useTripResponse } from "@/hooks/useTripResponse";
import { generateTrip } from "@/app/api/anthropicApi";
import { tripDataFixture, validTripRequest } from "@/test/fixtures";
import { replace, resetNextStubs, prefetch } from "@/test/stubs/next";
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
      <span data-testid="title">{ctx.tripData?.title ?? "none"}</span>
      <span data-testid="saved">{String(ctx.isTripSaved)}</span>
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
  it("starts with no trip and nothing pending", () => {
    renderTrip();
    expect(screen.getByTestId("title")).toHaveTextContent("none");
    expect(screen.getByTestId("pending")).toHaveTextContent("false");
    expect(screen.getByTestId("saved")).toHaveTextContent("false");
  });

  it("prefetches the trip route it will redirect to", () => {
    renderTrip();
    expect(prefetch).toHaveBeenCalledWith(expect.stringMatching(/^\/trips\/.{5}$/));
  });

  it("exposes the AI response on success", async () => {
    mockFetch.mockResolvedValue(tripDataFixture);
    renderTrip();

    ctx.generateResponseAI(validTripRequest);

    await waitFor(() => {
      expect(screen.getByTestId("title")).toHaveTextContent(
        "Ana's Seven Sunlit Days Across Lisbon, Portugal",
      );
    });
  });

  it("passes the request straight through to the API module", async () => {
    mockFetch.mockResolvedValue(tripDataFixture);
    renderTrip();

    ctx.generateResponseAI(validTripRequest);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(validTripRequest);
    });
  });

  it("redirects to the prefetched trip url on success", async () => {
    mockFetch.mockResolvedValue(tripDataFixture);
    renderTrip();

    ctx.generateResponseAI(validTripRequest);

    await waitFor(() => {
      expect(replace).toHaveBeenCalledWith(expect.stringMatching(/^\/trips\/.{5}$/));
    });
    expect(replace.mock.calls[0][0]).toBe(prefetch.mock.calls[0][0]);
  });

  it("reports pending while the request is in flight", async () => {
    let resolve: (value: typeof tripDataFixture) => void = () => {};
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

    resolve(tripDataFixture);

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
    expect(screen.getByTestId("title")).toHaveTextContent("none");
  });

  it("runs the caller's onSuccess once the trip is back", async () => {
    mockFetch.mockResolvedValue(tripDataFixture);
    const onSuccess = vi.fn();
    renderTrip();

    ctx.generateResponseAI(validTripRequest, { onSuccess });

    await waitFor(() => expect(onSuccess).toHaveBeenCalledTimes(1));
  });

  it("skips the caller's onSuccess when the call fails", async () => {
    mockFetch.mockRejectedValue(new Error("The city could not be resolved: unavailable"));
    const onSuccess = vi.fn();
    renderTrip();

    ctx.generateResponseAI(validTripRequest, { onSuccess });

    await waitFor(() => expect(ctx.errorResponseAI).toBeInstanceOf(Error));
    expect(onSuccess).not.toHaveBeenCalled();
  });

  it("clears the error on reset, so the form can show again", async () => {
    mockFetch.mockRejectedValue(new Error("The model did not return a trip"));
    renderTrip();

    ctx.generateResponseAI(validTripRequest);
    await waitFor(() => expect(ctx.errorResponseAI).toBeInstanceOf(Error));

    ctx.resetResponseAI();
    await waitFor(() => expect(ctx.errorResponseAI).toBeNull());
  });

  it("lets the save flag be flipped", async () => {
    renderTrip();
    ctx.setIsTripSaved(true);
    await waitFor(() => {
      expect(screen.getByTestId("saved")).toHaveTextContent("true");
    });
  });
});
