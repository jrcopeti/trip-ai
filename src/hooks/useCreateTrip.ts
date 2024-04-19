import { createTripInDB } from "@/db/actions";
import { Prisma } from "@prisma/client";
import { useMutation } from "@tanstack/react-query";

export function useCreateTrip() {
  const {
    mutate: createTrip,
    isPending: isCreatingTrip,
    error: createTripError,
  } = useMutation({
    mutationKey: ["trips"],
    mutationFn: (data: Prisma.TripCreateInput) => createTripInDB(data),

    onSuccess: () => {
      console.log("success createTrip ");
      alert("Trip created successfully");
    },
    onError: (error) => {
      console.log(error);
    },
  });
  return { createTrip, isCreatingTrip, createTripError };
}
