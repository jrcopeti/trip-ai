import { useContext, type ReactElement, type ReactNode } from "react";
import { vi } from "vitest";
import { TripContext } from "@/context/TripContext";
import { FormContext } from "@/context/FormContext";
import { ImageContext } from "@/context/ImageContext";
import { WeatherContext } from "@/context/WeatherContext";
import { getSingleSavedTrip } from "@/db/actions";
import { renderWithProviders } from "@/test/render";
import { resetNextStubs } from "@/test/stubs/next";
import { finalFormData, imageDataFixture, tripDataFixture, tripFixture } from "@/test/fixtures";
import type {
  FormContextType,
  ImageContextType,
  TripContextType,
  WeatherContextType,
} from "@/types";
import type { Trip } from "@prisma/client";

/**
 * Rendering helpers for the trip sections, which read their data from wherever
 * the route keeps it: the four contexts on `/trips/[tripUrl]`, a `Trip` row from
 * `getSingleSavedTrip` on `/saved-trips/[id]`.
 *
 * Test files using these must mock the boundaries themselves — `vi.mock` only
 * applies to the file that calls it. Importing the contexts pulls in the three
 * API modules, so those are mocked too:
 *
 *   vi.mock("@/app/api/anthropicApi", () => ({ fetchResponseAI: vi.fn() }));
 *   vi.mock("@/app/api/unsplashApi", () => ({ fetchTripImage: vi.fn() }));
 *   vi.mock("@/app/api/openWeatherApi", () => ({ fetchWeather: vi.fn(), fetchForecast: vi.fn() }));
 *   vi.mock("@/db/actions", () => ({ getSingleSavedTrip: vi.fn(), createTripInDB: vi.fn() }));
 *   vi.mock("next/navigation", () => import("@/test/stubs/next"));
 *   vi.mock("next/image", async () => ({ default: (await import("@/test/stubs/next")).NextImage }));
 */

type Contexts = {
  trip?: Partial<TripContextType>;
  form?: Partial<FormContextType>;
  image?: Partial<ImageContextType>;
  weather?: Partial<WeatherContextType>;
};

/**
 * Overrides each context on top of its own default value, read from the
 * context itself, so a test names only the fields it cares about.
 */
function ContextOverrides({ trip, form, image, weather, children }: Contexts & { children: ReactNode }) {
  const tripCtx = useContext(TripContext);
  const formCtx = useContext(FormContext);
  const imageCtx = useContext(ImageContext);
  const weatherCtx = useContext(WeatherContext);

  return (
    <TripContext.Provider value={{ ...tripCtx, ...trip }}>
      <FormContext.Provider value={{ ...formCtx, ...form }}>
        <ImageContext.Provider value={{ ...imageCtx, ...image }}>
          <WeatherContext.Provider value={{ ...weatherCtx, ...weather }}>
            {children}
          </WeatherContext.Provider>
        </ImageContext.Provider>
      </FormContext.Provider>
    </TripContext.Provider>
  );
}

/**
 * `/trips/[tripUrl]`: the AI's response, the form data and the Unsplash images
 * in context, no `id` param. Each context can be overridden further.
 */
export function renderGeneratedTrip(ui: ReactElement, contexts: Contexts = {}) {
  resetNextStubs("/trips/ab12c", { tripUrl: "ab12c" });

  return renderWithProviders(
    <ContextOverrides
      trip={{ tripData: tripDataFixture, ...contexts.trip }}
      form={{ formData: finalFormData, ...contexts.form }}
      image={{ imageData: imageDataFixture, ...contexts.image }}
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
