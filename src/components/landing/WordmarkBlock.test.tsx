import { describe, expect, it } from "vitest";
import { renderWithProviders, screen } from "@/test/render";
import WordmarkBlock from "./WordmarkBlock";

describe("WordmarkBlock", () => {
  it("lists what the product does, not what it is built on", () => {
    renderWithProviders(<WordmarkBlock />);

    const terms = screen.getAllByRole("term").map((term) => term.textContent);
    expect(terms).toEqual([
      "Checks the weather",
      "Uses real photos",
      "Five tours, by kind",
      "Keeps what you save",
    ]);
    expect(screen.queryByText("Claude Sonnet")).not.toBeInTheDocument();
    expect(screen.queryByText("Steps in the form")).not.toBeInTheDocument();
  });

  it("introduces the features rather than repeating the hero's eyebrow", () => {
    renderWithProviders(<WordmarkBlock />);

    expect(screen.getByText("What it does")).toBeInTheDocument();
    expect(screen.queryByText("Your new travel friend")).not.toBeInTheDocument();
  });
});
