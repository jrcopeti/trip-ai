"use client";
import { useState } from "react";

import { Swiper, SwiperSlide } from "swiper/react";
import SwiperCore from "swiper";
import {
  Navigation,
  Pagination,
  Thumbs,
  FreeMode,
  Autoplay,
} from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/free-mode";
import "swiper/css/thumbs";
import "swiper/element/css/effect-fade";

import Image from "next/image";
import { homepageImages } from "@/data";

function SwiperWithThumbs() {
  const [thumbsSwiper, setThumbsSwiper] = useState<SwiperCore | null>(null);
  const [activeIndex, setActiveIndex] = useState<number>(0);
  return (
    <>
      <section className="min-h-full">
        <Swiper
          speed={1000}
          modules={[Autoplay, FreeMode, Navigation, Thumbs, Pagination]}

          spaceBetween={30}
          pagination={{ clickable: true, dynamicBullets: true }}
          autoplay={{
            delay: 4000,
            disableOnInteraction: true,
          }}
          thumbs={{
            swiper:
              thumbsSwiper && !thumbsSwiper.destroyed ? thumbsSwiper : null,
          }}
          onSlideChange={(swiper) => setActiveIndex(swiper.realIndex)}
          className=" h-[70%] sx:h-[77%] w-full"
          style={
            {
              "--swiper-pagination-color": "#4e888c",
              "--swiper-pagination-bullet-inactive-color": "#f8f8f8",
            } as React.CSSProperties
          }
        >
          {homepageImages.map((image, index) => (
            <SwiperSlide key={index}>
              <Image
                src={image.src}
                alt={image.alt}
                placeholder="blur"
                blurDataURL={image.placeholder}
                priority
                className="block h-full w-full object-cover"
              />
            </SwiperSlide>
          ))}
        </Swiper>

        <Swiper
          className="mt-3 h-[9vh] xs:h-[10vh] w-[98%] lg:h-[15vh] 2xl:h-[18vh] "
          onSwiper={setThumbsSwiper}
          loop
          spaceBetween={12}
          slidesPerView={3}
          freeMode
          watchSlidesProgress
          modules={[Autoplay, FreeMode, Navigation, Thumbs]}
        >
          {homepageImages.map((image, index) => (
            <SwiperSlide key={index}>
              <div
                className={`flex h-full w-full cursor-pointer items-center justify-center ${
                  activeIndex === index ? "brightness-100" : "brightness-50"
                }`}
              >
                <Image
                  src={image.src}
                  alt={image.alt}
                  placeholder="blur"
                  blurDataURL={image.placeholder}
                  className="block h-full w-full rounded-sm object-cover"
                />

                <p className="absolute w-full bg-gallery-50/70 p-1 text-center text-base font-bold capitalize leading-5 text-tuna-900 lg:text-lg">
                  {image.title}
                </p>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </section>
    </>
  );
}

export default SwiperWithThumbs;
