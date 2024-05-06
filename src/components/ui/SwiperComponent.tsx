"use client";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { homepageImages } from "@/data";

function SwiperComponent() {
  return (
    <section>
      <Swiper
        navigation
        pagination={{ type: "fraction" }}
        modules={[Navigation, Pagination]}
        className="h-full w-full"
      >
        {homepageImages.map((image, index) => (
          <SwiperSlide key={index}>
            <div className="relative h-full w-full">
              <Image
                src={image.src}
                alt={image.alt}
                className="block h-full w-full object-cover "
              />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
}

export default SwiperComponent;
