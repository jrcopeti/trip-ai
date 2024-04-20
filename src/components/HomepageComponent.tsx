"use client";
import SwiperWithThumbs from "./ui/SwiperWithThumbs";
import HomepageTitle from "./ui/HomepageTitle";
import GridContainer from "./ui/GridContainer";
import { useEffect, useState } from "react";
import { AnimatePresence } from "framer-motion";
import Preloader from "./ui/Preloader";

function HomepageComponent() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);
    return () => {
      clearTimeout(timer);
    };
  }, []);

  return (
    <>
      <AnimatePresence mode="wait">
        {isLoading && <Preloader />}
      </AnimatePresence>
      <GridContainer bg="bg-gallery-100/50">
        <SwiperWithThumbs />
        <HomepageTitle />
      </GridContainer>
    </>
  );
}

export default HomepageComponent;
