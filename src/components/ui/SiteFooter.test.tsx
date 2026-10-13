import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import SiteFooter from "@/components/ui/SiteFooter";

describe("SiteFooter", () => {
  it("tucks the logo tile after the wordmark, as the nav and lockup do", () => {
    render(<SiteFooter />);

    const tile = screen.getByText("trip ai").nextElementSibling;
    expect(tile).toHaveAttribute("aria-hidden", "true");
    expect(tile?.querySelector("[data-logo-glyph]")).toBeInTheDocument();
  });
});
