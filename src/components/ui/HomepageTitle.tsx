import { Button } from "@nextui-org/react";
import Link from "next/link";

function HomepageTitle() {
  return (
    <div className="-mt-12 flex flex-col gap-4 p-8 xs:-mt-10 xs:gap-2 sm:-mt-8 lg:-mt-0 lg:p-10">
      <h1 className="text-3xl font-bold text-tuna-900 sm:text-4xl md:text-5xl xl:text-6xl 2xl:text-7xl">
        Embark with Trip AI: Your Personalized Journey Planner
      </h1>
      <p className="my-2 text-xl text-tuna-900 sm:text-xl md:text-2xl lg:mt-auto xl:text-3xl 2xl:text-4xl ">
        Get customized tour suggestions and packing lists, all adapted to the
        weather, for a worry-free adventure.
      </p>

      <div className="flex w-full justify-center my-auto">
        <Link href="/form">
          <Button className="sm:4xl p-6 text-2xl font-bold text-gallery-100 sm:p-8 md:text-5xl lg:p-10 xl:text-6xl 2xl:text-7xl ">
            Get Started
          </Button>
        </Link>
      </div>
    </div>
  );
}

export default HomepageTitle;
