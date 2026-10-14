import { beforeEach, describe, expect, it, vi } from "vitest";
import { forecastListFixture, lisbonPlace, weatherFixture } from "@/test/fixtures";
import { resolvePlace } from "./geoNamesApi";
import { fetchForecast, fetchWeather } from "./openWeatherApi";

vi.mock("./geoNamesApi", () => ({ resolvePlace: vi.fn() }));

const get = vi.fn();
const answer = (body: unknown, status = 200) =>
  get.mockResolvedValue(new Response(JSON.stringify(body), { status }));
const urlOf = (call: number) => new URL(get.mock.calls[call][0] as string);

beforeEach(() => {
  get.mockReset();
  vi.stubGlobal("fetch", get);
  vi.mocked(resolvePlace).mockReset();
  vi.spyOn(console, "error").mockImplementation(() => {});
});

describe.each([
  { name: "fetchForecast", fetch: fetchForecast, path: "/data/2.5/forecast", body: { list: forecastListFixture } },
  { name: "fetchWeather", fetch: fetchWeather, path: "/data/2.5/weather", body: weatherFixture },
])("$name", ({ fetch, path, body }) => {
  it("asks OpenWeather at the coordinates GeoNames resolved, with no geocoding of its own", async () => {
    vi.mocked(resolvePlace).mockResolvedValue({ ok: true, place: lisbonPlace });
    answer(body);

    await fetch({ city: "Lisboa", countryCode: "PT" });

    expect(resolvePlace).toHaveBeenCalledWith("Lisboa", "PT");
    expect(get).toHaveBeenCalledTimes(1);
    expect(urlOf(0).pathname).toBe(path);
    expect(urlOf(0).searchParams.get("lat")).toBe(String(lisbonPlace.lat));
    expect(urlOf(0).searchParams.get("lon")).toBe(String(lisbonPlace.lng));
  });

  it("returns OpenWeather's answer", async () => {
    vi.mocked(resolvePlace).mockResolvedValue({ ok: true, place: lisbonPlace });
    answer(body);

    const result = await fetch({ city: "Lisboa", countryCode: "PT" });

    expect(result).toEqual("list" in body ? body.list : body);
  });

  it("fails when OpenWeather answers with an error status", async () => {
    vi.mocked(resolvePlace).mockResolvedValue({ ok: true, place: lisbonPlace });
    answer({ cod: 401, message: "Invalid API key" }, 401);

    await expect(fetch({ city: "Lisboa", countryCode: "PT" })).rejects.toThrow();
  });

  it.each(["not-found", "unavailable"] as const)(
    "fails without calling OpenWeather when the place is %s",
    async (error) => {
      vi.mocked(resolvePlace).mockResolvedValue({ ok: false, error });

      await expect(fetch({ city: "Atlantis", countryCode: "PT" })).rejects.toThrow();
      expect(get).not.toHaveBeenCalled();
    },
  );
});
