import LandingFooter from "@/components/landing/LandingFooter";
import LandingNav from "@/components/landing/LandingNav";
import ClosingCta from "@/components/landing/ClosingCta";
import Hero from "@/components/landing/Hero";
import HowItWorks from "@/components/landing/HowItWorks";
import MotionProvider from "@/components/landing/MotionProvider";
import PhotoBand from "@/components/landing/PhotoBand";
import TripTypePills from "@/components/landing/TripTypePills";
import WeatherPacking from "@/components/landing/WeatherPacking";
import WordmarkBlock from "@/components/landing/WordmarkBlock";

/**
 * Landing page, in the redesigned visual system.
 *
 * Deliberately does not use Container/GridContainer/GradientBg — those lock the
 * page to a single non-scrolling viewport.
 */
function Homepage() {
  return (
    <MotionProvider>
      <div className="min-h-dvh bg-sorbet-canvas font-sorbet text-sorbet-ink antialiased">
        <LandingNav />
        <main>
          <Hero />
          <WordmarkBlock />
          <TripTypePills />
          <PhotoBand />
          <HowItWorks />
          <WeatherPacking />
          <ClosingCta />
        </main>
        <LandingFooter />
      </div>
    </MotionProvider>
  );
}

export default Homepage;
