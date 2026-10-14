import { useContext, type ReactElement, type ReactNode } from "react";
import { vi } from "vitest";
import { TripContext } from "@/context/TripContext";
import { FormContext } from "@/context/FormContext";
import { WeatherContext } from "@/context/WeatherContext";
import { getSingleSavedTrip } from "@/db/actions";
import { renderWithProviders } from "@/test/render";
import { resetNextStubs } from "@/test/stubs/next";
import { finalFormData, generatedTripFixture, tripFixture } from "@/test/fixtures";
import type {
  FormContextType,
  TripContextType,
  WeatherContextType,
} from "@/types";
import type { Trip } from "@prisma/client";

/**
 * Rendering helpers for the trip sections, which read their data from wherever
 * the route keeps it: the contexts on `/trips/[tripUrl]`, a `Trip` row from
 * `getSingleSavedTrip` on `/saved-trips/[id]`.
 *
 * Test files using these must mock the boundaries themselves — `vi.mock` only
 * applies to the file that calls it. Importing the contexts pulls in the two
 * API modules, so those are mocked too:
 *
 *   vi.mock("@/app/api/anthropicApi", () => ({ generateTrip: vi.fn() }));
 *   vi.mock("@/app/api/openWeatherApi", () => ({ fetchWeather: vi.fn(), fetchForecast: vi.fn() }));
 *   vi.mock("@/db/actions", () => ({ getSingleSavedTrip: vi.fn(), setTripSaved: vi.fn() }));
 *   vi.mock("next/navigation", () => import("@/test/stubs/next"));
 *   vi.mock("next/image", async () => ({ default: (await import("@/test/stubs/next")).NextImage }));
 */

type Contexts = {
  trip?: Partial<TripContextType>;
  form?: Partial<FormContextType>;
  weather?: Partial<WeatherContextType>;
};

/**
 * Overrides each context on top of its own default value, read from the
 * context itself, so a test names only the fields it cares about.
 */
function ContextOverrides({ trip, form, weather, children }: Contexts & { children: ReactNode }) {
  const tripCtx = useContext(TripContext);
  const formCtx = useContext(FormContext);
  const weatherCtx = useContext(WeatherContext);

  return (
    <TripContext.Provider value={{ ...tripCtx, ...trip }}>
      <FormContext.Provider value={{ ...formCtx, ...form }}>
        <WeatherContext.Provider value={{ ...weatherCtx, ...weather }}>
          {children}
        </WeatherContext.Provider>
      </FormContext.Provider>
    </TripContext.Provider>
  );
}

/**
 * `/trips/[tripUrl]`: the row `generateTrip` wrote and the form data in context,
 * no `id` param. Each context can be overridden further.
 */
export function renderGeneratedTrip(ui: ReactElement, contexts: Contexts = {}) {
  const { tripUrl } = generatedTripFixture;
  resetNextStubs(`/trips/${tripUrl}`, { tripUrl });

  return renderWithProviders(
    <ContextOverrides
      trip={{ tripData: generatedTripFixture, ...contexts.trip }}
      form={{ formData: finalFormData, ...contexts.form }}
      weather={contexts.weather}
    >
      {ui}
    </ContextOverrides>,
  );
}

/**
 * `/saved-trips/[id]`: the row (`row`, the fixture by default) comes back from
 * the mocked `getSingleSavedTrip`, so the section renders empty first and fills
 * in once the query resolves — assert with `findBy*`. Contexts stay at their
 * defaults unless overridden.
 */
export function renderSavedTrip(
  ui: ReactElement,
  { row = tripFixture, ...contexts }: Contexts & { row?: Trip | null } = {},
) {
  const id = String(row?.id ?? 1);
  resetNextStubs(`/saved-trips/${id}`, { id });
  vi.mocked(getSingleSavedTrip).mockResolvedValue(row);

  return renderWithProviders(<ContextOverrides {...contexts}>{ui}</ContextOverrides>);
}
