"use client";
import SwiperWithThumbs from "./ui/SwiperWithThumbs";
import GradientConic from "./ui/GradientConic";
import HomepageTitle from "./ui/HomepageTitle";
import Gradient1 from "./ui/Gradient1";

function HomepageComponent() {
  return (
    <>
      <section className="relative flex h-[calc(100dvh-3.5rem)] items-center justify-center overflow-hidden">
        <div className="absolute left-0 top-0 -z-30 h-full w-full bg-gallery-50"></div>

        {/* <GradientConic
          left="-left-[90%] lg:-left-[70%]"
          top="-top-[30%]"
          from="from-neptune-500"
          to="to-yellorange-400"
        />

        <GradientConic
          left="left-[55%] lg:left-[70%]"
          top="-top-[30%]"
          from="from-violay-500"
          to="to-deeporange-500"
        />

        <GradientConic
          left="left-[55%] lg:left-[70%]"
          top="top-[70%]"
          from="from-neptune-500"
          to="to-yellorange-400"
        />

        <GradientConic
          left="-left-[90%] lg:-left-[70%]"
          top="top-[70%]"
          from="from-violay-500"
          to="to-deeporange-500"
        /> */}

        <Gradient1
          left="-left-[70%] lg:-left-[70%]"
          top="-top-[40%]"
          color1="bg-neptune-500"
          color2="bg-yellorange-400"
          blur="blur-[180px]"
        />

        <Gradient1
          left="left-[100%] lg:left-[60%]"
          top="-top-[40%]"
          color1="bg-neptune-500"
          color2="bg-yellorange-400"
          blur="blur-[180px]"
        />

        <Gradient1
          left="left-[100%] lg:left-[70%]"
          top="top-[70%]"
          color1="bg-violay-500"
          color2="bg-deeporange-500"
          blur="blur-[120px]"
        />

        <Gradient1
          left="-left-[10%] lg:-left-[70%]"
          top="top-[70%]"
          color1="bg-violay-500"
          color2="bg-deeporange-500"
          blur="blur-[180px]"
        />

        <div className="z-30 grid h-[90%] w-[90%] grid-cols-1 grid-rows-2 gap-6 overflow-auto bg-gallery-100/50 shadow-xl lg:h-[80%] lg:w-[80%] lg:grid-cols-2 lg:grid-rows-none">
          <SwiperWithThumbs />
          <HomepageTitle />
        </div>
      </section>
    </>
  );
}

export default HomepageComponent;
