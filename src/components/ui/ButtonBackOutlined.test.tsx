import { beforeEach, describe, expect, it, vi } from "vitest";
import userEvent from "@testing-library/user-event";
import { renderWithProviders, screen } from "@/test/render";
import ButtonBackOutlined from "@/components/ui/ButtonBackOutlined";
import { back, resetNextStubs } from "@/test/stubs/next";

vi.mock("next/navigation", () => import("@/test/stubs/next"));

beforeEach(() => {
  resetNextStubs();
});

describe("ButtonBackOutlined", () => {
  it("has an accessible name", () => {
    // It had none before step 1: the glyph is the whole control, so a screen
    // reader announced an unlabelled button.
    renderWithProviders(<ButtonBackOutlined position="" />);

    expect(screen.getByRole("button", { name: "Go back" })).toBeInTheDocument();
  });

  it("goes back in history when pressed", async () => {
    const user = userEvent.setup();
    renderWithProviders(<ButtonBackOutlined position="" />);

    await user.click(screen.getByRole("button", { name: "Go back" }));

    expect(back).toHaveBeenCalledTimes(1);
  });

  it("applies the caller's placement classes", () => {
    renderWithProviders(<ButtonBackOutlined position="absolute left-0 top-0" />);

    const button = screen.getByRole("button", { name: "Go back" });
    expect(button.className).toContain("absolute left-0 top-0");
  });
});
