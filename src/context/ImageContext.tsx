"use client";

import { fetchTripImage } from "@/api/unsplashApi";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { createContext } from "react";

interface ImageContextType {
  imageData: any;
  generateImage: (city: string) => void;
  isPendingImage: boolean;
  errorImage: any;
}

const defaultContextValue: ImageContextType = {
  imageData: null,
  generateImage: () => {},
  isPendingImage: false,
  errorImage: null,
};

const ImageContext = createContext<ImageContextType>(defaultContextValue);

function ImageProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  const {
    mutate: generateImage,
    data: imageData,
    isPending: isPendingImage,
    error: errorImage,
  } = useMutation({
    mutationKey: ["image"],
    mutationFn: (city: string) => fetchTripImage(city),

    onSuccess: () => {
      console.log("success Image ");
      // router.push("/trip");
    },
    onError: (error) => {
      console.log(error);
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
