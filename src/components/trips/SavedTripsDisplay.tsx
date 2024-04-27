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
import { Input } from "@nextui-org/react";
import toast from "react-hot-toast";
import { PuffLoader } from "react-spinners";
import { MdOutlineErrorOutline } from "react-icons/md";
import CustomToaster from "../ui/CustomToaster";

function SavedTripsDisplay() {
  const {
    savedTrips,
    isPendingSavedTrips,
    savedTripsError,
    setSearchTerm,
    searchTerm,
  } = useSavedTrips();

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
  }, [isPendingSavedTrips, savedTrips]);

  if (savedTripsError) {
    return (
      <ErrorComponent
        message="There was an error fetching saved trips. Please try again."
        path="/"
        button="Back to Home"
      />
    );
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

          <Input
            type="text"
            id="userName"
            className="w-[70%] max-w-lg text-tuna-700 lg:text-2xl"
            label="Search for a trip"
            placeholder="A city, country or user name"
            radius="sm"
            size="lg"
            variant="faded"
            color="primary"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          {savedTrips?.length === 0 && !isPendingSavedTrips && (
            <h2 className="flex items-center gap-2 text-2xl font-semibold text-tuna-900">
              <MdOutlineErrorOutline color="#c2150c" /> No trips found
            </h2>
          )}

          {isPendingSavedTrips ? (
            <PuffLoader size={80} color="#4e888c" />
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 2xl:gap-8">
              {savedTrips?.map((trip) => (
                <SavedTripCard key={trip.id} trip={trip} />
              ))}
            </div>
          )}
        </div>
      </SavedTripsContainer>
    </Container>
  );
}

export default SavedTripsDisplay;
