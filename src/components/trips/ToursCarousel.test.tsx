import { describe, expect, it } from "vitest";
import userEvent from "@testing-library/user-event";
import { fireEvent, renderWithProviders, screen, waitFor } from "@/test/render";
import ToursCarousel from "./ToursCarousel";
import { tours as copy } from "./content";
import type { Tour } from "./tours";

const TEXTS = [
  "Walk the Alfama at first light.",
  "Take the train to Sintra.",
  "Spend an afternoon in Belem.",
];
/** Untitled, as the AI returns them today. */
const TOURS: Tour[] = TEXTS.map((description) => ({ description }));

/** The tour on screen. Entering and leaving slides overlap briefly, so wait it out. */
async function expectShowing(tour: string, n: number) {
  // `tour` is the description text.
  await waitFor(() => {
    const slide = screen.getByRole("group", { name: copy.slide(n, TOURS.length) });
    expect(slide).toHaveTextContent(tour);
    expect(screen.getAllByRole("group")).toHaveLength(1);
  });
}

describe("ToursCarousel", () => {
  it("is a named carousel showing one tour at a time", () => {
    renderWithProviders(<ToursCarousel tours={TOURS} />);

    const region = screen.getByRole("region", { name: copy.carousel });
    expect(region).toHaveAttribute("aria-roledescription", "carousel");
    const slide = screen.getByRole("group", { name: copy.slide(1, 3) });
    expect(slide).toHaveAttribute("aria-roledescription", "slide");
    expect(slide).toHaveTextContent(TEXTS[0]);
    expect(screen.getAllByRole("heading", { level: 3 })).toHaveLength(1);
    expect(screen.getAllByRole("group")).toHaveLength(1);
  });

  it("holds a placeholder in the title slot until the tour has a title", () => {
    renderWithProviders(<ToursCarousel tours={TOURS} />);

    const title = screen.getByRole("heading", { level: 3 });
    expect(title).toHaveTextContent(copy.untitled);
    expect(title).toHaveAttribute("data-placeholder");
    expect(title.nextElementSibling).toHaveTextContent(TEXTS[0]);
  });

  it("shows the tour's own title once it has one", () => {
    renderWithProviders(
      <ToursCarousel tours={[{ title: "Alfama at dawn", description: TEXTS[0] }]} />,
    );

    const title = screen.getByRole("heading", { level: 3, name: "Alfama at dawn" });
    expect(title).not.toHaveAttribute("data-placeholder");
    expect(screen.queryByText(copy.untitled)).not.toBeInTheDocument();
  });

  it("reserves the longest tour's height with copies hidden from assistive tech", () => {
    const { container } = renderWithProviders(<ToursCarousel tours={TOURS} />);

    // One invisible sizer per tour, sharing the slide's grid cell.
    const sizers = container.querySelectorAll("[aria-hidden='true'].invisible");
    expect(sizers).toHaveLength(TOURS.length);
    sizers.forEach((sizer, i) => {
      expect(sizer).toHaveTextContent(TEXTS[i]);
      expect(sizer.className).toContain("row-start-1");
    });
  });

  it("announces the new tour politely", () => {
    renderWithProviders(<ToursCarousel tours={TOURS} />);

    expect(screen.getByRole("group").parentElement).toHaveAttribute("aria-live", "polite");
  });

  it("steps forward with Next and wraps back to the first", async () => {
    renderWithProviders(<ToursCarousel tours={TOURS} />);
    const next = screen.getByRole("button", { name: copy.next });

    await userEvent.click(next);
    await expectShowing(TEXTS[1], 2);
    await userEvent.click(next);
    await expectShowing(TEXTS[2], 3);
    await userEvent.click(next);
    await expectShowing(TEXTS[0], 1);
  });

  it("steps back with Previous, wrapping to the last", async () => {
    renderWithProviders(<ToursCarousel tours={TOURS} />);

    await userEvent.click(screen.getByRole("button", { name: copy.previous }));

    await expectShowing(TEXTS[2], 3);
  });

  it("jumps with the dots and marks the current one", async () => {
    renderWithProviders(<ToursCarousel tours={TOURS} />);
    expect(screen.getByRole("button", { name: copy.goTo(1) })).toHaveAttribute(
      "aria-current",
      "true",
    );

    await userEvent.click(screen.getByRole("button", { name: copy.goTo(3) }));

    await expectShowing(TEXTS[2], 3);
    expect(screen.getByRole("button", { name: copy.goTo(3) })).toHaveAttribute(
      "aria-current",
      "true",
    );
    expect(screen.getByRole("button", { name: copy.goTo(1) })).not.toHaveAttribute(
      "aria-current",
    );
  });

  it("steps with the arrow keys", async () => {
    renderWithProviders(<ToursCarousel tours={TOURS} />);
    const region = screen.getByRole("region", { name: copy.carousel });

    fireEvent.keyDown(region, { key: "ArrowRight" });
    await expectShowing(TEXTS[1], 2);
    fireEvent.keyDown(region, { key: "ArrowLeft" });
    await expectShowing(TEXTS[0], 1);
  });

  it("counts the position", async () => {
    renderWithProviders(<ToursCarousel tours={TOURS} />);
    expect(screen.getByText("01")).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: copy.next }));

    expect(await screen.findByText("02")).toBeInTheDocument();
  });

  it("drops the controls when there is only one tour", () => {
    renderWithProviders(<ToursCarousel tours={[TOURS[0]]} />);

    expect(screen.getByRole("group")).toHaveTextContent(TEXTS[0]);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("renders nothing without tours", () => {
    const { container } = renderWithProviders(<ToursCarousel tours={[]} />);

    expect(container).toBeEmptyDOMElement();
  });
});
