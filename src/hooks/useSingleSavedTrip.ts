import { getSingleSavedTrip } from "@/db/actions";
import { useQuery } from "@tanstack/react-query";

export function useSingleSavedTrip({ params }: { params: { id: number | string }}) {
  const {
    data: trip,
    isPending,
    error,
  } = useQuery({
    queryKey: ["trips", params.id],
    queryFn: () => getSingleSavedTrip(Number(params.id)),
  });
  return { trip, isPending, error };
}
