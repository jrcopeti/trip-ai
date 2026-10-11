import { describe, expect, it } from "vitest";
import { renderWithProviders } from "@/test/render";
import SquiggleLoader from "@/components/sorbet/SquiggleLoader";

describe("SquiggleLoader", () => {
  it("is decorative: hidden from assistive tech and the pointer", () => {
    const { container } = renderWithProviders(<SquiggleLoader className="h-20" />);

    const svg = container.querySelector("svg");
    expect(svg).toHaveAttribute("aria-hidden");
    expect(svg?.getAttribute("class")).toContain("pointer-events-none");
    expect(svg?.getAttribute("class")).toContain("h-20");
  });

  it("draws one stroke", () => {
    const { container } = renderWithProviders(<SquiggleLoader />);

    expect(container.querySelectorAll("path")).toHaveLength(1);
  });
});
