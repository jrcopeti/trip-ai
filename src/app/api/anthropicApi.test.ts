import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  generatedTripFixture,
  imageDataFixture,
  lisbonPlace,
  makeForecastEntry,
  tripCreateInput,
  tripDataFixture,
  validTripRequest,
} from "@/test/fixtures";
import { buildSystemPrompt, buildTripMessage } from "@/lib/agent/prompt";
import prisma from "@/db";
import { resolvePlace } from "./geoNamesApi";
import { fetchTripImage } from "./unsplashApi";
import { fetchForecast } from "./openWeatherApi";

const create = vi.fn();

vi.mock("@anthropic-ai/sdk", () => {
  class APIError extends Error {
    status = 500;
  }
  class Anthropic {
    static APIError = APIError;
    messages = { create };
  }
  return { default: Anthropic };
});
vi.mock("./geoNamesApi", () => ({ resolvePlace: vi.fn() }));
vi.mock("./unsplashApi", () => ({ fetchTripImage: vi.fn() }));
vi.mock("./openWeatherApi", () => ({ fetchForecast: vi.fn() }));
vi.mock("@/db", () => ({ default: { trip: { create: vi.fn() } } }));

const write = vi.mocked(prisma.trip.create);

const { generateTrip } = await import("./anthropicApi");

/** A response whose only block is a `submit_trip` call with `input`. */
function submits(input: unknown, stop_reason = "tool_use") {
  create.mockResolvedValue({
    stop_reason,
    stop_details: null,
    usage: {},
    content: [{ type: "tool_use", id: "toolu_1", name: "submit_trip", input }],
  });
}

function sent() {
  return create.mock.calls.at(-1)![0];
}

/** The row handed to Prisma. */
function written() {
  return write.mock.calls.at(-1)![0].data;
}

beforeEach(() => {
  vi.useFakeTimers({ toFake: ["Date"] });
  vi.setSystemTime(new Date(2030, 3, 1, 12, 0, 0));
  vi.spyOn(console, "error").mockImplementation(() => {});
  create.mockReset();
  vi.mocked(resolvePlace).mockResolvedValue({ ok: true, place: lisbonPlace });
  vi.mocked(fetchTripImage).mockReset();
  vi.mocked(fetchTripImage).mockResolvedValue(imageDataFixture);
  vi.mocked(fetchForecast).mockReset();
  write.mockReset();
  write.mockResolvedValue(generatedTripFixture as never);
  submits(tripDataFixture);
});

afterEach(() => {
  vi.useRealTimers();
});

describe("generateTrip — the request", () => {
  it("rejects a request that fails the schema, before any call", async () => {
    await expect(generateTrip({ ...validTripRequest, type: "anything goes" })).rejects.toThrow();
    await expect(generateTrip("plan me a trip")).rejects.toThrow();

    expect(resolvePlace).not.toHaveBeenCalled();
    expect(create).not.toHaveBeenCalled();
    expect(write).not.toHaveBeenCalled();
  });

  it("resolves the city again on the server, and stops when it can't", async () => {
    vi.mocked(resolvePlace).mockResolvedValue({ ok: false, error: "not-found" });

    await expect(generateTrip(validTripRequest)).rejects.toThrow();
    expect(resolvePlace).toHaveBeenCalledWith("Lisbon", "PT");
    expect(create).not.toHaveBeenCalled();
    expect(fetchTripImage).not.toHaveBeenCalled();
    expect(write).not.toHaveBeenCalled();
  });

  it("sends the cached system prompt and the trip message with the resolved place", async () => {
    vi.mocked(resolvePlace).mockResolvedValue({
      ok: true,
      place: { ...lisbonPlace, name: "Lisboa Canonical" },
    });
    await generateTrip(validTripRequest);

    expect(sent().model).toBe("claude-sonnet-5-5");
    expect(sent().system).toEqual([
      { type: "text", text: buildSystemPrompt(), cache_control: { type: "ephemeral" } },
    ]);
    const message = buildTripMessage(
      validTripRequest,
      { name: "Lisboa Canonical", country: "Portugal" },
      [],
    );
    expect(sent().messages).toEqual([{ role: "user", content: message }]);
    expect(message).toContain("Lisboa Canonical, Portugal");
  });

  it("offers submit_trip, strict, without forcing it", async () => {
    await generateTrip(validTripRequest);

    expect(sent().tool_choice).toEqual({ type: "auto" });
    expect(sent().tools).toHaveLength(1);
    expect(sent().tools[0]).toMatchObject({ name: "submit_trip", strict: true });
  });
});

