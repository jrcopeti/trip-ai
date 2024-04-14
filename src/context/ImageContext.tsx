"use client";

import { fetchTripImage } from "@/api/unsplashApi";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { createContext } from "react";

interface ImageData {
  tripImage: string | null;
  tripImage2: string | null;
  tripImage3: string | null;
  tripImage4: string | null;
  tripImage5: string | null;
  placeholder: string | null;
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

    onSuccess: (data) => {
      console.log(data);
      console.log("success Image Image Context ");
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
