"use client";
import { createContext } from "react";
import { useMutation } from "@tanstack/react-query";
import { fetchTripImage } from "@/app/api/unsplashApi";
import toast from "react-hot-toast";
import ErrorToaster from "@/components/ui/ErrorToaster";
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

    onSuccess: () => {
      console.log("Images generated successfully");
    },
    onError: (error) => {
      console.error(error);
      toast.custom(
        <ErrorToaster message="Images not found for the location provided" />,
      );
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
