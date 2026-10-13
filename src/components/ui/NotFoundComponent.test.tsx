import { describe, expect, it, vi } from "vitest";
import userEvent from "@testing-library/user-event";
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

  it("acts in place, as a button, when given onAction instead of a path", async () => {
    const onAction = vi.fn();
    renderWithProviders(
      <NotFoundComponent message="It failed." button="Try again" onAction={onAction} />,
    );

    expect(screen.queryByRole("link")).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Try again" }));
    expect(onAction).toHaveBeenCalledTimes(1);
  });

  it("hides the error glyph from assistive technology", () => {
    const { container } = renderWithProviders(
      <NotFoundComponent message="Something went wrong!" path="/" button="Back" />,
    );

    // The heading already says it; the glyph is decoration. Pinned on the glyph
    // itself: "something in here is aria-hidden" would still pass if the
    // attribute moved onto the heading or the link.
    const glyph = container.querySelector("svg");
    expect(glyph?.closest('[aria-hidden="true"]')).not.toBeNull();
    expect(screen.getByRole("heading").closest('[aria-hidden="true"]')).toBeNull();
    expect(screen.getByRole("link").closest('[aria-hidden="true"]')).toBeNull();
  });
});
