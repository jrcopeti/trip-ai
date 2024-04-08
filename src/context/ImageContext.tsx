"use client";

import { fetchTripImage } from "@/api/unsplashApi";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { createContext } from "react";

interface ImageData {
  tripImage: string;
  tripImage2: string;
  tripImage3: string;
  tripImage4: string;
  placeholder: string;
}

interface ImageContextType {
  imageData: ImageData | undefined;
  generateImage: (city: string) => void;
  isPendingImage: boolean;
  errorImage: unknown;
}

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
