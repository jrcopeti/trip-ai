"use client";
import dynamic from "next/dynamic";

const DynamicTripResponse = dynamic(() => import("@/components/TripResponse"), {
  ssr: false,
});

function TripPage() {
  return (
    <div>
      <DynamicTripResponse />
    </div>
  );
}

export default TripPage;
