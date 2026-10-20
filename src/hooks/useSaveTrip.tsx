"use client";
import { useRouter } from "next/navigation";
import { setTripSaved } from "@/db/actions";
import { useMutation } from "@tanstack/react-query";
import ErrorToaster from "@/components/ui/ErrorToaster";
import CustomToaster from "@/components/ui/CustomToaster";
import { showToast } from "@/components/ui/ToastCard";
import { forgetOpenTrip } from "@/lib/openTrip";

/**
 * The traveller's answer to "save this trip?": the row is already written, so only `saved` changes.
 * Either answer, once written, clears the trip as this browser's open one.
 */
export function useSaveTrip(tripUrl: string) {
  const router = useRouter();
  const {
    mutate: saveTrip,
    isPending: isSavingTrip,
    isSuccess: isAnswered,
    error: saveTripError,
  } = useMutation({
    mutationKey: ["trips"],
    mutationFn: (saved: boolean) => setTripSaved(tripUrl, saved),

    // The router cache still holds this page rendered with `saved: false`; without a
    // refresh, Back restores it and asks again, and answering throws (the row is saved).
    onSuccess: () => {
      // Either answer lets this browser plan its next trip.
      forgetOpenTrip(tripUrl);
      router.refresh();
    },

    onError: (error) => {
      console.error(error);
      showToast(
        <ErrorToaster message="An error occured and your trip was not saved" />,
      );
    },
  });

  const handleYesAnswer = () => {
    saveTrip(true, {
      onSuccess: () => {
        showToast(<CustomToaster message="Your trip was saved" />);
      },
    });
  };

  const handleNoAnswer = () => {
    saveTrip(false, {
      onSuccess: () => {
        showToast(<ErrorToaster message="Trip was not saved" />);
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
