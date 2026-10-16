import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import ToastCard from "./ToastCard";
import CustomToaster from "./CustomToaster";
import ErrorToaster from "./ErrorToaster";

describe("ToastCard", () => {
  it("announces news politely and failures as alerts", () => {
    render(
      <>
        <CustomToaster message="Your trip was saved" />
        <ErrorToaster message="Your trip was cancelled" />
      </>,
    );

    expect(screen.getByRole("status")).toHaveTextContent("Your trip was saved");
    expect(screen.getByRole("alert")).toHaveTextContent("Your trip was cancelled");
  });

  // A message alone sizes to its text; actions need room, so they get a fixed width.
  it("widens only when it carries actions", () => {
    render(
      <>
        <ToastCard message="Found Lisbon, Portugal" />
        <ToastCard message="Your trip has been generated!">
          <button type="button">View</button>
        </ToastCard>
      </>,
    );

    const [plain, withActions] = screen.getAllByRole("status");
    expect(plain.className).not.toContain("w-[min(24rem");
    expect(withActions.className).toContain("w-[min(24rem");
    expect(withActions).toContainElement(screen.getByRole("button", { name: "View" }));
  });
});
