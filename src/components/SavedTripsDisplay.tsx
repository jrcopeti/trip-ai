"use client";
import { useSavedTrips } from "@/hooks/useSavedTrips";
import SavedTripCard from "./ui/SavedTripCard";
import { savedTripDataCards } from "@/data";
import { useEffect, useLayoutEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

function SavedTripsDisplay() {
  const { savedTrips, isPendingSavedTrips, savedTripsError } = useSavedTrips();

  // useEffect(() => {
  //   (async () => {
  //     const LocomotiveScroll = (await import("locomotive-scroll" as any))
  //       .default;
  //     const locomotiveScroll = new LocomotiveScroll({
  //       lenisOptions: {
  //         lerp: 0.15,
  //       },
  //     });
  //   })();
  // }, []);

  const useIsomorphicLayoutEffect =
    typeof window !== "undefined" ? useLayoutEffect : useEffect;

  useIsomorphicLayoutEffect(() => {
    if (!isPendingSavedTrips) {
      gsap.registerPlugin(ScrollTrigger);
      const context = gsap.context(() => {
        ScrollTrigger.batch(".saved-trip-card", {
          start: "top bottom",
          end: "center center",
          interval: 0.8,
          batchMax: 3,

          onEnter: (elements) => {
            gsap.from(elements, {
              autoAlpha: 1,
              y: 100,
              // stagger: 0.2,
              ease: "power2.inOut",
              duration: 1.2,
            });
          },
        });
      });
      return () => context.revert();
    }
  }, [isPendingSavedTrips]);

  if (isPendingSavedTrips) {
    return <div>Loading saved trips...</div>;
  }
  return (
    <div className="flex flex-col items-center gap-10 py-2 lg:px-16 lg:py-4 ">
      <h1 className="text-5xl font-bold text-tuna-900">Saved Trips</h1>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 2xl:gap-8">
        {savedTripDataCards?.map((trip) => (
          <SavedTripCard key={trip.id} trip={trip} />
        ))}
      </div>
    </div>
  );
}

export default SavedTripsDisplay;
