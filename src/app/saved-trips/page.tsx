"use client";
import SavedTripsDisplay from "@/components/trips/SavedTripsDisplay";
import Container from "@/components/ui/Container";
import GradientBg from "@/components/ui/GradientBg";
import SavedTripsContainer from "@/components/trips/SavedTripsContainer";
import dynamic from "next/dynamic";

const DynamicSavedTripsDisplay = dynamic(
  () => import("@/components/trips/SavedTripsDisplay"),
  {
    ssr: false,
  },
);
function SavedTripsPage() {
  return (
    <>
      <DynamicSavedTripsDisplay />
    </>
  );
}

export default SavedTripsPage;
