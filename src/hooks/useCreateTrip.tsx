"use client";
import { useFormData } from "./useFormData";
import { useTripResponse } from "./useTripResponse";
import { useImage } from "./useImage";
import { createTripInDB } from "@/db/actions";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import ErrorToaster from "@/components/ui/ErrorToaster";
import CustomToaster from "@/components/ui/CustomToaster";
import { TripUrlParamsType } from "@/types";
import { toTripRow } from "@/lib/tripRow";

export function useCreateTrip(tripUrlParams: TripUrlParamsType) {
  const { formData } = useFormData();
  const { tripData: trip, setIsTripSaved } = useTripResponse();
  const { imageData } = useImage();
  const tripUrl = tripUrlParams.tripUrl;

  const {
    mutate: createTrip,
    isPending: isCreatingTrip,
    error: createTripError,
  } = useMutation({
    mutationKey: ["trips"],
    // The row is built in here, so a trip that can't be saved shows the error toast.
    mutationFn: (saved: boolean) =>
      createTripInDB(
        toTripRow({ formData, tripData: trip!, imageData, tripUrl: tripUrl ?? "", saved }),
      ),

    onError: (error) => {
      console.error(error);
      toast.custom(
        <ErrorToaster message="An error occured and your trip was not saved" />,
      );
    },
  });

  const handleYesAnswer = () => {
    createTrip(true, {
      onSuccess: () => {
        setIsTripSaved(true);
        toast.custom(<CustomToaster message="Your trip was saved" />);
      },
    });
  };

  const handleNoAnswer = () => {
    createTrip(false, {
      onSuccess: () => {
        setIsTripSaved(true);
        toast.custom(<ErrorToaster message="Trip was not saved" />);
      },
    });
  };
  return {
    createTrip,
    isCreatingTrip,
    createTripError,
    handleYesAnswer,
    handleNoAnswer,
  };
}
