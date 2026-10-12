import { describe, expect, it, vi } from "vitest";
import { renderWithProviders, screen, within } from "@/test/render";
import { travelPhotos } from "@/data";
import { TOUR_KINDS } from "@/lib/tourKinds";
import PhotoBand from "./PhotoBand";

vi.mock("next/image", async () => ({
  default: (await import("@/test/stubs/next")).NextImage,
}));

const photo = travelPhotos[3];

describe("PhotoBand", () => {
  it("shows the photo it is given, with no chip over it", () => {
    renderWithProviders(<PhotoBand photo={photo} />);

    expect(screen.getByRole("img", { name: photo.alt })).toBeInTheDocument();
    expect(screen.queryByText("Balloons at sunrise")).not.toBeInTheDocument();
  });

  it("says what actually comes back", () => {
    renderWithProviders(<PhotoBand photo={photo} />);

    expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent(
      "What comes back: tours for the city, the forecast for your dates, and what to pack.",
    );
  });

  it("shows five sample tours, each with a title, a kind chip and a description", () => {
    renderWithProviders(<PhotoBand photo={photo} />);

    const cards = screen.getAllByRole("article");
    expect(cards).toHaveLength(5);
    for (const card of cards) {
      expect(within(card).getByRole("heading", { level: 3 })).not.toBeEmptyDOMElement();
      expect(card.querySelector("p")).not.toBeEmptyDOMElement();
      const kind = TOUR_KINDS.find((k) => card.textContent?.includes(k));
      expect(kind).toBeDefined();
      expect(card.querySelector("svg")).not.toBeNull();
    }
  });
});
