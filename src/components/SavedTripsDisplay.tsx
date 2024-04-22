"use client";
import { useEffect, useLayoutEffect } from "react";
import { useSavedTrips } from "@/hooks/useSavedTrips";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import SavedTripCard from "./ui/SavedTripCard";
import Loader from "./ui/Loader";
import { savedTripDataCards } from "@/data";

function SavedTripsDisplay() {
  const { savedTrips, isPendingSavedTrips, savedTripsError } = useSavedTrips();

  useEffect(() => {
    (async () => {
      const LocomotiveScroll = (await import("locomotive-scroll" as any))
        .default;
      const locomotiveScroll = new LocomotiveScroll({
        lenisOptions: {
          lerp: 0.15,
        },
      });
    })();
  }, []);

  const useIsomorphicLayoutEffect =
    typeof window !== "undefined" ? useLayoutEffect : useEffect;

  useIsomorphicLayoutEffect(() => {
    const windowWidth = window.innerWidth;

    gsap.registerPlugin(ScrollTrigger);
    if (!isPendingSavedTrips && windowWidth >= 768) {
      let batchMax;
      if (windowWidth >= 1536) {
        batchMax = 4;
      } else if (windowWidth >= 1280) {
        batchMax = 3;
      } else if (windowWidth >= 768) {
        batchMax = 2;
      } else {
        batchMax = 1;
      }
      const context = gsap.context(() => {
        ScrollTrigger.batch(".trip-card", {
          interval: 0.5,
          batchMax: batchMax,
          start: "top bottom",

          onEnter: (batch) => {
            gsap.to(batch, {
              x: 0,
              opacity: 1,
              scale: 1,
              ease: "power4.out",
              stagger: 0.15,
              overwrite: true,
            });
          },

          onLeave: (batch) => {
            gsap.to(batch, {
              opacity: 0,
              ease: "power4.in",
              stagger: 0.15,
              overwrite: true,
            });
          },

          onEnterBack: (batch) => {
            gsap.to(batch, {
              opacity: 1,
              ease: "power4.out",
              stagger: 0.15,
              overwrite: true,
            });
          },
          onLeaveBack: (batch) => {
            gsap.to(batch, {
              opacity: 0,
              ease: "power4.in",
              stagger: 0.15,
              overwrite: true,
            });
          },
        });
        return () => context.revert();
      });
    } else {
      const context = gsap.context(() => {
        ScrollTrigger.batch(".trip-card", {
          interval: 0.5,
          batchMax: 1,
          start: "top bottom",

          onEnter: (batch) => {
            gsap.to(batch, {
              x: 0,
              opacity: 1,
              scale: 1,
              ease: "power4.out",
              stagger: 0.15,
              overwrite: true,
            });
          },
        });
        return () => context.revert();
      });
    }
  }, [isPendingSavedTrips]);

  if (isPendingSavedTrips) {
    return <Loader />;
  }
  return (
    <div className="mt-2 flex flex-col items-center gap-10 py-2 lg:px-16 lg:py-4 ">
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
