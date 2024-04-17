"use client";
import SwiperWithThumbs from "./ui/SwiperWithThumbs";
import GradientConic from "./ui/GradientConic";
import HomepageTitle from "./ui/HomepageTitle";

function HomepageComponent() {
  return (
    <>
      <section className="relative flex h-[calc(100dvh-3.5rem)] items-center justify-center overflow-hidden">
        <div className="absolute left-0 top-0 -z-30 h-full w-full bg-gallery-50"></div>

        <GradientConic
          left="-70%"
          top="-30%"
          from="from-neptune-500"
          to="to-yellorange-300"
        />

        <GradientConic
          left="70%"
          top="-30%"
          from="from-violay-500"
          to="to-deeporange-500"
        />

        <GradientConic
          left="70%"
          top="70%"
          from="from-neptune-500"
          to="to-yellorange-300"
        />

        <GradientConic
          left="-70%"
          top="70%"
          from="from-violay-500"
          to="to-deeporange-500"
        />

        <div className="z-30 grid h-[90%] w-[90%] grid-cols-1 grid-rows-2 gap-6 bg-gallery-100/50 shadow-xl lg:h-[80%] lg:w-[80%] lg:grid-cols-2 lg:grid-rows-none">
          <SwiperWithThumbs />
          <HomepageTitle />
        </div>
      </section>
    </>
  );
}

export default HomepageComponent;
