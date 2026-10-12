import { connection } from "next/server";

import ClosingCta from "@/components/landing/ClosingCta";
import Hero from "@/components/landing/Hero";
import HowItWorks from "@/components/landing/HowItWorks";
import Intro from "@/components/landing/Intro";
import { IntroProvider } from "@/components/landing/IntroContext";
import loadLatestTrips from "@/components/landing/loadLatestTrips";
import PhotoBand from "@/components/landing/PhotoBand";
import TripTypePills from "@/components/landing/TripTypePills";
import WeatherPacking from "@/components/landing/WeatherPacking";
import WordmarkBlock from "@/components/landing/WordmarkBlock";
import SiteFooter from "@/components/ui/SiteFooter";
import pickTravelPhoto from "@/lib/pickTravelPhoto";

/**
 * Landing page, in the redesigned visual system.
 *
 * The nav and `MotionProvider` both come from the shared shell now (the root
 * layout and `providers.tsx`), which is why neither appears here. `Intro` still
 * finds the nav wordmark it measures through `[data-wordmark]`.
 */
async function Homepage() {
  // Per-request rendering, as `/about` does: otherwise the band's "random" photo
  // is picked once at build time and every visitor gets the same one, and the
  // hero's latest trips are whatever was saved when the site was built.
  await connection();
  const latestTrips = await loadLatestTrips();

  return (
    <IntroProvider>
      <div className="min-h-dvh bg-sorbet-canvas font-sorbet text-sorbet-ink antialiased">
        <Intro />
        <main>
          <Hero trips={latestTrips} />
          <WordmarkBlock />
          <TripTypePills />
          <PhotoBand photo={pickTravelPhoto()} />
          <HowItWorks />
          <WeatherPacking />
          <ClosingCta />
        </main>
        <SiteFooter />
      </div>
    </IntroProvider>
  );
}

export default Homepage;
