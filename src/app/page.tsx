"use client";
import HomepageComponent from "@/components/ui/HomepageComponent";
import Image from "next/image";
import image1 from "@/assets/1.jpg";
import HomepageComponent2 from "@/components/ui/HomepageComponent2";
import { useEffect } from "react";
import HomepageComponent3 from "@/components/ui/HomepageComponent3";

function Homepage() {
  useEffect(() => {
    (async () => {
      const LocomotiveScroll = (await import("locomotive-scroll" as any))
        .default;
      const locomotiveScroll = new LocomotiveScroll();
    })();
  }, []);
  return (
    <>
      <HomepageComponent2 />

      <section className="relative flex h-screen items-center justify-center overflow-hidden ">
        <div className="absolute left-0 top-0 -z-20 h-full w-full bg-gradient-to-b from-gallery-100 to-gallery-50  "></div>
        <aside className="absolute inset-0 -top-[20%] left-[35%] flex justify-center">
          <div className="h-[520px] w-[520px] rounded-full bg-neptune-500 opacity-60  blur-[150px] filter md:blur-[100px] "></div>
          {/* <div className="h-[520px] w-[520px] rounded-full bg-shark-500  mix-blend-color-burn blur-[150px] filter md:blur-[30px]  "></div> */}
          <div className="mr-[8rem] h-[520px] w-[520px] rounded-full bg-shark-500 opacity-50  mix-blend-color-burn blur-[150px] filter md:blur-[30px]"></div>
        </aside>
      </section>

      <section className="relative flex h-screen items-center justify-center overflow-hidden ">
        <div className="absolute left-0 top-0 -z-20 h-full w-full bg-gradient-to-b from-gallery-100 to-gallery-50  "></div>
        <aside className="absolute inset-0 -top-[20%] left-[35%] flex justify-center">
          <div className="h-[520px] w-[520px] rounded-full bg-neptune-500 opacity-60  blur-[150px] filter md:blur-[100px] "></div>
          <div className="h-[520px] w-[520px] rounded-full bg-shark-500  mix-blend-color-burn blur-[150px] filter md:blur-[30px]  "></div>
        </aside>
      </section>

      <section className="relative flex h-screen items-center justify-center overflow-hidden ">
        <div className="absolute left-0 top-0 -z-20 h-full w-full bg-gradient-to-b from-gallery-50 to-gallery-100  "></div>
        <aside className="absolute inset-0 -left-[800px] -top-[192px] flex justify-center">
          <div className="ml-[8rem] h-[520px] w-[520px] rounded-full bg-violay-500 opacity-60  blur-[150px] filter md:blur-[100px] "></div>
          <div className="mr-[8rem] h-[520px] w-[520px] rounded-full bg-deeporange-500 opacity-50  mix-blend-color-burn blur-[150px] filter md:blur-[100px]"></div>
          {/* <div className="h-[520px] w-[520px] rounded-full from bg-gradient-conic mix-blend-color-burn  from-violay-500 to-deeporange-500 opacity-50 blur-[30px] filter  "></div> */}
        </aside>
        <aside className="absolute inset-0 left-[35%] top-[80%] flex justify-center">
          <div className="ml-[8rem] h-[520px] w-[520px] rounded-full bg-neptune-500 opacity-60  blur-[150px] filter md:blur-[100px] "></div>
          <div className="mr-[8rem] h-[520px] w-[520px] rounded-full bg-shark-500 opacity-50  mix-blend-color-burn blur-[150px] filter md:blur-[30px]"></div>
        </aside>
      </section>

      <section className="relative flex h-screen items-center justify-center overflow-hidden ">
        <div className="absolute left-0 top-0 -z-20 h-full w-full bg-gradient-to-b from-gallery-50 to-gallery-100  "></div>
        <aside className="absolute inset-0 -left-[800px] -top-[192px] flex justify-center">
          <div className="ml-[8rem] h-[520px] w-[520px] rounded-full bg-violay-500 opacity-60  blur-[150px] filter md:blur-[100px] "></div>
          <div className="mr-[8rem] h-[520px] w-[520px] rounded-full bg-deeporange-500 opacity-50  mix-blend-color-burn blur-[150px] filter md:blur-[100px]"></div>
          {/* <div className="h-[520px] w-[520px] rounded-full from bg-gradient-conic mix-blend-color-burn  from-violay-500 to-deeporange-500 opacity-50 blur-[30px] filter  "></div> */}
        </aside>
        <aside className="absolute inset-0 left-[35%] top-[80%] flex justify-center">
          <div className="ml-[8rem] h-[520px] w-[520px] rounded-full bg-violay-500 opacity-60  blur-[150px] filter md:blur-[100px] "></div>
          <div className="mr-[8rem] h-[520px] w-[520px] rounded-full bg-deeporange-500 opacity-50  mix-blend-color-burn blur-[150px] filter md:blur-[100px]"></div>
        </aside>
      </section>
    </>
  );
}

export default Homepage;
