import type { Metadata } from "next";

import BuddyFooter from "@/components/landing-v2/BuddyFooter";
import BuddyNav from "@/components/landing-v2/BuddyNav";
import ClosingCta from "@/components/landing-v2/ClosingCta";
import Hero from "@/components/landing-v2/Hero";
import HowItWorks from "@/components/landing-v2/HowItWorks";
import MotionProvider from "@/components/landing-v2/MotionProvider";
import PhotoBand from "@/components/landing-v2/PhotoBand";
import TripTypePills from "@/components/landing-v2/TripTypePills";
import WeatherPacking from "@/components/landing-v2/WeatherPacking";
import WordmarkBlock from "@/components/landing-v2/WordmarkBlock";

export const metadata: Metadata = {
  title: "Trip AI — landing v2",
  description: "The travel guide powered by AI",
};

/**
 * Landing page experiment in the "Buddy" visual system.
 * Deliberately does not use Container/GridContainer/GradientBg — those lock the
 * page to a single non-scrolling viewport.
 */
function LandingV2() {
  return (
    <MotionProvider>
      <div className="min-h-dvh bg-buddy-canvas font-buddy text-buddy-ink antialiased">
        <BuddyNav />
        <main>
          <Hero />
          <WordmarkBlock />
          <TripTypePills />
          <PhotoBand />
          <HowItWorks />
          <WeatherPacking />
          <ClosingCta />
        </main>
        <BuddyFooter />
      </div>
    </MotionProvider>
  );
}

export default LandingV2;
