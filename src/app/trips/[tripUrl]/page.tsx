"use client";
import dynamic from "next/dynamic";

const DynamicTripDetails = dynamic(
  () => import("@/components/pages/trips/TripDetails"),
  {
    ssr: false,
  },
);


function TripPage() {
  return (
    <div>
      <DynamicTripDetails />
    </div>
  );
}

export default TripPage;
