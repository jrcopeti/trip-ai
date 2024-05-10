"use client";
import { useEffect, useState } from "react";
import SavedTripsDisplay from "@/components/trips/SavedTripsDisplay";
import dynamic from "next/dynamic";
import Loader from "@/components/ui/Loader";
import {
  HydrationBoundary,
  QueryClient,
  dehydrate,
} from "@tanstack/react-query";

const DynamicSavedTripsDisplay = dynamic(
  () => import("@/components/trips/SavedTripsDisplay"),
  {
    ssr: false,
  },
);
function SavedTripsPage() {
  const queryClient = new QueryClient();

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);
    return () => {
      clearTimeout(timer);
    };
  }, []);
  return (
    <>
      {/* {isLoading && <Loader />} */}
      <HydrationBoundary state={dehydrate(queryClient)}>
        <SavedTripsDisplay />
      </HydrationBoundary>
    </>
  );
}

export default SavedTripsPage;
