import type {
  DailyForecastDataTypes,
  WeatherApiResponse,
} from "@/types";

/** OpenWeather `/weather` — temperatures are Kelvin, as the API returns them. */
export const weatherFixture: WeatherApiResponse = {
  main: {
    temp: 295.15,
    feels_like: 294.8,
    temp_min: 293.15,
    temp_max: 297.15,
    humidity: 62,
  },
  weather: [{ main: "Clear", icon: "01d", description: "clear sky" }],
  sys: { sunrise: 1_714_539_600, sunset: 1_714_590_000 },
  wind: { speed: 4.1 },
  timezone: 3600,
};

/** The day the forecast fixture covers. Pair it with `FIXTURE_NOW` in tests. */
export const FIXTURE_DAY = { year: 2030, month: 4, day: 1 } as const;

/**
 * Midday on the fixture's day, in the *local* zone.
 *
 * `findStartIndex` compares against `dayjs().startOf("day")`, which is local. If
 * the clock or the entries were pinned to a UTC instant instead, the index the
 * helpers return would shift with the runner's timezone — passing here and
 * failing in CI, which runs UTC. Both sides are local, so neither moves.
 */
export const FIXTURE_NOW = new Date(
  FIXTURE_DAY.year,
  FIXTURE_DAY.month,
  FIXTURE_DAY.day,
  12,
  0,
  0,
);

function pad(n: number) {
  return String(n).padStart(2, "0");
}

/**
 * OpenWeather `/forecast` list entries, three hours apart, starting at local
 * midnight on `FIXTURE_DAY`: entry `i` is `i * 3` hours in.
 */
export function makeForecastEntry(
  index: number,
  overrides: Partial<DailyForecastDataTypes> = {},
): DailyForecastDataTypes {
  const at = new Date(
    FIXTURE_DAY.year,
    FIXTURE_DAY.month,
    FIXTURE_DAY.day,
    index * 3,
    0,
    0,
  );
  const dt = Math.floor(at.getTime() / 1000);
  const dt_txt =
    `${at.getFullYear()}-${pad(at.getMonth() + 1)}-${pad(at.getDate())} ` +
    `${pad(at.getHours())}:${pad(at.getMinutes())}:${pad(at.getSeconds())}`;

  return {
    ...weatherFixture,
    main: { ...weatherFixture.main, temp: 290.15 + index },
    weather: [{ main: "Clouds", icon: "04d", description: "overcast clouds" }],
    dt,
    dt_txt,
    ...overrides,
  };
}

/** Forty entries — five days at eight readings a day, the real response length. */
export const forecastListFixture: DailyForecastDataTypes[] = Array.from(
  { length: 40 },
  (_, i) => makeForecastEntry(i),
);
