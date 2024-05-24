"use client";
import { useScrollingSavedTrips } from "@/hooks/useScrollingSavedTrips";
import { useSavedTrips } from "@/hooks/useSavedTrips";

import { Input } from "@nextui-org/react";
import SavedTripCard from "./SavedTripCard";
import ErrorComponent from "../ui/NotFoundComponent";

import { PuffLoader } from "react-spinners";
import { BiMessageSquareError } from "react-icons/bi";

function SavedTripsDisplay() {
  const {
    savedTrips,
    isPendingSavedTrips,
    savedTripsError,
    setSearchTerm,
    searchTerm,
  } = useSavedTrips();
  useScrollingSavedTrips(savedTrips, isPendingSavedTrips);

  if (savedTripsError) {
    return (
      <ErrorComponent
        message="There was an error fetching saved trips. Please try again."
        path="/"
        button="Back to Home"
      />
    );
  }

  return (
    <div className="mt-2 flex flex-col items-center gap-10 py-2 lg:px-16 lg:py-4">
      <h1 className="text-5xl font-bold text-tuna-900">Saved Trips</h1>

      <Input
        type="text"
        id="userName"
        className="w-[70%] max-w-lg text-tuna-700 lg:text-2xl"
        label="Search for a trip"
        placeholder="A city, country or user name"
        radius="sm"
        size="lg"
        variant="faded"
        color="primary"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      {savedTrips?.length === 0 && (
        <h2 className="flex items-center gap-2 text-2xl font-semibold text-tuna-900">
          <BiMessageSquareError color="#c2150c" /> No trips found
        </h2>
      )}

      {isPendingSavedTrips ? (
        <PuffLoader size={80} color="#4e888c" />
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 2xl:gap-8 pb-8 ">
          {savedTrips?.map((trip) => (
            <SavedTripCard key={trip.id} trip={trip} />
          ))}
        </div>
      )}
    </div>
  );
}

export default SavedTripsDisplay;
