import { beforeEach, describe, expect, it, vi } from "vitest";
import userEvent from "@testing-library/user-event";
import { screen, waitFor } from "@/test/render";
import { renderGeneratedTrip, renderSavedTrip } from "@/test/trip";
import { back } from "@/test/stubs/next";
import { createTripInDB } from "@/db/actions";
import { makeTrip, tripDataFixture, tripFixture } from "@/test/fixtures";
import SaveSection from "./SaveSection";
import FinalSection from "./FinalSection";
import { closing } from "./content";

vi.mock("@/app/api/anthropicApi", () => ({ generateTrip: vi.fn() }));
vi.mock("@/app/api/unsplashApi", () => ({ fetchTripImage: vi.fn() }));
vi.mock("@/app/api/openWeatherApi", () => ({ fetchWeather: vi.fn(), fetchForecast: vi.fn() }));
vi.mock("@/db/actions", () => ({ getSingleSavedTrip: vi.fn(), createTripInDB: vi.fn() }));
vi.mock("next/navigation", () => import("@/test/stubs/next"));
vi.mock("next/image", async () => ({
  default: (await import("@/test/stubs/next")).NextImage,
}));

const mockCreate = vi.mocked(createTripInDB);
const setIsTripSaved = vi.fn();

beforeEach(() => {
  mockCreate.mockReset();
  mockCreate.mockResolvedValue(tripFixture);
  setIsTripSaved.mockClear();
});

describe("SaveSection", () => {
  it("leads with the generated trip's tip", () => {
    renderGeneratedTrip(<SaveSection />);

    expect(screen.getByText(tripDataFixture.tip)).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: closing.save.question })).toBeInTheDocument();
  });

  it("saves the trip with saved: true on yes", async () => {
    renderGeneratedTrip(<SaveSection />, { trip: { setIsTripSaved } });

    await userEvent.click(screen.getByRole("button", { name: closing.save.yes }));

    await waitFor(() => expect(mockCreate).toHaveBeenCalledTimes(1));
    expect(mockCreate.mock.calls[0][0]).toMatchObject({ saved: true, tripUrl: "ab12c" });
    await waitFor(() => expect(setIsTripSaved).toHaveBeenCalledWith(true));
  });

  it("writes the trip with saved: false on no", async () => {
    renderGeneratedTrip(<SaveSection />, { trip: { setIsTripSaved } });

    await userEvent.click(screen.getByRole("button", { name: closing.save.no }));

    await waitFor(() => expect(mockCreate).toHaveBeenCalledTimes(1));
    expect(mockCreate.mock.calls[0][0]).toMatchObject({ saved: false, tripUrl: "ab12c" });
  });

  it("disables both answers while the trip is being written", async () => {
    mockCreate.mockReturnValue(new Promise(() => {}));
    renderGeneratedTrip(<SaveSection />);

    await userEvent.click(screen.getByRole("button", { name: closing.save.yes }));

    await waitFor(() =>
      expect(screen.getByRole("button", { name: closing.save.yes })).toBeDisabled(),
    );
    expect(screen.getByRole("button", { name: closing.save.no })).toBeDisabled();
  });

  it("offers the saved trips and a new trip once answered", () => {
    renderGeneratedTrip(<SaveSection />, { trip: { isTripSaved: true } });

    expect(screen.queryByRole("button", { name: closing.save.yes })).not.toBeInTheDocument();
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
  it("leads with the saved trip's tip", async () => {
    renderSavedTrip(<FinalSection />, { row: makeTrip({ tip: "Bring a scarf." }) });

    expect(await screen.findByText("Bring a scarf.")).toBeInTheDocument();
  });

  it("goes back on Back", async () => {
    renderSavedTrip(<FinalSection />);

    await userEvent.click(screen.getByRole("button", { name: closing.final.back }));

    expect(back).toHaveBeenCalledTimes(1);
  });

  it("links to a new trip", () => {
    renderSavedTrip(<FinalSection />);

    expect(screen.getByRole("link", { name: closing.final.another.label })).toHaveAttribute(
      "href",
      closing.final.another.href,
    );
  });
});
