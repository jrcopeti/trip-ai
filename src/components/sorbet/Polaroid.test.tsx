import { describe, expect, it, vi } from "vitest";
import { renderWithProviders, screen } from "@/test/render";
import Polaroid, { POLAROID_TILT } from "@/components/sorbet/Polaroid";
import { defaultPlaceholder } from "@/lib/constants";

vi.mock("next/image", async () => ({
  default: (await import("@/test/stubs/next")).NextImage,
}));

const base = {
  image: "/fixtures/trip-1.jpg",
  placeholder: defaultPlaceholder,
  caption: "lisbon, Portugal",
};

function renderCard(index = 0) {
  return renderWithProviders(
    <Polaroid {...base} href="/saved-trips/1" username="ana" index={index} />,
  );
}

describe("Polaroid (card)", () => {
  it("renders the caption and the username", () => {
    renderCard();

    expect(screen.getByRole("heading", { name: "lisbon, Portugal" })).toBeInTheDocument();
    expect(screen.getByText("ana")).toBeInTheDocument();
  });

  it("sets the caption in the handwriting face, never below text-xl", () => {
    renderCard();

    const caption = screen.getByRole("heading", { name: "lisbon, Portugal" });
    expect(caption.className).toContain("font-sorbet-hand");
    expect(caption.className).toContain("text-2xl");
  });

  it("links the whole card to its href, named by the caption", () => {
    renderCard();

    const link = screen.getByRole("link", { name: /lisbon, portugal/i });
    expect(link).toHaveAttribute("href", "/saved-trips/1");
    expect(link.querySelector("article")).not.toBeNull();
  });

  it("names the link explicitly with the caption and username", () => {
    // Not left to name-from-content: Chromium skips text inside the `<article>`.
    renderCard();

    expect(screen.getByRole("link")).toHaveAttribute("aria-label", "lisbon, Portugal, ana");
  });

  it("hides the arrow from assistive tech", () => {
    const { container } = renderCard();

    const arrow = container.querySelector("svg")?.parentElement;
    expect(arrow).toHaveAttribute("aria-hidden");
  });

  it("carries the focus triad", () => {
    renderCard();

    const link = screen.getByRole("link");
    expect(link.className).toContain("focus-visible:outline-2");
    expect(link.className).toContain("focus-visible:outline-sorbet-ink");
  });

  it("tilts only from sm up, never below", () => {
    renderCard(0);

    const classes = screen.getByRole("link").className.split(/\s+/);
    const rotations = classes.filter((c) => /(^|:)-?rotate-[1-9]/.test(c));
    expect(rotations).toEqual(["sm:-rotate-2"]);
    expect(classes.some((c) => /^-?rotate-[1-9]/.test(c))).toBe(false);
  });

  it.each([0, 1, 2, 3])("index %i takes its own fan angle", (i) => {
    renderCard(i);

    expect(screen.getByRole("link").className).toContain(POLAROID_TILT[i]);
  });

  it("wraps index 4 back to the first fan angle", () => {
    renderCard(4);

    expect(screen.getByRole("link").className.split(/\s+/)).toContain(POLAROID_TILT[0]);
  });

  it("straightens and lifts on hover, without a transition under reduced motion", () => {
    renderCard();

    const classes = screen.getByRole("link").className;
    expect(classes).toContain("sm:hover:rotate-0");
    expect(classes).toContain("hover:-translate-y-2");
    expect(classes).toContain("motion-reduce:transition-none");
  });
});

describe("Polaroid (lg)", () => {
  it("renders the caption as the page heading, with no link, username or arrow", () => {
    const { container } = renderWithProviders(
      <Polaroid {...base} size="lg" caption="Seven Sunlit Days in Lisbon" />,
    );

    expect(
      screen.getByRole("heading", { level: 1, name: "Seven Sunlit Days in Lisbon" }),
    ).toBeInTheDocument();
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
    expect(container.querySelector("svg")).toBeNull();
  });

  it("rests on the fan's first angle from sm up and straightens on hover, like the cards", () => {
    renderWithProviders(<Polaroid {...base} size="lg" caption="Seven Sunlit Days in Lisbon" />);

    const classes = screen.getByRole("article").className.split(/\s+/);
    expect(classes).toContain("sm:-rotate-2");
    expect(classes).toContain("sm:hover:rotate-0");
    expect(classes).toContain("hover:-translate-y-2");
    expect(classes).toContain("motion-reduce:transition-none");
    // Never tilted below sm, where it would overflow the gutter at 390.
    expect(classes.some((c) => /^-?rotate-[1-9]/.test(c))).toBe(false);
  });
});
