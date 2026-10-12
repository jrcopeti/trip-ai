import { describe, expect, it, vi } from "vitest";
import { renderWithProviders, screen } from "@/test/render";
import HowItWorks from "./HowItWorks";

vi.mock("next/image", async () => ({
  default: (await import("@/test/stubs/next")).NextImage,
}));

describe("HowItWorks", () => {
  it("heads the steps plainly", () => {
    renderWithProviders(<HowItWorks />);

    expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent(
      "Three steps. That's the app.",
    );
  });

  it("says the draft has five tours", () => {
    renderWithProviders(<HowItWorks />);

    expect(screen.getByText(/five tours/i)).toBeInTheDocument();
  });
});
