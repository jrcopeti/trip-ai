"use client";
import { useEffect, useState } from "react";
import { AnimatePresence } from "framer-motion";

import SwiperWithThumbs from "./SwiperWithThumbs";
import HomepageTitle from "./HomepageTitle";
import GridContainer from "../ui/GridContainer";
import Preloader from "./Preloader";

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
