import { getSingleSavedTrip } from "@/db/actions";
import { Params } from "@/types";
import { useQuery } from "@tanstack/react-query";

export function useSingleSavedTrip({ params }: { params: Params }) {
  const {
    data: trip,
    isPending: isPendingSingleSavedTrip,
    error: errorSingleSavedTrip,
  } = useQuery({
    queryKey: ["trips", params.id],
    queryFn: () => getSingleSavedTrip(Number(params.id)),
  });
  return { trip, isPendingSingleSavedTrip, errorSingleSavedTrip };
}
