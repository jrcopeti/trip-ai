import { useEffect } from "react";

export function useLocomotiveScroll(scrollRef: React.RefObject<HTMLElement>) {
  useEffect(() => {
    let locomotiveScroll: import("locomotive-scroll");
    let innerContainer: HTMLElement;
    const handleScroll = (e: WheelEvent) => {
      e.stopPropagation();
    };

    (async () => {
      if (scrollRef && scrollRef.current) {
        const LocomotiveScroll = (await import("locomotive-scroll")).default;
        locomotiveScroll = new LocomotiveScroll({
          el: scrollRef.current,
          smooth: true,
          lerp: 0.15,
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
