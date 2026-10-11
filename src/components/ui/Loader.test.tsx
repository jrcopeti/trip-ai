import { describe, expect, it } from "vitest";
import { renderWithProviders, screen } from "@/test/render";
import Loader from "@/components/ui/Loader";

describe("Loader", () => {
  it("announces itself as a loading status", () => {
    renderWithProviders(<Loader />);

    expect(screen.getByRole("status", { name: "Loading" })).toBeInTheDocument();
  });

  it("shows the squiggle, hidden from assistive tech", () => {
    renderWithProviders(<Loader />);

    const svg = screen.getByRole("status").querySelector("svg");
    expect(svg).toHaveAttribute("aria-hidden");
    expect(svg?.querySelectorAll("path")).toHaveLength(1);
  });
});
