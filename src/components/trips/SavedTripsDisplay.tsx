"use client";
import { useEffect, useLayoutEffect } from "react";
import { useSavedTrips } from "@/hooks/useSavedTrips";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import SavedTripCard from "./SavedTripCard";
import Loader from "../ui/Loader";
import { savedTripDataCards } from "@/data";
import ErrorComponent from "../ui/NotFoundComponent";
import Container from "../ui/Container";
import GradientBg from "../ui/GradientBg";
import SavedTripsContainer from "./SavedTripsContainer";

import { useWindowSize } from "@/hooks/useWindowSize";
import { notFound } from "next/navigation";

function SavedTripsDisplay() {
  const { savedTrips, isPendingSavedTrips, savedTripsError } = useSavedTrips();

  const windowSize = useWindowSize();

  const useIsomorphicLayoutEffect =
    typeof window !== "undefined" ? useLayoutEffect : useEffect;

  useIsomorphicLayoutEffect(() => {
    const windowWidth = windowSize.width;
    if (!isPendingSavedTrips) {
      gsap.registerPlugin(ScrollTrigger);
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
    }
  }, [isPendingSavedTrips]);

  if (savedTripsError) {
    return (
      <ErrorComponent
        message="saved trips error in trips display component"
        path="/saved-trips"
        button="saved-trips"
      />
    );
  }
  if (!savedTripDataCards) {
    notFound();
  }
  return (
    <Container height="h-full">
      <GradientBg
        position="fixed"
        // from="from-neptune-300"
        // to="to-yellorange-200"
        // blur="blur-[190px]"
        from="from-violay-300"
        to="to-neptune-300"
        blur="blur-[150px]"
      />
      <SavedTripsContainer>
        <div className="mt-2 flex flex-col items-center gap-10 py-2 lg:px-16 lg:py-4">
          <h1 className="text-5xl font-bold text-tuna-900">Saved Trips</h1>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 2xl:gap-8">
            {savedTrips?.map((trip) => (
              <SavedTripCard key={trip.id} trip={trip} />
            ))}
          </div>
        </div>
      </SavedTripsContainer>
    </Container>
  );
}

export default SavedTripsDisplay;
