// import { useEffect } from "react";

import { useEffect } from "react";

// export function useLocomotiveScroll() {
//   useEffect(() => {
//     (async () => {
//       const LocomotiveScroll = (await import("locomotive-scroll" as any))
//         .default;
//       const locomotiveScroll = new LocomotiveScroll({
//         allowNestedScrolling: true,
//         lenisOptions: {
//           lerp: 0.1,
//         },
//       });
//     })();
//   }, []);
// }

// import { useEffect } from "react";

// export function useLocomotiveScroll(scrollRef) {
//   useEffect(() => {
//     (async () => {
//       const LocomotiveScroll = (await import("locomotive-scroll" as any))
//         .default;
//       const locomotiveScroll = new LocomotiveScroll({
//         el: document.querySelector("#grid-container"), // Replace #myContainer with your container's id
//         smooth: true,
//         smoothMobile: true,
//         lerp: 0.1,
//       });
//       const innerContainer = scrollRef.current;
//       if (innerContainer) {
//         innerContainer.addEventListener('wheel', (e) => {
//           e.stopPropagation();
//         }, { passive: true });
//       }
//     })();
//   }, [scrollRef]);
// }

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

    // Cleanup function
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
