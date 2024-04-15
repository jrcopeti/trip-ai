'use client'
import { useEffect, useLayoutEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import image1 from "@/assets/1.jpg"
import image2 from "@/assets/2.jpg"
import image3 from "@/assets/3.jpg"
import image4 from "@/assets/4.jpg"



function Homepage() {
  const useIsomorphicLayoutEffect =
    typeof window !== "undefined" ? useLayoutEffect : useEffect;

  useIsomorphicLayoutEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const context = gsap.context(() => {
      const innerHeight = window.innerHeight;

      const getRatio = (el: HTMLElement) =>
        innerHeight / (innerHeight + el.offsetHeight);

      gsap.utils.toArray("section").forEach((section, i) => {
        if (section instanceof HTMLElement) {
          const bg = section.querySelector('[data-bg="true"]');

          gsap.fromTo(
            bg,
            {
              backgroundPosition: () =>
                i ? `50% ${-innerHeight * getRatio(section)}px` : "50% 0px",
            },
            {
              backgroundPosition: () =>
                `100% ${innerHeight * (1 - getRatio(section))}px`,
              ease: "none",
              scrollTrigger: {
                trigger: bg,
                start: () => (i ? "top bottom" : "top top"),
                end: "bottom top",
                scrub: true,
                invalidateOnRefresh: true,
              },
            },
          );
        }
      });
    });
    return () => context.revert();
  }, []);

  return (
    <>
      <section className="relative flex h-screen items-center justify-center">
        <div
          data-bg="true"
          className="absolute left-0 top-0 -z-10 h-full w-full bg-cover bg-center bg-no-repeat brightness-75"
          style={{ backgroundImage: `url(${image1.src})` }}
        ></div>
        <h1 className="text-gallery-100">Parallax</h1>
      </section>
      <section
        data-bg="true"
        className="relative flex h-screen items-center justify-center"
      >
        <div
          data-bg="true"
          className="absolute left-0 top-0 -z-10 h-full w-full bg-cover bg-center bg-no-repeat brightness-75"
          style={{ backgroundImage: `url(${image2.src})` }}
        ></div>
        <h1 className="text-gallery-100">So smooth</h1>
      </section>
      <section className="relative flex h-screen items-center justify-center">
        <div
          data-bg="true"
          className="absolute left-0 top-0 -z-10 h-full w-full bg-cover bg-center bg-no-repeat brightness-75"
          style={{ backgroundImage: `url(${image3.src})` }}
        ></div>
        <h1>Nice, right?</h1>
      </section>
      <section className="relative flex h-screen items-center justify-center">
        <div
          data-bg="true"
          className="absolute left-0 top-0 -z-10 h-full w-full bg-cover bg-center bg-no-repeat brightness-75"
          style={{ backgroundImage: `url(${image4.src})` }}
        ></div>
        <h1>Nice, right?</h1>
      </section>
    </>
  );
}

export default Homepage;
