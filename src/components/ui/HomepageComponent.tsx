"use client";
import { useEffect, useLayoutEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import image1 from "@/assets/1.jpg";
import image2 from "@/assets/2.jpg";
import image3 from "@/assets/3.jpg";
import image4 from "@/assets/4.jpg";
import Image from "next/image";

function HomepageComponent() {
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
        <div className="grid h-full w-full grid-cols-none grid-rows-2 bg-slate-400 lg:grid-cols-2 lg:grid-rows-none ">
          <div className="relative h-full w-full bg-slate-600">title</div>
          <div className="relative h-full w-full bg-red-100">
            <Image
              src={image3.src}
              alt="image1"
              fill
              className="object-cover"
            />
          </div>
        </div>
      </section>
    </>
  );
}

export default HomepageComponent;
