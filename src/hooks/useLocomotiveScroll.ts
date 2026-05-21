import { useEffect } from "react";
import type LocomotiveScrollType from "locomotive-scroll";

export function useLocomotiveScroll(scrollRef: React.RefObject<HTMLElement>) {
  useEffect(() => {
    let locomotiveScroll: LocomotiveScrollType | undefined;
    let innerContainer: HTMLElement;
    const handleScroll = (e: WheelEvent) => {
      e.stopPropagation();
    };

    (async () => {
      if (scrollRef && scrollRef.current) {
        const LocomotiveScroll = (await import("locomotive-scroll")).default;
        locomotiveScroll = new LocomotiveScroll({
          lenisOptions: {
            wrapper: scrollRef.current,
            lerp: 0.15,
          },
        });

        innerContainer = scrollRef.current;
        innerContainer.addEventListener("wheel", handleScroll, {
          passive: true,
        });
      }
    })();

    return () => {
      if (locomotiveScroll) {
        locomotiveScroll.destroy();
      }
      if (innerContainer) {
        innerContainer.removeEventListener("wheel", handleScroll);
      }
    };
  }, [scrollRef]);
}
