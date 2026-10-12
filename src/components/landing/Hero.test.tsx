import { describe, expect, it, vi } from "vitest";
import { renderWithProviders, screen } from "@/test/render";
import Hero from "./Hero";

vi.mock("next/image", async () => ({
  default: (await import("@/test/stubs/next")).NextImage,
}));

describe("Hero", () => {
  it("keeps the eyebrow's words as a plain label, not a chip with a dot", () => {
    renderWithProviders(<Hero />);

    const eyebrow = screen.getByText("Your new travel friend");
    expect(eyebrow.tagName).toBe("P");
    expect(eyebrow.children).toHaveLength(0);
    expect(eyebrow).not.toHaveClass("rounded-full");
  });
});
