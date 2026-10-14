"use client";
import { useTripResponse } from "./useTripResponse";
import { setTripSaved } from "@/db/actions";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import ErrorToaster from "@/components/ui/ErrorToaster";
import CustomToaster from "@/components/ui/CustomToaster";

/** The traveller's answer to "save this trip?": the row is already written, so only `saved` changes. */
export function useSaveTrip() {
  const { tripData: trip, setIsTripSaved } = useTripResponse();

  const {
    mutate: saveTrip,
    isPending: isSavingTrip,
    error: saveTripError,
  } = useMutation({
    mutationKey: ["trips"],
    mutationFn: (saved: boolean) => {
      if (!trip) throw new Error("No trip to answer for");
      return setTripSaved(trip.tripUrl, saved);
    },

    onError: (error) => {
      console.error(error);
      toast.custom(
        <ErrorToaster message="An error occured and your trip was not saved" />,
      );
    },
  });

  const handleYesAnswer = () => {
    saveTrip(true, {
      onSuccess: () => {
        setIsTripSaved(true);
        toast.custom(<CustomToaster message="Your trip was saved" />);
      },
    });
  };

  const handleNoAnswer = () => {
    saveTrip(false, {
      onSuccess: () => {
        setIsTripSaved(true);
        toast.custom(<ErrorToaster message="Trip was not saved" />);
      },
    });
  };
  return {
    isSavingTrip,
    saveTripError,
    handleYesAnswer,
    handleNoAnswer,
  };
}
