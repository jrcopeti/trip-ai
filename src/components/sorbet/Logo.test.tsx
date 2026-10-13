import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import Logo from "@/components/sorbet/Logo";
import { stubSrc } from "@/test/imageStub";

describe("Logo", () => {
  it("is a lime tile hidden from assistive tech", () => {
    const { container } = render(<Logo />);

    const tile = container.firstElementChild as HTMLElement;
    expect(tile).toHaveAttribute("aria-hidden", "true");
    expect(tile.className).toContain("bg-sorbet-lime");
  });

  it("draws the glyph in ink, masked by the logo artwork", () => {
    const { container } = render(<Logo />);

    const glyph = container.querySelector("[data-logo-glyph]") as HTMLElement;
    expect(glyph.className).toContain("bg-sorbet-ink");
    expect(glyph.className).toContain("mask-(--logo-mask)");
    expect(glyph.className).toContain("mask-contain");
    expect(glyph.style.getPropertyValue("--logo-mask")).toBe(
      `url(${stubSrc("logo.png")})`,
    );
  });

  it("is small in the nav, a step up in the footer, and large in the lockup", () => {
    const nav = render(<Logo size="nav" />).container.firstElementChild!;
    const footer = render(<Logo size="footer" />).container.firstElementChild!;
    const lockup = render(<Logo size="lockup" />).container.firstElementChild!;

    expect(nav.className).toContain("size-8");
    expect(footer.className).toContain("size-10");
    // Sized off the wordmark's own clamp.
    expect(lockup.className).toContain("text-[clamp(3.5rem,12vw,9rem)]");
    expect(lockup.className).toContain("size-[0.9em]");
  });

  it("takes extra classes", () => {
    const { container } = render(<Logo className="shrink-0" />);

    expect(container.firstElementChild?.className).toContain("shrink-0");
  });
});
