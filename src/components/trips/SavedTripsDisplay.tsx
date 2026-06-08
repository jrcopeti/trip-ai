"use client";
import { useScrollingSavedTrips } from "@/hooks/useScrollingSavedTrips";
import { useSavedTrips } from "@/hooks/useSavedTrips";

import { TextField, Label, Input } from "@heroui/react";
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

      <TextField
        value={searchTerm}
        onChange={setSearchTerm}
        className="w-[70%] max-w-lg"
      >
        <Label className="text-tuna-700 lg:text-2xl">Search for a trip</Label>
        <Input
          type="text"
          placeholder="A city, country or user name"
          className="text-tuna-700"
        />
      </TextField>

      {savedTrips?.length === 0 && (
        <h2 className="flex items-center gap-2 text-2xl font-semibold text-tuna-900">
          <BiMessageSquareError color="#c2150c" /> No trips found
        </h2>
      )}

      {isPendingSavedTrips ? (
        <PuffLoader size={80} color="#4e888c" />
      ) : (
        <div className="grid grid-cols-1 gap-6 pb-8 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 2xl:gap-8">
          {savedTrips?.map((trip) => (
            <SavedTripCard key={trip.id} trip={trip} />
          ))}
        </div>
      )}
    </div>
  );
}

export default SavedTripsDisplay;
