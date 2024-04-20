"use client";
import dynamic from "next/dynamic";
import TripResponse from "@/components/TripResponse";

const DynamicTripResponse = dynamic(() => import("@/components/TripResponse"), {
  ssr: false,
});

function TripPage() {
  return (
    <>
      <DynamicTripResponse />
    </>
  );
}

export default TripPage;
