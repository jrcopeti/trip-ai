import { describe, expect, it } from "vitest";
import { renderWithProviders, screen } from "@/test/render";
import Hero from "./Hero";

describe("Hero", () => {
  it("keeps the eyebrow's words as a plain label, not a chip with a dot", () => {
    renderWithProviders(<Hero />);

    const eyebrow = screen.getByText("Your new travel friend");
    expect(eyebrow.tagName).toBe("P");
    expect(eyebrow.children).toHaveLength(0);
    expect(eyebrow).not.toHaveClass("rounded-full");
  });

  // The deck itself is `HeroDeck`'s, streamed in by the page; the hero only
  // gives it a place.
  it("renders the deck it is given, below the calls to action", () => {
    renderWithProviders(<Hero deck={<ul aria-label="deck slot" />} />);

    const deck = screen.getByRole("list", { name: "deck slot" });
    const cta = screen.getByRole("link", { name: "See saved trips" });
    expect(cta.compareDocumentPosition(deck) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it("renders without a deck", () => {
    renderWithProviders(<Hero />);

    expect(screen.queryByRole("list")).not.toBeInTheDocument();
  });
});
