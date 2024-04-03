import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/all";

const image1 = "/1.jpg";
const image2 = "/2.jpg";
const image3 = "/3.jpg";
const geopattern = "/geopattern.png";

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
            i ? `100% ${-innerHeight * getRatio(section)}px` : "50% 0px",
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
          className="absolute left-0 top-0 -z-10 h-full w-full  bg-center bg-repeat  brightness-75"
          style={{ backgroundImage: `url(${geopattern})` }}
        ></div>
        <div className='absolute w-1/2 bg-slate-100/20'>

        <h1 className="text-gallery-100">
          Backpack Essential for carrying hiking gear and exploring the nature
          trails. 1 Earphones Great for enjoying music while hiking or relaxing
          in the apartment. passport tickets money charger Embark on a Nightlife
          Exploration: Discover the lively nightlife scene in Funchal, from
          trendy bars to traditional taverns. Enjoy the local music and dance
          culture while mingling with friendly locals and fellow travelers. Hike
          Through Nature's Beauty: Explore the lush hiking trails surrounding
          Funchal, offering breathtaking views of the mountains and coastline.
          Experience the tranquility of nature and capture stunning moments
          amidst the diverse flora and fauna. Savor Coffee Delights: Indulge in
          the rich coffee culture of Funchal by visiting charming cafes and
          tasting local blends. Enjoy the cozy ambiance, delicious pastries, and
          conversations with locals, making each coffee break a delightful
          experience.
        </h1>
        </div>
      </section>

      <section
        data-bg="true"
        className="relative flex h-screen items-center justify-center"
      >
        <div
          data-bg="true"
          className="absolute left-0 top-0 -z-10 h-full w-full bg-center bg-repeat brightness-75"
          style={{ backgroundImage: `url(${geopattern})` }}
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
