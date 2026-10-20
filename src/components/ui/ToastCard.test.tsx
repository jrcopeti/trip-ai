import { describe, expect, it } from "vitest";
import { act, render, screen } from "@testing-library/react";
import toast, { Toaster } from "react-hot-toast";
import ToastCard, { showToast } from "./ToastCard";
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

  it("marks a finished result with the green check, announced politely", () => {
    const { container } = render(<ToastCard tone="success" message="Your trip has been generated!" />);

    expect(screen.getByRole("status")).toHaveTextContent("Your trip has been generated!");
    expect(container.querySelector("[aria-hidden].text-sorbet-success svg")).not.toBeNull();
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

describe("showToast", () => {
  it("hides a dismissed toast and takes it out of reach at once", async () => {
    render(<Toaster />);
    act(() => {
      showToast(<ToastCard message="Your trip was saved" />, { id: "saved" });
    });
    expect(screen.getByText("Your trip was saved").closest("[inert]")).toBeNull();

    act(() => toast.dismiss("saved"));

    const inert = screen.getByText("Your trip was saved").closest("[inert]");
    expect(inert).toHaveClass("invisible");
  });
});
