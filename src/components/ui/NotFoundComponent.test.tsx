import { describe, expect, it } from "vitest";
import { renderWithProviders, screen } from "@/test/render";
import NotFoundComponent from "@/components/ui/NotFoundComponent";

describe("NotFoundComponent", () => {
  it("renders the message as a heading", () => {
    renderWithProviders(
      <NotFoundComponent
        message="This page actually doesn't exist."
        path="/"
        button="Back to home"
      />,
    );

    expect(
      screen.getByRole("heading", { name: "This page actually doesn't exist." }),
    ).toBeInTheDocument();
  });

  it("links out with the button label as its accessible name", () => {
    renderWithProviders(
      <NotFoundComponent
        message="Seems that this trip doesn't exist."
        path="/saved-trips"
        button="Back to saved trips"
      />,
    );

    expect(
      screen.getByRole("link", { name: "Back to saved trips" }),
    ).toHaveAttribute("href", "/saved-trips");
  });

  it("hides the error glyph from assistive technology", () => {
    renderWithProviders(
      <NotFoundComponent message="Something went wrong!" path="/" button="Back" />,
    );

    // The heading already says it; the glyph is decoration.
    expect(screen.getByRole("heading").parentElement).toContainHTML(
      'aria-hidden="true"',
    );
  });
});