describe("generateTrip — the row", () => {
  it("writes the trip unsaved, under a fresh 12-character url, and returns the row", async () => {
    await expect(generateTrip(validTripRequest)).resolves.toEqual(generatedTripFixture);

    const { tripUrl, ...row } = written();
    expect(tripUrl).toMatch(/^[0-9a-f]{12}$/);
    const { tripUrl: _, ...expected } = tripCreateInput(generatedTripFixture);
    expect(row).toEqual(expected);
  });

  it("searches the photos by GeoNames' name for the place, not the typed city", async () => {
    vi.mocked(resolvePlace).mockResolvedValue({
      ok: true,
      place: { ...lisbonPlace, name: "Lisboa Canonical" },
    });
    await generateTrip({ ...validTripRequest, city: "lisbon " });

    expect(fetchTripImage).toHaveBeenCalledWith("Lisboa Canonical");
  });

  it("still writes the trip, without photos, when the search fails", async () => {
    vi.mocked(fetchTripImage).mockRejectedValue(new Error("Error fetching image"));
    await generateTrip(validTripRequest);

    expect(written()).toMatchObject({ tripImages: [], placeholder: null });
  });

  it("keeps the traveller's items, whatever the model adds", async () => {
    submits({ ...tripDataFixture, requiredItems: ["a model's item"] });
    await generateTrip(validTripRequest);

    expect(written().requiredItems).toEqual(["camera", "walking shoes"]);
  });

  it("fails when the write fails", async () => {
    write.mockRejectedValue(new Error("connection refused"));
    await expect(generateTrip(validTripRequest)).rejects.toThrow("connection refused");
  });
});

describe("generateTrip — the forecast", () => {
  // Lisbon in May is UTC+1, so 11:00 UTC is its midday.
  const at = (utc: string, celsius: number) =>
    makeForecastEntry(0, {
      dt: Date.parse(utc) / 1000,
      timezone: 3600,
      main: { ...makeForecastEntry(0).main, temp: celsius + 273.15 },
    });
  const byWeather = {
    ...validTripRequest,
    byWeather: true,
    startDate: "2030-05-01",
    endDate: "2030-05-02",
  };

  it("fetches nothing when the traveller didn't ask for it", async () => {
    await generateTrip(validTripRequest);

    expect(fetchForecast).not.toHaveBeenCalled();
    expect(sent().messages[0].content).toContain("- None; plan for the usual weather");
    expect(written().byWeather).toBe(false);
  });

  it("fetches at the resolved place and keeps only the trip's days", async () => {
    vi.mocked(fetchForecast).mockResolvedValue([
      at("2030-05-01T11:00:00Z", 21),
      at("2030-05-02T11:00:00Z", 18),
      at("2030-05-03T11:00:00Z", 30),
    ]);
    await generateTrip(byWeather);

    expect(fetchForecast).toHaveBeenCalledWith({ lat: lisbonPlace.lat, lon: lisbonPlace.lng });
    const message = sent().messages[0].content;
    expect(message).toContain("- Wed 1 May: 21°C, Clouds (overcast clouds)");
    expect(message).toContain("- Thu 2 May: 18°C");
    expect(message).not.toContain("Fri 3 May");
    expect(written().byWeather).toBe(true);
  });

  it("plans for the usual weather, and says so on the row, when OpenWeather fails", async () => {
    vi.mocked(fetchForecast).mockRejectedValue(new Error("Error fetching forecast data"));
    await generateTrip(byWeather);

    expect(sent().messages[0].content).toContain("- None; plan for the usual weather");
    expect(written().byWeather).toBe(false);
  });

  it("isn't planned by the weather when no reading falls inside the trip", async () => {
    vi.mocked(fetchForecast).mockResolvedValue([at("2030-05-09T11:00:00Z", 21)]);
    await generateTrip(byWeather);

    expect(written().byWeather).toBe(false);
  });
});

describe("generateTrip — the answer", () => {
  it("fails on a refusal", async () => {
    submits(tripDataFixture, "refusal");
    await expect(generateTrip(validTripRequest)).rejects.toThrow(/declined/);
    expect(write).not.toHaveBeenCalled();
  });

  it("fails when cut off at max_tokens, even with a tool call", async () => {
    submits(tripDataFixture, "max_tokens");
    await expect(generateTrip(validTripRequest)).rejects.toThrow(/cut off/);
  });

  it("fails when the model answers without calling submit_trip", async () => {
    create.mockResolvedValue({
      stop_reason: "end_turn",
      stop_details: null,
      usage: {},
      content: [{ type: "text", text: "Here is your trip…" }],
    });
    await expect(generateTrip(validTripRequest)).rejects.toThrow(/did not return/);
  });

  it.each([
    ["four tours", { tours: (tripDataFixture.tours as unknown[]).slice(0, 4) }],
    ["a kind off the list", { tours: [{ title: "x", kind: "Spa", description: "y" }] }],
    ["too short a packing list", { objectsList: [] }],
  ])("fails on %s", async (_, change) => {
    submits({ ...tripDataFixture, ...change });
    await expect(generateTrip(validTripRequest)).rejects.toThrow(/invalid trip/);
  });

  it("fails when the API call itself fails", async () => {
    create.mockRejectedValue(new Error("network"));
    await expect(generateTrip(validTripRequest)).rejects.toThrow(/generating/);
  });
});
