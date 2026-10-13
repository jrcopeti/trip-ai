import { describe, expect, it, vi } from "vitest";
import { renderWithProviders, screen } from "@/test/render";
import { tripFixture, tripFixture2 } from "@/test/fixtures";
import loadLatestTrips from "./loadLatestTrips";
import LatestTripsDeck, { HeroDeckFallback } from "./LatestTripsDeck";

vi.mock("next/image", async () => ({
  default: (await import("@/test/stubs/next")).NextImage,
}));
vi.mock("./loadLatestTrips", () => ({ default: vi.fn() }));

describe("LatestTripsDeck", () => {
  // An async server component: RTL cannot render it, so it is awaited as a
  // function and its element rendered.
  it("loads the latest trips and deals them", async () => {
    vi.mocked(loadLatestTrips).mockResolvedValue([tripFixture2, tripFixture]);

    renderWithProviders(await LatestTripsDeck());

    expect(screen.getAllByRole("link")).toHaveLength(2);
  });

  it("deals nothing when the loader gives up", async () => {
    vi.mocked(loadLatestTrips).mockResolvedValue([]);

    renderWithProviders(await LatestTripsDeck());

    expect(screen.queryByRole("list")).not.toBeInTheDocument();
  });
});

describe("HeroDeckFallback", () => {
  it("says what it is waiting for, for screen readers", () => {
    renderWithProviders(<HeroDeckFallback />);

    expect(screen.getByRole("status")).toHaveTextContent("Loading the latest saved trips");
  });
});
