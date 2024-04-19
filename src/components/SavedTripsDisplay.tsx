"use client";
import { useSavedTrips } from "@/hooks/useSavedTrips";
import SavedTripCard from "./ui/SavedTripCard";

function SavedTripsDisplay() {
  const { savedTrips, isPendingSavedTrips, savedTripsError } = useSavedTrips();
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

export default SavedTripsDisplay;
