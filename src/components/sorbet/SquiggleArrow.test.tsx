import { describe, expect, it } from "vitest";
import { renderWithProviders } from "@/test/render";
import SquiggleArrow from "@/components/sorbet/SquiggleArrow";

describe("SquiggleArrow", () => {
  it("is hidden from assistive tech and ignores the pointer", () => {
    const { container } = renderWithProviders(<SquiggleArrow className="h-24" />);

    const svg = container.querySelector("svg");
    expect(svg).toHaveAttribute("aria-hidden");
    expect(svg?.getAttribute("class")).toContain("pointer-events-none");
    expect(svg?.getAttribute("class")).toContain("h-24");
  });

  it("draws the loop and the arrowhead", () => {
    const { container } = renderWithProviders(<SquiggleArrow />);

    expect(container.querySelectorAll("path")).toHaveLength(2);
  });
});
