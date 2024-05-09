import { useEffect, useLayoutEffect } from "react";
import { useWindowSize } from "./useWindowSize";
import { useSavedTrips } from "./useSavedTrips";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export function useScrollingSavedTrips() {
  const { savedTrips, isPendingSavedTrips } = useSavedTrips();
  const windowSize = useWindowSize();

  const useIsomorphicLayoutEffect =
    typeof window !== "undefined" ? useLayoutEffect : useEffect;

  useEffect(() => {
    let locomotiveScroll: import("locomotive-scroll");
    (async () => {
      const LocomotiveScroll = (await import("locomotive-scroll")).default;
      locomotiveScroll = new LocomotiveScroll({
        smooth: true,
        lerp: 0.1,
      });
    })();
    return () => {
      if (locomotiveScroll) {
        locomotiveScroll.destroy();
      }
    };
  }, []);

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
}
