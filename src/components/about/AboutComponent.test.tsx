import { describe, expect, it, vi } from "vitest";
import { renderWithProviders, screen } from "@/test/render";
import AboutComponent from "@/components/about/AboutComponent";
import pickAboutImage from "@/components/about/pickAboutImage";

vi.mock("next/navigation", () => import("@/test/stubs/next"));
vi.mock("next/image", async () => ({
  default: (await import("@/test/stubs/next")).NextImage,
}));

const image = pickAboutImage(() => 0);

describe("AboutComponent", () => {
  it("renders the page heading", () => {
    renderWithProviders(<AboutComponent image={image} />);

    expect(
      screen.getByRole("heading", { level: 1, name: /about trip ai/i }),
    ).toBeInTheDocument();
  });

  it("renders the lead paragraph", () => {
    renderWithProviders(<AboutComponent image={image} />);

    expect(
      screen.getByText(/makes travel planning fun/i),
    ).toBeInTheDocument();
  });

  it("credits the author with a safe external link", () => {
    renderWithProviders(<AboutComponent image={image} />);

    const credit = screen.getByRole("link", { name: "José Copeti" });
    expect(credit).toHaveAttribute("href", "https://github.com/jrcopeti");
    expect(credit).toHaveAttribute("target", "_blank");
    expect(credit).toHaveAttribute("rel", expect.stringContaining("noopener"));
    expect(credit.className).toContain("focus-visible:outline-sorbet-ink");
  });

  it("describes the photo with its own alt", () => {
    renderWithProviders(<AboutComponent image={image} />);

    expect(screen.getByRole("img", { name: image.alt })).toBeInTheDocument();
  });

  it("closes with a call to action to the form", () => {
    renderWithProviders(<AboutComponent image={image} />);

    expect(screen.getByRole("link", { name: "Plan a trip" })).toHaveAttribute(
      "href",
      "/form",
    );
  });
});
