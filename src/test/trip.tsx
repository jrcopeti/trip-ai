import { useContext, type ReactElement, type ReactNode } from "react";
import { WeatherContext } from "@/context/WeatherContext";
import { renderWithProviders } from "@/test/render";
import type { WeatherContextType } from "@/types";

/**
 * Rendering helper for the trip sections. They take the row as a prop; only the
 * weather sections still read a context, until grounded-agent 2d.
 *
 * Importing WeatherContext pulls in the weather API module, so test files mock it:
 *
 *   vi.mock("@/app/api/openWeatherApi", () => ({ fetchWeather: vi.fn(), fetchForecast: vi.fn() }));
 *   vi.mock("next/image", async () => ({ default: (await import("@/test/stubs/next")).NextImage }));
 */
function WeatherOverride({
  weather,
  children,
}: {
  weather?: Partial<WeatherContextType>;
  children: ReactNode;
}) {
  const ctx = useContext(WeatherContext);
  return <WeatherContext.Provider value={{ ...ctx, ...weather }}>{children}</WeatherContext.Provider>;
}

/** Renders a section, overriding only the weather context fields a test names. */
export function renderTripSection(
  ui: ReactElement,
  { weather }: { weather?: Partial<WeatherContextType> } = {},
) {
  return renderWithProviders(<WeatherOverride weather={weather}>{ui}</WeatherOverride>);
}
