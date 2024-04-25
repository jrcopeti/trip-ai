"use client";
import dynamic from "next/dynamic";
import TripResponse from "@/components/trips/TripResponse";

const DynamicTripResponse = dynamic(
  () => import("@/components/trips/TripResponse"),
  {
    ssr: false,
  },
);

function TripPage() {
  return (
    <>
      <DynamicTripResponse />
    </>
  );
}

export default TripPage;
