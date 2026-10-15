import { describe, expect, it } from "vitest";
import { tripForecast } from "@/lib/agent/forecast";
import { makeForecastEntry } from "@/test/fixtures";

const HOUR = 3600;

/** A reading at a UTC instant, at a place `offset` hours from UTC. */
const at = (utc: string, offset: number, description = utc) =>
  makeForecastEntry(0, {
    dt: Date.parse(utc) / 1000,
    timezone: offset * HOUR,
    weather: [{ main: "Clouds", icon: "04d", description }],
  });

const picked = (readings: ReturnType<typeof at>[], start: string, end: string) =>
  tripForecast(readings, start, end).map(({ date, description }) => [date, description]);

describe("tripForecast", () => {
  it("takes the reading nearest midday in the destination's time, not UTC's", () => {
    // Tokyo, UTC+9: 03:00 UTC is its midday, 12:00 UTC its evening.
    const tokyo = [at("2030-05-01T00:00:00Z", 9), at("2030-05-01T03:00:00Z", 9), at("2030-05-01T12:00:00Z", 9)];
    expect(picked(tokyo, "2030-05-01", "2030-05-01")).toEqual([
      ["2030-05-01", "2030-05-01T03:00:00Z"],
    ]);
  });

  it("names the day where the reading is, even when UTC is already on the next", () => {
    // Honolulu, UTC−10: both are 1 May there, at 11:00 and 14:00.
    const honolulu = [at("2030-05-01T21:00:00Z", -10), at("2030-05-02T00:00:00Z", -10)];
    expect(picked(honolulu, "2030-05-01", "2030-05-02")).toEqual([
      ["2030-05-01", "2030-05-01T21:00:00Z"],
    ]);
  });

  it("keeps only the trip's days, one each, in order", () => {
    const lisbon = [
      at("2030-05-03T11:00:00Z", 1),
      at("2030-04-30T11:00:00Z", 1),
      at("2030-05-01T11:00:00Z", 1),
      at("2030-05-02T11:00:00Z", 1),
      at("2030-05-02T14:00:00Z", 1),
    ];
    expect(picked(lisbon, "2030-05-01", "2030-05-02")).toEqual([
      ["2030-05-01", "2030-05-01T11:00:00Z"],
      ["2030-05-02", "2030-05-02T11:00:00Z"],
    ]);
  });

  it("writes the temperature in Celsius, with OpenWeather's condition", () => {
    const reading = { ...at("2030-05-01T11:00:00Z", 1, "light rain"), main: { ...makeForecastEntry(0).main, temp: 294.4 } };
    reading.weather = [{ main: "Rain", icon: "10d", description: "light rain" }];
    expect(tripForecast([reading], "2030-05-01", "2030-05-01")).toEqual([
      { date: "2030-05-01", temp: "21°C", condition: "Rain", description: "light rain" },
    ]);
  });

  it("is empty when no reading falls inside the trip", () => {
    expect(tripForecast([at("2030-06-01T11:00:00Z", 1)], "2030-05-01", "2030-05-05")).toEqual([]);
  });
});
