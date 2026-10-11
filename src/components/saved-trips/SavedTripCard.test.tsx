import { describe, expect, it, vi } from "vitest";
import { renderWithProviders, screen } from "@/test/render";
import SavedTripCard from "@/components/saved-trips/SavedTripCard";
import { makeTrip, tripFixture } from "@/test/fixtures";
import { stubSrc } from "@/test/imageStub";

vi.mock("next/image", async () => ({
  default: (await import("@/test/stubs/next")).NextImage,
}));

describe("SavedTripCard", () => {
  it("captions the polaroid with city and country, bylined with the traveller", () => {
    renderWithProviders(<SavedTripCard trip={tripFixture} index={0} />);

    expect(screen.getByRole("heading", { name: "lisbon, Portugal" })).toBeInTheDocument();
    expect(screen.getByText("by ana")).toBeInTheDocument();
  });

  it("links to the saved trip's detail page", () => {
    renderWithProviders(<SavedTripCard trip={tripFixture} index={0} />);

    expect(screen.getByRole("link")).toHaveAttribute("href", "/saved-trips/1");
  });

  it("trims stray whitespace from the city", () => {
    renderWithProviders(<SavedTripCard trip={makeTrip({ city: " lisbon " })} index={0} />);

    expect(screen.getByRole("heading", { name: "lisbon, Portugal" })).toBeInTheDocument();
  });

  it("falls back to a bundled photo when the trip has none", () => {
    const { container } = renderWithProviders(
      <SavedTripCard trip={makeTrip({ image: null })} index={0} />,
    );

    expect(container.querySelector("img")).toHaveAttribute("src", stubSrc("1.jpg"));
  });

  it("never renders at opacity 0", () => {
    // The old card carried `opacity-0` for a GSAP batch to clear. With GSAP gone,
    // that class would leave every card in the grid invisible.
    const { container } = renderWithProviders(
      <SavedTripCard trip={tripFixture} index={0} />,
    );

    expect(container.innerHTML).not.toMatch(/\bopacity-0\b/);
  });
});
