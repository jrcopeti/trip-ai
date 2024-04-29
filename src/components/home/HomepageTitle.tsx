import { Button } from "@nextui-org/react";
import Link from "next/link";

function HomepageTitle() {
  return (
    <div className="-mt-6 flex flex-col gap-4 p-4 xs:-mt-8 xs:gap-2 xs:p-6 sm:p-8 md:p-10 lg:p-12 xl:px-14 xl:py-0">
      <div className="mt-0 xs:mt-4 sm:mt-8 lg:mt-16">
        <h1 className="text-3xl font-bold text-tuna-900 sm:text-4xl md:text-5xl xl:text-6xl 2xl:text-7xl">
          Embark with Trip AI: Your Personalized Journey Planner
        </h1>
        <p className="my-2 text-xl text-tuna-600 sm:text-xl md:text-xl lg:my-4 xl:text-2xl 2xl:text-3xl">
          Get customized tour suggestions and packing lists, all adapted to the
          weather, for a worry-free adventure.
        </p>
      </div>

      <div className="flex justify-center p-4 my-auto">
        <Link href="/form">
          <Button className="sm:4xl p-6 text-2xl font-bold text-gallery-50 sm:p-8 sm:text-3xl md:text-4xl lg:p-10 lg:text-5xl xl:text-6xl 2xl:text-7xl ">
            Get Started
          </Button>
        </Link>
      </div>
    </div>
  );
}

export default HomepageTitle;
