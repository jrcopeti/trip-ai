import { createTripInDB } from "@/db/actions";
import { Prisma } from "@prisma/client";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import ErrorToaster from "@/components/ui/ErrorToaster";

export function useCreateTrip() {
  const {
    mutate: createTrip,
    isPending: isCreatingTrip,
    error: createTripError,
  } = useMutation({
    mutationKey: ["trips"],
    mutationFn: (data: Prisma.TripCreateInput) => createTripInDB(data),

    onError: (error) => {
      console.log(error);
      toast.custom(
        <ErrorToaster message="An error occured and your trip was not saved" />,
      );
    },
  });
  return { createTrip, isCreatingTrip, createTripError };
}
