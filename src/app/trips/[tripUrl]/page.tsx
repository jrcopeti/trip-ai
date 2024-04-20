"use client";
import dynamic from "next/dynamic";
import TripResponse from "@/components/TripResponse";
import { useEffect, useState } from "react";
import Loader from "@/components/ui/Loader";

const DynamicTripResponse = dynamic(() => import("@/components/TripResponse"), {
  ssr: false,
});


function TripPage() {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <>

      <DynamicTripResponse />
    </>
  );
}

export default TripPage;
