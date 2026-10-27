import type { ReactNode } from "react";
import type { Trip } from "@/generated/prisma/client";
import defaultImage3 from "@/assets/travel-photos/3.jpg";
import defaultImage6 from "@/assets/travel-photos/14.jpg";
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

/**
 * The sections both trip routes share, in the sorbet system. Grounds run
 * canvas (title) → white (description) → offwhite (tours) → canvas (photo) →
 * white (packing) → canvas (list) → white (essentials) → canvas (photo) →
 * offwhite (weather) → white (forecast) → canvas (details) → lime (the route's
 * closing section) → ink footer, never two alike in a row.
 *
 * Both routes read the row on the server and hand it down; only the weather
 * sections and the closing are client components, and they get only their fields.
 * The weather is fetched here too, at the row's coordinates, and streams in.
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

  return (
    <div className="bg-sorbet-canvas font-sorbet text-sorbet-ink antialiased">
      <main className="relative">
        {before}
        <TitleSection trip={trip} />
        <DescriptionSection trip={trip} />
        <ToursSection trip={trip} />
        <PhotoSection
          image={trip.tripImages[2]}
          fallback={defaultImage3}
          placeholder={trip.placeholder}
        />
        <PackReadySection trip={trip} />
        <ObjectsSection trip={trip} />
        <MustHaveSection trip={trip} />
        <PhotoSection
          image={trip.tripImages[5]}
          fallback={defaultImage6}
          placeholder={trip.placeholder}
        />
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
