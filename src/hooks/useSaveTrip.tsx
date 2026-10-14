"use client";
import { setTripSaved } from "@/db/actions";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import ErrorToaster from "@/components/ui/ErrorToaster";
import CustomToaster from "@/components/ui/CustomToaster";

/** The traveller's answer to "save this trip?": the row is already written, so only `saved` changes. */
export function useSaveTrip(tripUrl: string) {
  const {
    mutate: saveTrip,
    isPending: isSavingTrip,
    isSuccess: isAnswered,
    error: saveTripError,
  } = useMutation({
    mutationKey: ["trips"],
    mutationFn: (saved: boolean) => setTripSaved(tripUrl, saved),

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
        toast.custom(<CustomToaster message="Your trip was saved" />);
      },
    });
  };

  const handleNoAnswer = () => {
    saveTrip(false, {
      onSuccess: () => {
        toast.custom(<ErrorToaster message="Trip was not saved" />);
      },
    });
  };
  return {
    isSavingTrip,
    isAnswered,
    saveTripError,
    handleYesAnswer,
    handleNoAnswer,
  };
}
