"use client";
import { useEffect, useState } from "react";
import SavedTripsDisplay from "@/components/trips/SavedTripsDisplay";
import dynamic from "next/dynamic";
import Loader from "@/components/ui/Loader";

const DynamicSavedTripsDisplay = dynamic(
  () => import("@/components/trips/SavedTripsDisplay"),
  {
    ssr: false,
  },
);
function SavedTripsPage() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    return () => {
      clearTimeout(timer);
    };
  }, []);
  return (
    <>
      {isLoading && <Loader />}
      <DynamicSavedTripsDisplay />
    </>
  );
}

export default SavedTripsPage;
