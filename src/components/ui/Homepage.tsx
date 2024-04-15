"use client";
import { useEffect, useLayoutEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import image1 from "@/assets/1.jpg";
import image2 from "@/assets/2.jpg";
import image3 from "@/assets/3.jpg";
import image4 from "@/assets/4.jpg";
import Image from "next/image";

function Homepage() {
  const useIsomorphicLayoutEffect =
    typeof window !== "undefined" ? useLayoutEffect : useEffect;

  useEffect(() => {
    (async () => {
      const LocomotiveScroll = (await import("locomotive-scroll" as any))
        .default;
      const locomotiveScroll = new LocomotiveScroll();
    })();
  }, []);

  return (
    <>
      <section className="relative flex h-screen items-center justify-center">
        <Image src={image3.src} alt="image1" fill className="object-cover" />
        <h1 className="text-gallery-100">homepage</h1>
      </section>

      <section className="relative flex h-screen items-center justify-center">
        <Image src={image4.src} alt="image1" fill className="object-cover" />
        <h1 className="text-gallery-100">homepage</h1>
      </section>

      <section className="relative flex h-screen items-center justify-center">
        <Image src={image2.src} alt="image1" fill className="object-cover" />
        <h1 className="text-gallery-100">homepage</h1>
      </section>
    </>
  );
}

export default Homepage;
