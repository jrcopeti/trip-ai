"use client";
import dynamic from "next/dynamic";

const DynamicTripDetails = dynamic(() => import("@/components/TripDetails"), {
  ssr: false,
});

function TripPage() {
  return (
    <div>
      <DynamicTripDetails />
    </div>
  );
}

export default TripPage;
