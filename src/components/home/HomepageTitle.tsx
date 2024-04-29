import { Button } from "@nextui-org/react";
import Link from "next/link";

function HomepageTitle() {
  return (
    <div className="-mt-4 flex flex-col gap-4 p-2 xs:-mt-8 xs:gap-2 xs:p-6 sm:p-4 md:p-6 lg:p-8 xl:px-10 xl:py-0">
      <div className="mt-0 max-w-3xl xs:mt-4 sm:mt-8 lg:mt-16">
        <h1 className="text-2xl font-bold text-tuna-900 sm:text-3xl md:text-4xl xl:text-6xl 2xl:text-7xl">
          Embark with Trip AI: Your Personalized Journey Planner
        </h1>
        <p className="my-2 text-lg text-tuna-600 lg:my-4 xl:text-xl 2xl:text-2xl">
          Get customized tour suggestions and packing lists, all adapted to the
          weather, for a worry-free adventure.
        </p>
      </div>

      <div className="mb-16 flex justify-center p-0 xs:p-8">
        <Link href="/form">
          <Button className="p-6 text-xl font-bold text-gallery-50 xs:text-2xl sm:p-8 sm:text-4xl md:text-5xl lg:p-10 lg:text-5xl xl:text-6xl 2xl:text-7xl ">
            Get Started
          </Button>
        </Link>
      </div>
    </div>
  );
}

export default HomepageTitle;
