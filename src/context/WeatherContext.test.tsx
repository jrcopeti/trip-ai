import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { renderWithProviders, waitFor } from "@/test/render";
import { WeatherProvider } from "@/context/WeatherContext";
import { useWeather } from "@/hooks/useWeather";
import { fetchForecast, fetchWeather } from "@/app/api/openWeatherApi";
import {
  FIXTURE_NOW,
  forecastListFixture,
  makeForecastEntry,
  weatherFixture,
} from "@/test/fixtures";
import { stubSrc } from "@/test/imageStub";
import type { WeatherApiResponse, WeatherContextType } from "@/types";

vi.mock("@/app/api/openWeatherApi", () => ({
  fetchForecast: vi.fn(),
  fetchWeather: vi.fn(),
}));

const mockForecast = vi.mocked(fetchForecast);
const mockWeather = vi.mocked(fetchWeather);

let ctx: WeatherContextType;

function Probe() {
  ctx = useWeather();
  return null;
}

function renderWeather() {
  return renderWithProviders(
    <WeatherProvider>
      <Probe />
    </WeatherProvider>,
  );
}

beforeEach(() => {
  vi.useFakeTimers({ shouldAdvanceTime: true });
  // placeWeatherIcons and selectDailyForecasts both read the clock; pin it to
  // midday on the fixture's day so the day/night branch and the start index
  // are the same on every machine.
  vi.setSystemTime(FIXTURE_NOW);
  mockForecast.mockReset();
  mockWeather.mockReset();
  vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  vi.useRealTimers();
});

describe("WeatherContext — forecast for the prompt", () => {
  it("starts empty", () => {
    renderWeather();
    expect(ctx.forecastData).toBeUndefined();
  });

  it("reduces the raw list to one reading per day", async () => {
    mockForecast.mockResolvedValue(forecastListFixture);
    renderWeather();

    ctx.generateForecast({ city: "lisbon", country: "Portugal" });

    await waitFor(() => {
      expect(ctx.forecastData).toHaveLength(5);
    });
  });

  it("converts Kelvin to whole degrees Celsius", async () => {
    mockForecast.mockResolvedValue([
      makeForecastEntry(4, { main: { ...weatherFixture.main, temp: 300.15 } }),
    ]);
    renderWeather();

    ctx.generateForecast({ city: "lisbon", country: "Portugal" });

    await waitFor(() => {
      expect(ctx.forecastData?.[0].formattedTemp).toBe("27°C");
    });
  });

  it("keeps only the four fields the prompt needs", async () => {
    mockForecast.mockResolvedValue([makeForecastEntry(4)]);
    renderWeather();

    ctx.generateForecast({ city: "lisbon", country: "Portugal" });

    await waitFor(() => {
      expect(ctx.forecastData?.[0]).toBeDefined();
    });
    expect(Object.keys(ctx.forecastData![0]).sort()).toEqual([
      "condition",
      "description",
      "dt_txt",
      "formattedTemp",
    ]);
  });

  it("passes the city and country through", async () => {
    mockForecast.mockResolvedValue(forecastListFixture);
    renderWeather();

    ctx.generateForecast({ city: "lisbon", country: "Portugal" });

    await waitFor(() => {
      expect(mockForecast).toHaveBeenCalledWith({
        city: "lisbon",
        country: "Portugal",
      });
    });
  });

  it("surfaces the error and leaves forecastData undefined on failure", async () => {
    mockForecast.mockRejectedValue(new Error("Error fetching forecast data"));
    renderWeather();

    ctx.generateForecast({ city: "nowhere", country: "Nowhere" });

    await waitFor(() => {
      expect(ctx.errorForecast).toBeInstanceOf(Error);
    });
    expect(ctx.forecastData).toBeUndefined();
  });
});

describe("WeatherContext — current weather", () => {
  it("attaches the icon matching the condition", async () => {
    mockWeather.mockResolvedValue(weatherFixture);
    renderWeather();

    ctx.generateWeather({ city: "lisbon", country: "Portugal" });

    await waitFor(() => {
      expect(ctx.weatherData).toBeDefined();
    });
    // The fixture is Clear at midday, so the sun.
    expect(ctx.weatherData?.weatherIconSrc).toBe(stubSrc("sun.png"));
  });

  it("keeps the rest of the API payload alongside the icon", async () => {
    mockWeather.mockResolvedValue(weatherFixture);
    renderWeather();

    ctx.generateWeather({ city: "lisbon", country: "Portugal" });

    await waitFor(() => {
      expect(ctx.weatherData?.main?.temp).toBe(295.15);
    });
    expect(ctx.weatherData?.wind?.speed).toBe(4.1);
  });

  it("picks the cloud icon for a cloudy response", async () => {
    mockWeather.mockResolvedValue({
      ...weatherFixture,
      weather: [{ main: "Clouds", icon: "04d", description: "overcast clouds" }],
    } as WeatherApiResponse);
    renderWeather();

    ctx.generateWeather({ city: "lisbon", country: "Portugal" });

    await waitFor(() => {
      expect(ctx.weatherData?.weatherIconSrc).toBe(stubSrc("cloudy.png"));
    });
  });

  it("surfaces the error on failure", async () => {
    mockWeather.mockRejectedValue(new Error("Error fetching weather data"));
    renderWeather();

    ctx.generateWeather({ city: "nowhere", country: "Nowhere" });

    await waitFor(() => {
      expect(ctx.errorWeather).toBeInstanceOf(Error);
    });
    expect(ctx.weatherData).toBeUndefined();
  });
});

describe("WeatherContext — five-day forecast", () => {
  it("starts as an empty list", () => {
    renderWeather();
    expect(ctx.dailyForecastData).toEqual([]);
  });

  it("returns one entry per day, each carrying its own icon", async () => {
    mockForecast.mockResolvedValue(forecastListFixture);
    renderWeather();

    ctx.generateDailyForecast({ city: "lisbon", country: "Portugal" });

    await waitFor(() => {
      expect(ctx.dailyForecastData).toHaveLength(5);
    });
    ctx.dailyForecastData?.forEach((day) => {
      expect(day.dailyForecastIconSrc).toBe(stubSrc("cloudy.png"));
    });
  });

  it("keeps the raw fields the cards render", async () => {
    mockForecast.mockResolvedValue(forecastListFixture);
    renderWeather();

    ctx.generateDailyForecast({ city: "lisbon", country: "Portugal" });

    await waitFor(() => {
      expect(ctx.dailyForecastData?.[0]).toBeDefined();
    });
    const first = ctx.dailyForecastData![0];
    expect(first.dt_txt).toBeTypeOf("string");
    expect(first.main.temp).toBeTypeOf("number");
  });

  it("surfaces the error and leaves the list empty on failure", async () => {
    mockForecast.mockRejectedValue(new Error("Error fetching forecast data"));
    renderWeather();

    ctx.generateDailyForecast({ city: "nowhere", country: "Nowhere" });

    await waitFor(() => {
      expect(ctx.errorDailyForecast).toBeInstanceOf(Error);
    });
    expect(ctx.dailyForecastData).toEqual([]);
  });

  it("is driven independently of the prompt forecast", async () => {
    mockForecast.mockResolvedValue(forecastListFixture);
    renderWeather();

    ctx.generateDailyForecast({ city: "lisbon", country: "Portugal" });

    await waitFor(() => {
      expect(ctx.dailyForecastData).toHaveLength(5);
    });
    // Same endpoint, separate mutation: the prompt-facing state stays untouched.
    expect(ctx.forecastData).toBeUndefined();
  });
});
