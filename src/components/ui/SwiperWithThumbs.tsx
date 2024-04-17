"use client";
import { Swiper, SwiperSlide, useSwiper } from "swiper/react";
import { Navigation, Pagination, Thumbs, FreeMode } from "swiper/modules";
import { homepageImages } from "@/data";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/free-mode";
import "swiper/css/thumbs";
import Image from "next/image";
import { useState } from "react";
import { SwiperOptions } from "swiper/types";

function SwiperWithThumbs() {
  const [thumbsSwiper, setThumbsSwiper] = useState(null);
  const [activeIndex, setActiveIndex] = useState(0);
  console.log("activeIndex", activeIndex)
  return (
    <>
      <section className="min-h-full">
        <Swiper
          loop={true}
          spaceBetween={10}
          navigation
          thumbs={{
            swiper:
              thumbsSwiper && !thumbsSwiper.destroyed ? thumbsSwiper : null,
          }}
          onSlideChange={(swiper) => setActiveIndex(swiper.realIndex)}
          modules={[FreeMode, Navigation, Thumbs]}
          className="h-[80%] w-full"
        >
          {homepageImages.map((image, index) => (
            <SwiperSlide key={index}>
              <div className="relative h-full w-full">
                <Image
                  src={image.src}
                  alt={image.alt}
                  className="block h-full w-full object-cover"
                />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>

        <Swiper
          onSwiper={setThumbsSwiper}
          loop={true}
          spaceBetween={12}
          slidesPerView={3}
          freeMode={true}
          watchSlidesProgress={true}
          modules={[FreeMode, Navigation, Thumbs]}
          className="thumbs mt-3 h-32 w-full "
        >
          {homepageImages.map((image, index) => (
            <SwiperSlide key={index}>
              <button
                className={`flex h-full w-full items-center justify-center ${
                  activeIndex === index
                    ? "brightness-100"
                    : "brightness-50"
                }`}
              >
                <Image
                  src={image.src}
                  alt={image.alt}
                  className="block h-full w-full object-cover "
                />
              </button>
            </SwiperSlide>
          ))}
        </Swiper>
      </section>
    </>
  );
}

export default SwiperWithThumbs;
