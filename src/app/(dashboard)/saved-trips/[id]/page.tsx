'use client'
import { getSingleSavedTrip } from "@/actions/actions";
import { useQuery } from "@tanstack/react-query";

function SavedTripsPageId({
  params,
}: {
  params: { id: number | string };
}) {
  const {
    data: trip,
    isPending,
    error,
  } = useQuery({
    queryKey: ["trips", params.id],
    queryFn: () => getSingleSavedTrip(Number(params.id)),
  });
  return (
    <div>
      Saved Trips Page {params.id}
      <div>
        {isPending && <div>Loading single trip...</div>}

        {trip && (
          <div>
            <div>{trip.city}</div>
            <div>{trip.country}</div>
            <div>{trip.userName}</div>
            <div>{trip.imageUrl}</div>
          </div>
        )}
      </div>
    </div>
  );
}

export default SavedTripsPageId;
