import { Suspense } from "react";
import { cookies } from "next/headers";
import { connection } from "next/server";

import ClosingCta from "@/components/landing/ClosingCta";
import Hero from "@/components/landing/Hero";
import HowItWorks from "@/components/landing/HowItWorks";
import Intro from "@/components/landing/Intro";
import { IntroProvider } from "@/components/landing/IntroContext";
import { INTRO_COOKIE, hasSeenIntro } from "@/components/landing/introCookie";
import LatestTripsDeck, { HeroDeckFallback } from "@/components/landing/LatestTripsDeck";
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
  // A browser that has seen the intro gets a page without it, decided here so
  // the curtain is never in the HTML at all rather than removed after hydration.
  const introSeen = hasSeenIntro((await cookies()).get(INTRO_COOKIE)?.value);

  return (
    <IntroProvider skip={introSeen}>
      <div className="min-h-dvh bg-sorbet-canvas font-sorbet text-sorbet-ink antialiased">
        {!introSeen && <Intro />}
        <main>
          {/* The deck streams in on its own, so the page is sent without waiting
              on the database. */}
          <Hero
            deck={
              <Suspense fallback={<HeroDeckFallback />}>
                <LatestTripsDeck />
              </Suspense>
            }
          />
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
