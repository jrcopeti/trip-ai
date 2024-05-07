import { useEffect } from "react";

export function useLocomotiveScroll() {
  useEffect(() => {
    (async () => {
      const LocomotiveScroll = (await import("locomotive-scroll" as any))
        .default;
      const locomotiveScroll = new LocomotiveScroll({
        allowNestedScrolling: true,
        lenisOptions: {
          lerp: 0.1,
        },
      });
    })();
  }, []);
}
