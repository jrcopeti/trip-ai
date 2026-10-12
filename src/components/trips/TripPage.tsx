import type { ReactNode } from "react";
import SiteFooter from "../ui/SiteFooter";
import TitleSection from "./TitleSection";
import DescriptionSection from "./DescriptionSection";
import ToursSection from "./ToursSection";
import PackReadySection from "./PackReadySection";
import ObjectsSection from "./ObjectsSection";
import MustHaveSection from "./MustHaveSection";
import WeatherSection from "./WeatherSection";
import ForecastSection from "./ForecastSection";
import FormDetailsSection from "./FormDetailsSection";

/**
 * The sections both trip routes share, in the sorbet system. Grounds run
 * canvas → white → offwhite → white → canvas → white → offwhite → white →
 * canvas → lime (the route's closing section) → ink footer, never repeating.
 */
function TripPage({ before, closing }: { before?: ReactNode; closing: ReactNode }) {
  return (
    <div className="bg-sorbet-canvas font-sorbet text-sorbet-ink antialiased">
      <main className="relative">
        {before}
        <TitleSection />
        <DescriptionSection />
        <ToursSection />
        <PackReadySection />
        <ObjectsSection />
        <MustHaveSection />
        <WeatherSection />
        <ForecastSection />
        <FormDetailsSection />
        {closing}
      </main>
      <SiteFooter />
    </div>
  );
}

export default TripPage;
