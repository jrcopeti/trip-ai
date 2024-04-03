import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/all";

const image1 = "/1.jpg";
const image2 = "/2.jpg";
const image3 = "/3.jpg";

export const Parallax = () => {
  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    gsap.registerPlugin(ScrollTrigger);

    const innerHeight = window.innerHeight;

    const getRatio = (el) => innerHeight / (innerHeight + el.offsetHeight);

    gsap.utils.toArray("section").forEach((section, i) => {
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
            trigger: section,

            start: () => (i ? "top bottom" : "top top"),
            end: "bottom top",
            scrub: true,
            invalidateOnRefresh: true,
          },
        },
      );
    });
  }, []);
  return (
    <>
      <section className="relative flex h-screen items-center justify-center">
        <div
          data-bg="true"
          className="absolute left-0 top-0 -z-10 h-full w-full bg-cover bg-center bg-no-repeat brightness-75"
          style={{ backgroundImage: `url(${image1})` }}
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
          style={{ backgroundImage: `url(${image2})` }}
        ></div>
        <h1 className="text-gallery-100">So smooth</h1>
      </section>
      <section className="relative flex h-screen items-center justify-center">
        <div
          data-bg="true"
          className="absolute left-0 top-0 -z-10 h-full w-full bg-cover bg-center bg-no-repeat brightness-75"
          style={{ backgroundImage: `url(${image3})` }}
        ></div>
        <h1>Nice, right?</h1>
      </section>
      <section className="relative flex h-screen items-center justify-center">
        <div
          data-bg="true"
          className="absolute left-0 top-0 -z-10 h-full w-full bg-cover bg-center bg-no-repeat brightness-75"
          style={{ backgroundImage: `url(${image3})` }}
        ></div>
        <h1>Nice, right?</h1>
      </section>
    </>
  );
};
export default Parallax;
