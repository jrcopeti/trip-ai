"use client";
import SwiperWithThumbs from "./ui/SwiperWithThumbs";
import HomepageTitle from "./ui/HomepageTitle";
import GridContainer from "./ui/GridContainer";

function HomepageComponent() {
  return (
    <>
      <GridContainer bg="bg-gallery-100/50">
        <SwiperWithThumbs />
        <HomepageTitle />
      </GridContainer>
    </>
  );
}

export default HomepageComponent;
