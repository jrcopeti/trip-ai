"use client";

import { fetchTripImage } from "@/app/api/unsplashApi";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { createContext } from "react";
import type { ImageContextType } from "@/types";

const defaultContextValue: ImageContextType = {
  imageData: undefined,
  generateImage: () => {},
  isPendingImage: false,
  errorImage: null,
};

const ImageContext = createContext<ImageContextType>(defaultContextValue);

function ImageProvider({ children }: { children: React.ReactNode }) {
  const {
    mutate: generateImage,
    data: imageData,
    isPending: isPendingImage,
    error: errorImage,
  } = useMutation({
    mutationFn: (city: string) => fetchTripImage(city),

    onSuccess: (data) => {
      console.log(data);
      console.log("success Image Context ");
    },
    onError: (error) => {
      console.log(error);
      console.log("error Image Context ");
    },
  });

  return (
    <ImageContext.Provider
      value={{ imageData, generateImage, isPendingImage, errorImage }}
    >
      {children}
    </ImageContext.Provider>
  );
}

export { ImageProvider, ImageContext };
