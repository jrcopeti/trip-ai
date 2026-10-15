import { beforeEach, describe, expect, it, vi } from "vitest";
import { forecastListFixture, lisbonPlace, weatherFixture } from "@/test/fixtures";
import { fetchForecast, fetchWeather } from "./openWeatherApi";

const get = vi.fn();
const answer = (body: unknown, status = 200) =>
  get.mockResolvedValue(new Response(JSON.stringify(body), { status }));
const urlOf = (call: number) => new URL(get.mock.calls[call][0] as string);
const lisbon = { lat: lisbonPlace.lat, lon: lisbonPlace.lng };

beforeEach(() => {
  get.mockReset();
  vi.stubGlobal("fetch", get);
  vi.spyOn(console, "error").mockImplementation(() => {});
});

describe.each([
  { name: "fetchForecast", fetch: fetchForecast, path: "/data/2.5/forecast", body: { list: forecastListFixture, city: { timezone: 3600 } } },
  { name: "fetchWeather", fetch: fetchWeather, path: "/data/2.5/weather", body: weatherFixture },
])("$name", ({ fetch, path, body }) => {
  it("asks OpenWeather at the coordinates it is given, in one request", async () => {
    answer(body);

    await fetch(lisbon);

    expect(get).toHaveBeenCalledTimes(1);
    expect(urlOf(0).pathname).toBe(path);
    expect(urlOf(0).searchParams.get("lat")).toBe(String(lisbonPlace.lat));
    expect(urlOf(0).searchParams.get("lon")).toBe(String(lisbonPlace.lng));
  });

  it("keeps a reading for ten minutes", async () => {
    answer(body);

    await fetch(lisbon);

    expect(get.mock.calls[0][1]).toEqual({ next: { revalidate: 600 } });
  });

  it("returns OpenWeather's answer", async () => {
    answer(body);

    const result = await fetch(lisbon);

    expect(result).toEqual("list" in body ? body.list : body);
  });

  it("fails when OpenWeather answers with an error status", async () => {
    answer({ cod: 401, message: "Invalid API key" }, 401);

    await expect(fetch(lisbon)).rejects.toThrow();
  });

  // A server action is a public endpoint, and the coordinates go into the URL.
  it.each([
    { lat: 91, lon: 0 },
    { lat: 0, lon: -181 },
    { lat: Number.NaN, lon: 0 },
    { lat: "38.7&appid=x", lon: 0 },
  ])("refuses $lat, $lon without calling OpenWeather", async (coordinates) => {
    await expect(fetch(coordinates as unknown as typeof lisbon)).rejects.toThrow();
    expect(get).not.toHaveBeenCalled();
  });
});

describe("fetchForecast", () => {
  // The list's entries carry no offset; the response's `city` does, and the cards need it.
  it("gives every reading the destination's UTC offset", async () => {
    const { timezone: _, ...entry } = forecastListFixture[0];
    answer({ list: [entry, entry], city: { timezone: -10800 } });

    const days = await fetchForecast(lisbon);

    expect(days.map((day) => day.timezone)).toEqual([-10800, -10800]);
  });
});
