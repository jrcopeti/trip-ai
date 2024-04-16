"use client";
import Image from "next/image";
import image1 from "@/assets/1.jpg";
import { Button } from "@nextui-org/react";
import Link from "next/link";

function HomepageComponent2() {
  return (
    <section className="overflow-hidde relative flex h-screen items-center justify-center">
      <div className="absolute left-0 top-0 -z-20 h-full w-full bg-gradient-to-b from-gallery-50 to-gallery-100"></div>
      <div className="grid h-[90%] w-[90%] grid-cols-none grid-rows-2 lg:h-[80%] lg:w-[80%] lg:grid-cols-2 lg:grid-rows-none ">
        <div className="relative h-full w-full ">
          <Image
            src={image1}
            alt="city"
            priority
            fill
            className="object-cover shadow-xl"
          />
        </div>
        <div className="bg-gallery-50/40 p-8 shadow-sm sm:p-16 z-40">
          <Link href={"/form"}>
            <Button className="ml-4 mt-8 p-10 text-4xl font-extrabold text-tuna-900 sm:ml-8 sm:mt-3 sm:text-4xl md:text-5xl lg:text-6xl 2xl:text-7xl">
              Get Started
            </Button>
          </Link>
        </div>
      </div>

      <aside className="absolute inset-0 -left-[800px] -top-[192px] -z-20 flex justify-center">
        <div className="ml-[8rem] h-[520px] w-[520px] rounded-full bg-violay-500 opacity-60  blur-[150px] filter md:blur-[100px] "></div>
        <div className="mr-[8rem] h-[520px] w-[520px] rounded-full bg-deeporange-500 opacity-50  mix-blend-color-burn blur-[150px] filter md:blur-[100px]  "></div>
        {/* <div className="h-[520px] w-[520px] rounded-full from bg-gradient-conic mix-blend-color-burn  from-violay-500 to-deeporange-500 opacity-50 blur-[30px] filter  "></div> */}
      </aside>
      <aside className="absolute inset-0 left-[35%] top-[80%] flex justify-center">
        <div className="h-[520px] w-[520px] rounded-full bg-neptune-500 opacity-60  blur-[150px] filter md:blur-[100px] "></div>
        {/* <div className="h-[520px] w-[520px] rounded-full bg-shark-500  mix-blend-color-burn blur-[150px] filter md:blur-[30px]  "></div> */}
        <div className="mr-[8rem] h-[520px] w-[520px] rounded-full bg-shark-500 opacity-50  mix-blend-color-burn blur-[150px] filter md:blur-[30px]"></div>
      </aside>
    </section>
  );
}

export default HomepageComponent2;
