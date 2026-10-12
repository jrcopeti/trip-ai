"use client";
import { notFound, useParams } from "next/navigation";
import { useSingleSavedTrip } from "@/hooks/useSingleSavedTrip";

import TripPage from "./TripPage";
import FinalSection from "./FinalSection";
import Loader from "../ui/Loader";
import ButtonBackOutlined from "../ui/ButtonBackOutlined";

function SavedTripsPageComponent() {
  const params = useParams();
  const { trip, isPendingSingleSavedTrip } = useSingleSavedTrip({ params });

  if (isPendingSingleSavedTrip) {
    return <Loader />;
  }

  if (!trip) {
    notFound();
  }

  return (
    <TripPage
      before={
        <div className="absolute inset-x-0 top-6 px-5 sm:px-8">
          <div className="mx-auto max-w-6xl">
            <ButtonBackOutlined position="relative" />
          </div>
        </div>
      }
      closing={<FinalSection />}
    />
  );
}

export default SavedTripsPageComponent;
