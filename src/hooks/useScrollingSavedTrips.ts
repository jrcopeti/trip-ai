import { useEffect, useLayoutEffect, useState } from "react";
import { useWindowSize } from "./useWindowSize";
import { useSavedTrips } from "./useSavedTrips";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export function useScrollingSavedTrips() {
  const [breakpoint, setBreakpoint] = useState<number>(0);
  const { savedTrips, isPendingSavedTrips } = useSavedTrips();
  const windowSize = useWindowSize();
  const windowWidth = windowSize.width;

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

  useEffect(() => {
    let newBreakpoint;
    if (typeof windowWidth === "undefined" || windowWidth >= 1536) {
      newBreakpoint = 1536;
    } else if (windowWidth >= 1280) {
      newBreakpoint = 1280;
    } else if (windowWidth >= 768) {
      newBreakpoint = 768;
    } else {
      newBreakpoint = 0;
    }
    if (newBreakpoint !== breakpoint) {
      setBreakpoint(newBreakpoint);
    }
  }, [windowWidth, breakpoint]);

  console.log("breakpoint", breakpoint);

  useIsomorphicLayoutEffect(() => {
    if (!isPendingSavedTrips) {
      gsap.registerPlugin(ScrollTrigger);
      let batchMax;
      if (typeof windowWidth === "undefined" || windowWidth >= 1536) {
        batchMax = 4;
      } else if (windowWidth >= 1280) {
        batchMax = 3;
      } else if (windowWidth >= 768) {
        batchMax = 2;
      } else {
        batchMax = 1;
      }

      console.log("batchMax", batchMax);

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
  }, [isPendingSavedTrips, savedTrips, breakpoint]);
}
