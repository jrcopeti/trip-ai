"use client";
import { getAllTrips } from "@/db/actions";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import SavedTripCard from "./SavedTripCard";

function SavedTripsComponent() {
  const {
    data: savedTrips,
    isPending: isPendingSavedTrips,
    error: savedTripsError,
  } = useQuery({
    queryKey: ["trips"],
    queryFn: () => getAllTrips(),
  });
  console.log("savedTrips", savedTrips);
  if (isPendingSavedTrips) {
    return <div>Loading saved trips...</div>;
  }
  return (
    <div>
      Saved Trips Page
      <div className="grid grid-cols-2 gap-8 lg:grid-cols-4">
        {savedTrips?.map((trip) => {
          return <SavedTripCard key={trip.id} trip={trip} />;
        })}
      </div>
    </div>
  );
}

export default SavedTripsComponent;
