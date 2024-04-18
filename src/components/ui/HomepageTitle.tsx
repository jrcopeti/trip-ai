import { Button } from "@nextui-org/react";
import Link from "next/link";

function HomepageTitle() {
  return (
    <div className="-mt-7 flex flex-col p-10 lg:mt-0 lg:p-10">
      <h1 className="text-3xl font-bold text-tuna-900 sm:text-4xl md:text-5xl lg:text-6xl 2xl:text-7xl">
        Embark with Trip AI: Your Personalized Journey Planner
      </h1>
      <p className="my-2 lg:mt-auto text-xl sm:text-xl text-tuna-900 md:text-2xl lg:text-3xl 2xl:text-4xl ">
        Get customized tour suggestions and packing lists, all adapted to the
        weather, for a worry-free adventure.
      </p>

      <div className="my-auto flex w-full justify-center">
        <Link href="/form">
          <Button className="p-10 text-3xl font-bold text-gallery-100 md:text-4xl lg:text-6xl 2xl:text-7xl ">
            Get Started
          </Button>
        </Link>
      </div>
    </div>
  );
}

export default HomepageTitle;
