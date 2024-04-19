import { getAllTrips } from "@/db/actions";
import { useQuery } from "@tanstack/react-query";

export function useSavedTrips() {
  const {
    data: savedTrips,
    isPending: isPendingSavedTrips,
    error: savedTripsError,
  } = useQuery({
    queryKey: ["trips"],
    queryFn: () => getAllTrips(),
  });

  return { savedTrips, isPendingSavedTrips, savedTripsError };
}
