"use client";
import { useFormData } from "./useFormData";
import { useTripResponse } from "./useTripResponse";
import { useImage } from "./useImage";
import { createTripInDB } from "@/db/actions";
import { Prisma } from "@prisma/client";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import ErrorToaster from "@/components/ui/ErrorToaster";
import CustomToaster from "@/components/ui/CustomToaster";
import { TripUrlParamsType } from "@/types";

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
    mutationFn: (data: Prisma.TripCreateInput) => createTripInDB(data),

    onError: (error) => {
      console.error(error);
      toast.custom(
        <ErrorToaster message="An error occured and your trip was not saved" />,
      );
    },
  });

  const handleYesAnswer = () => {
    const finalData = {
      ...trip,
      ...formData,
      startDate: new Date(formData.startDate),
      endDate: new Date(formData.endDate),
      image: imageData?.tripImage ?? null,
      image2: imageData?.tripImage2 ?? null,
      image3: imageData?.tripImage3 ?? null,
      image4: imageData?.tripImage4 ?? null,
      image5: imageData?.tripImage5 ?? null,
      placeholder: imageData?.placeholder ?? null,
      tripUrl,
      saved: true,
    };

    createTrip(finalData as Prisma.TripCreateInput, {
      onSuccess: () => {
        setIsTripSaved(true);
        toast.custom(<CustomToaster message="Your trip was saved" />);
      },
    });
  };

  const handleNoAnswer = () => {
    const finalData = {
      ...trip,
      ...formData,
      startDate: new Date(formData.startDate),
      endDate: new Date(formData.endDate),
      image: imageData?.tripImage ?? null,
      image2: imageData?.tripImage2 ?? null,
      image3: imageData?.tripImage3 ?? null,
      image4: imageData?.tripImage4 ?? null,
      image5: imageData?.tripImage5 ?? null,
      tripUrl,
      saved: false,
    };
    createTrip(finalData as Prisma.TripCreateInput, {
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
