import type { ReactNode } from "react";
import type { Trip } from "@/generated/prisma/client";
import SiteFooter from "../ui/SiteFooter";
import TitleSection from "./TitleSection";
import DescriptionSection from "./DescriptionSection";
import ToursSection from "./ToursSection";
import PhotoSection from "./PhotoSection";
import PackReadySection from "./PackReadySection";
import ObjectsSection from "./ObjectsSection";
import MustHaveSection from "./MustHaveSection";
import WeatherSection from "./WeatherSection";
import ForecastSection from "./ForecastSection";
import FormDetailsSection from "./FormDetailsSection";
import loadWeather from "./loadWeather";
import { defaultPlaceholder } from "@/lib/constants";
import { tripPhoto } from "./tripPhoto";

/**
 * The sections both trip routes share, grounds alternating as `design-notes.md` lists.
 * Only the weather sections and the closing are client components, given only their
 * fields; the weather is fetched here, at the row's coordinates, and streams in.
 */
function TripPage({
  trip,
  before,
  closing,
}: {
  trip: Trip;
  before?: ReactNode;
  closing: ReactNode;
}) {
  const { weather, forecast } = loadWeather(trip);
  const sixth = trip.tripImages[5];

  return (
    <div className="bg-sorbet-canvas font-sorbet text-sorbet-ink antialiased">
      <main className="relative">
        {before}
        <TitleSection trip={trip} />
        <DescriptionSection trip={trip} />
        <ToursSection trip={trip} />
        <PhotoSection photo={tripPhoto(trip, "afterTours")} />
        <PackReadySection trip={trip} />
        <ObjectsSection trip={trip} />
        <MustHaveSection trip={trip} />
        {sixth && (
          <PhotoSection
            photo={{ src: sixth, blurDataURL: trip.placeholder ?? defaultPlaceholder }}
          />
        )}
        <WeatherSection city={trip.city} country={trip.country} weather={weather} />
        <ForecastSection forecast={forecast} />
        <FormDetailsSection trip={trip} />
        {closing}
      </main>
      <SiteFooter />
    </div>
  );
}

export default TripPage;
