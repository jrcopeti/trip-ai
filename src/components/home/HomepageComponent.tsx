"use client";
import { useEffect, useState } from "react";
import { AnimatePresence } from "framer-motion";

import SwiperWithThumbs from "./SwiperWithThumbs";
import HomepageTitle from "./HomepageTitle";
import GridContainer from "../ui/GridContainer";
import Preloader from "./Preloader";
import Container from "../ui/Container";
import GradientBg from "../ui/GradientBg";

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
    <Container overflow="overflow-hidden" height="h-[calc(100dvh-3.5rem)]">
      <GradientBg />
      <AnimatePresence mode="wait">
        {isLoading && <Preloader />}
      </AnimatePresence>
      <GridContainer bg="bg-gallery-50/50">
        <SwiperWithThumbs />
        <HomepageTitle />
      </GridContainer>
    </Container>
  );
}

export default HomepageComponent;
