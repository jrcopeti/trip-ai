"use client";

import { fetchTripImage } from "@/app/api/unsplashApi";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { createContext } from "react";
import type { ImageContextType } from "@/types";
import toast from "react-hot-toast";
import ErrorToaster from "@/components/ui/ErrorToaster";

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
      console.log("success Image Context ");
    },
    onError: (error) => {
      console.log(error);
      toast.custom(
        <ErrorToaster message="There was an error generating the image" />,
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
