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
  return (
    <>
      <section className="relative flex h-screen items-center justify-center">
        <div className="grid h-full w-full grid-cols-none grid-rows-2 lg:grid-cols-2 lg:grid-rows-none ">
          <div className="relative h-full w-full bg-gallery-50">
            <aside className="absolute inset-0 -left-[800px] -top-[192px] flex justify-center">
              <div className="ml-[8rem] h-[520px] w-[520px] rounded-full bg-violay-500 opacity-60  blur-[150px] filter md:blur-[100px] "></div>
              <div className="mr-[8rem] h-[520px] w-[520px] rounded-full bg-deeporange-500 opacity-50  mix-blend-color-burn blur-[150px] filter md:blur-[100px]  "></div>
              {/* <div className="h-[520px] w-[520px] rounded-full from bg-gradient-conic mix-blend-color-burn  from-violay-500 to-deeporange-500 opacity-50 blur-[30px] filter  "></div> */}
            </aside>
          </div>
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

// <div className="grid h-[90%] w-[90%] grid-cols-none grid-rows-2 lg:h-[80%] lg:w-[80%] lg:grid-cols-2 lg:grid-rows-none ">
//   <div className="relative h-full w-full ">
//     <Image
//       src={image1}
//       alt="city"
//       priority
//       fill
//       className="object-cover shadow-xl"
//     />
//   </div>

//   <div className="bg-gallery-50/40 p-8 shadow-sm sm:p-16">
//     <h1 className="ml-4 mt-8 text-4xl font-extrabold text-tuna-900 sm:ml-8 sm:mt-3 sm:text-4xl md:text-5xl lg:text-6xl 2xl:text-7xl">
//       HOMEPAGE
//     </h1>
//   </div>
// </div>
