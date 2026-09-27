import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  cn,
  displayDuration,
  durationInDays,
  findStartIndex,
  formatDate,
  placeWeatherIcons,
  selectDailyForecasts,
} from "@/lib/utils";
import { stubSrc } from "@/test/imageStub";
import { FIXTURE_NOW, makeForecastEntry } from "@/test/fixtures";

describe("cn", () => {
  it("merges conflicting tailwind classes, last one winning", () => {
    expect(cn("px-2", "px-5")).toBe("px-5");
  });

  it("drops falsy values", () => {
    expect(cn("rounded-full", false && "hidden", undefined)).toBe("rounded-full");
  });
});

describe("formatDate", () => {
  // dayjs formats in local time, so these are built from local components. A
  // UTC instant would render as the previous or next day west or east of here.
  const afternoon = new Date(2030, 4, 1, 14, 30, 0);

  it("returns an empty string for a missing date", () => {
    expect(formatDate(undefined)).toBe("");
    expect(formatDate("")).toBe("");
  });

  it("includes the time by default", () => {
    expect(formatDate(afternoon, true)).toBe("01 May 2030 02:30 PM");
  });

  it("omits the time when asked", () => {
    expect(formatDate(afternoon, false)).toBe("01 May 2030");
  });

  it("defaults to including the time", () => {
    expect(formatDate(afternoon)).toBe("01 May 2030 02:30 PM");
  });

  it("accepts an ISO string as well as a Date", () => {
    expect(formatDate("2030-05-01T14:30:00", false)).toBe("01 May 2030");
  });
});

describe("durationInDays", () => {
  it("counts whole days between two dates", () => {
    expect(durationInDays("2030-05-01", "2030-05-08")).toBe(7);
  });

  it("is 0 for a same-day trip", () => {
    expect(durationInDays("2030-05-01", "2030-05-01")).toBe(0);
  });

  it("rounds a partial day up", () => {
    expect(durationInDays("2030-05-01T00:00:00Z", "2030-05-02T06:00:00Z")).toBe(2);
  });
});

describe("displayDuration", () => {
  it("calls zero days a day trip", () => {
    expect(displayDuration(0)).toBe("Day Trip");
  });

  it("uses the singular for one day", () => {
    expect(displayDuration(1)).toBe("1 day");
  });

  it("uses the plural beyond one day", () => {
    expect(displayDuration(7)).toBe("7 days");
  });
});

describe("placeWeatherIcons", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  function atHour(hour: number) {
    vi.useFakeTimers();
    const d = new Date(2030, 4, 1, hour, 0, 0);
    vi.setSystemTime(d);
  }

  it("uses the sun for a clear day", () => {
    atHour(12);
    expect(placeWeatherIcons("Clear", "01d")).toBe(stubSrc("sun.png"));
  });

  it("uses the sun at the 5am and 7pm edges of daytime", () => {
    atHour(5);
    expect(placeWeatherIcons("Clear", "01d")).toBe(stubSrc("sun.png"));
    atHour(19);
    expect(placeWeatherIcons("Clear", "01d")).toBe(stubSrc("sun.png"));
  });

  it("uses the moon for a clear night on either side of that window", () => {
    atHour(4);
    expect(placeWeatherIcons("Clear", "01n")).toBe(stubSrc("moon.png"));
    atHour(20);
    expect(placeWeatherIcons("Clear", "01n")).toBe(stubSrc("moon.png"));
  });

  it.each([
    ["Thunderstorm", "bolt.png"],
    ["Drizzle", "drizzle.png"],
    ["Rain", "rain.png"],
    ["Snow", "snow.png"],
  ] as const)("maps %s to %s", (condition, asset) => {
    expect(placeWeatherIcons(condition, "10d")).toBe(stubSrc(asset));
  });

  it.each([
    "Mist",
    "Smoke",
    "Haze",
    "Dust",
    "Fog",
    "Sand",
    "Ash",
    "Squall",
    "Tornado",
  ])("maps the obscuring condition %s to hail.png", (condition) => {
    expect(placeWeatherIcons(condition, "50d")).toBe(stubSrc("hail.png"));
  });

  it.each([
    ["02d", "suncloudy.png"],
    ["03d", "suncloudy.png"],
    ["02n", "mooncloudy.png"],
    ["03n", "mooncloudy.png"],
    ["04d", "cloudy.png"],
    ["04n", "cloudy.png"],
  ] as const)("picks the cloud icon by code %s", (icon, asset) => {
    expect(placeWeatherIcons("Clouds", icon)).toBe(stubSrc(asset));
  });

  it("falls back to suncloudy for an unknown condition", () => {
    expect(placeWeatherIcons("Blizzard", "99x")).toBe(stubSrc("suncloudy.png"));
  });

  it("falls back to suncloudy for Clouds with an unrecognised code", () => {
    expect(placeWeatherIcons("Clouds", "01d")).toBe(stubSrc("suncloudy.png"));
  });
});

describe("findStartIndex", () => {
  const list = Array.from({ length: 40 }, (_, i) => makeForecastEntry(i));

  beforeEach(() => {
    vi.useFakeTimers();
    // Both the clock and the entries are local, so the index these helpers
    // return does not move with the runner's timezone.
    vi.setSystemTime(FIXTURE_NOW);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns the first entry after the chosen hour", () => {
    const index = findStartIndex(list, 7);
    // Entries are three hours apart from midnight, so 09:00 is the first past 07:00.
    expect(index).toBe(3);
    expect(list[index].dt_txt).toContain("09:00");
  });

  it("skips an entry sitting exactly on the chosen hour", () => {
    // The comparison is a strict isAfter, and entry 0 is at local midnight, so
    // hour 0 selects the 03:00 reading rather than the midnight one.
    expect(findStartIndex(list, 0)).toBe(1);
  });

  it("returns 0 when no entry is after the chosen hour", () => {
    expect(findStartIndex([makeForecastEntry(0)], 23)).toBe(0);
  });
});

describe("selectDailyForecasts", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(FIXTURE_NOW);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns an empty array when there is no data", () => {
    expect(
      selectDailyForecasts(undefined as unknown as ReturnType<typeof makeForecastEntry>[], 12),
    ).toEqual([]);
  });

  it("takes every eighth entry — one reading per day", () => {
    const list = Array.from({ length: 40 }, (_, i) => makeForecastEntry(i));
    const selected = selectDailyForecasts(list, 7);

    expect(selected).toHaveLength(5);
    expect(selected.map((f) => list.indexOf(f))).toEqual([3, 11, 19, 27, 35]);
  });

  it("starts from the chosen hour rather than the head of the list", () => {
    const list = Array.from({ length: 40 }, (_, i) => makeForecastEntry(i));
    const early = selectDailyForecasts(list, 0);
    const late = selectDailyForecasts(list, 20);

    expect(list.indexOf(early[0])).toBe(1);
    expect(list.indexOf(late[0])).toBe(7);
  });
});
