import { useContext } from "react";
import { ImageContext } from "@/context/ImageContext";

export function useImage() {
  const context = useContext(ImageContext);
  if (!context) {
    throw new Error("useImage must be used within a ImagePrivider");
  }
  return context;
}
