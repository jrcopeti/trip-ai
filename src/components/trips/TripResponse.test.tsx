import { beforeEach, describe, expect, it, vi } from "vitest";
import { screen } from "@/test/render";
import { renderGeneratedTrip, renderSavedTrip } from "@/test/trip";
import { notFound } from "@/test/stubs/next";
import { getSingleSavedTrip } from "@/db/actions";
import { tripDataFixture, tripFixture } from "@/test/fixtures";
import TripResponse from "./TripResponse";
import SavedTripsPageComponent from "./SavedTripsPageComponent";
import { closing, states } from "./content";

vi.mock("@/app/api/anthropicApi", () => ({ generateTrip: vi.fn() }));
vi.mock("@/app/api/unsplashApi", () => ({ fetchTripImage: vi.fn() }));
vi.mock("@/app/api/openWeatherApi", () => ({ fetchWeather: vi.fn(), fetchForecast: vi.fn() }));
vi.mock("@/db/actions", () => ({ getSingleSavedTrip: vi.fn(), createTripInDB: vi.fn() }));
vi.mock("next/navigation", () => import("@/test/stubs/next"));
vi.mock("next/image", async () => ({
  default: (await import("@/test/stubs/next")).NextImage,
}));

beforeEach(() => {
  vi.mocked(getSingleSavedTrip).mockReset();
  vi.spyOn(console, "error").mockImplementation(() => {});
  vi.spyOn(console, "log").mockImplementation(() => {});
});

describe("TripResponse", () => {
  it("shows the loader while the trip is generating", () => {
    renderGeneratedTrip(<TripResponse />, { trip: { isPendingResponseAI: true } });

    expect(screen.getByRole("status", { name: "Loading" })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { level: 1 })).not.toBeInTheDocument();
  });

  it("shows the error panel when generation came back empty", () => {
    renderGeneratedTrip(<TripResponse />, { trip: { tripData: null } });

    expect(screen.getByText(states.generationFailed.message)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: states.generationFailed.button })).toHaveAttribute(
      "href",
      states.generationFailed.path,
    );
  });

  it("calls notFound when there is no trip at all", () => {
    expect(() =>
      renderGeneratedTrip(<TripResponse />, {
        trip: { tripData: undefined as unknown as null },
      }),
    ).toThrow("NEXT_NOT_FOUND");
    expect(notFound).toHaveBeenCalled();
  });

  it("renders the trip, the polaroid title and the save question", () => {
    renderGeneratedTrip(<TripResponse />);

    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(tripDataFixture.title!);
    expect(screen.getByRole("heading", { name: closing.save.question })).toBeInTheDocument();
    expect(screen.getByRole("main")).toBeInTheDocument();
    expect(screen.getByRole("contentinfo")).toBeInTheDocument();
  });
});

describe("SavedTripsPageComponent", () => {
  it("shows the loader while the trip loads", () => {
    // The query resolves on a later tick, so the first render is the pending one.
    renderSavedTrip(<SavedTripsPageComponent />);

    expect(screen.getByRole("status", { name: "Loading" })).toBeInTheDocument();
  });

  it("renders the saved trip with its polaroid title, a way back and the closing", async () => {
    renderSavedTrip(<SavedTripsPageComponent />);

    expect(await screen.findByRole("heading", { level: 1 })).toHaveTextContent(tripFixture.title!);
    expect(screen.getByRole("button", { name: "Go back" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: closing.final.heading })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: closing.save.question })).not.toBeInTheDocument();
  });
});
