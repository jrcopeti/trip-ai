import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ComponentProps } from "react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders, screen, waitFor } from "@/test/render";
import { back } from "@/test/stubs/next";
import { setTripSaved } from "@/db/actions";
import { generatedTripFixture, tripDataFixture } from "@/test/fixtures";
import SaveSection from "./SaveSection";
import FinalSection from "./FinalSection";
import { closing } from "./content";

vi.mock("@/db/actions", () => ({ setTripSaved: vi.fn() }));
vi.mock("next/navigation", () => import("@/test/stubs/next"));
vi.mock("next/image", async () => ({
  default: (await import("@/test/stubs/next")).NextImage,
}));

const mockSave = vi.mocked(setTripSaved);

beforeEach(() => {
  mockSave.mockReset();
  mockSave.mockResolvedValue(undefined);
});

function renderSave(props: Partial<ComponentProps<typeof SaveSection>> = {}) {
  const { tripUrl, saved, tripImages, placeholder, tip } = generatedTripFixture;
  return renderWithProviders(
    <SaveSection
      tripUrl={tripUrl}
      saved={saved}
      image={tripImages[4]}
      placeholder={placeholder}
      tip={tip}
      {...props}
    />,
  );
}

const expectWhatNext = () => {
  expect(screen.getByRole("heading", { name: closing.saved.heading })).toBeInTheDocument();
  expect(screen.queryByRole("button", { name: closing.save.yes })).not.toBeInTheDocument();
};

describe("SaveSection", () => {
  it("leads with the trip's tip and asks", () => {
    renderSave();

    expect(screen.getByText(tripDataFixture.tip)).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: closing.save.question })).toBeInTheDocument();
  });

  it("saves the written trip by its url on yes, then moves on", async () => {
    renderSave();

    await userEvent.click(screen.getByRole("button", { name: closing.save.yes }));

    await waitFor(() => expect(mockSave).toHaveBeenCalledTimes(1));
    expect(mockSave).toHaveBeenCalledWith(generatedTripFixture.tripUrl, true);
    await waitFor(expectWhatNext);
  });

  it("answers false on no, then moves on", async () => {
    renderSave();

    await userEvent.click(screen.getByRole("button", { name: closing.save.no }));

    await waitFor(() => expect(mockSave).toHaveBeenCalledTimes(1));
    expect(mockSave).toHaveBeenCalledWith(generatedTripFixture.tripUrl, false);
    await waitFor(expectWhatNext);
  });

  it("keeps asking when the write fails", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    mockSave.mockRejectedValue(new Error("No unsaved trip at that url"));
    renderSave();

    await userEvent.click(screen.getByRole("button", { name: closing.save.yes }));

    await waitFor(() =>
      expect(screen.getByRole("button", { name: closing.save.yes })).toBeEnabled(),
    );
    expect(screen.getByRole("heading", { name: closing.save.question })).toBeInTheDocument();
  });

  it("disables both answers while the trip is being written", async () => {
    mockSave.mockReturnValue(new Promise(() => {}));
    renderSave();

    await userEvent.click(screen.getByRole("button", { name: closing.save.yes }));

    await waitFor(() =>
      expect(screen.getByRole("button", { name: closing.save.yes })).toBeDisabled(),
    );
    expect(screen.getByRole("button", { name: closing.save.no })).toBeDisabled();
  });

  it("offers the saved trips and a new trip when the row is already saved", () => {
    renderSave({ saved: true });

    expectWhatNext();
    expect(screen.getByRole("link", { name: closing.saved.view.label })).toHaveAttribute(
      "href",
      closing.saved.view.href,
    );
    expect(screen.getByRole("link", { name: closing.saved.another.label })).toHaveAttribute(
      "href",
      closing.saved.another.href,
    );
  });
});

describe("FinalSection", () => {
  const renderFinal = () =>
    renderWithProviders(<FinalSection placeholder={null} tip="Bring a scarf." />);

  it("leads with the trip's tip", () => {
    renderFinal();

    expect(screen.getByText("Bring a scarf.")).toBeInTheDocument();
  });

  it("shows the tip's paragraphs apart, with no backslash", () => {
    const { container } = renderWithProviders(
      <FinalSection placeholder={null} tip={"Book ahead.\\nCarry cash."} />,
    );

    expect(screen.getByText("Book ahead.")).toBeInTheDocument();
    expect(screen.getByText("Carry cash.")).toBeInTheDocument();
    expect(container.textContent).not.toContain("\\");
  });

  it("shows no tip, and no eyebrow over it, when the tip is blank", () => {
    renderWithProviders(<FinalSection placeholder={null} tip={" \\n "} />);

    expect(screen.queryByText(closing.eyebrow)).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { name: closing.final.heading })).toBeInTheDocument();
  });

  it("goes back on Back", async () => {
    renderFinal();

    await userEvent.click(screen.getByRole("button", { name: closing.final.back }));

    expect(back).toHaveBeenCalledTimes(1);
  });

  it("links to a new trip", () => {
    renderFinal();

    expect(screen.getByRole("link", { name: closing.final.another.label })).toHaveAttribute(
      "href",
      closing.final.another.href,
    );
  });
});
