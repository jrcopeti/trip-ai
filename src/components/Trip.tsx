"use client";
import { fetchResponse } from "@/api/openai";
import { useTrip } from "@/hooks/useTrip";
import {
  useMutationState,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

function Trip() {
  const { tripData, isPending, error } = useTrip();
  console.log(tripData);

  if (isPending) {
    return <div>Loading trip page...</div>;
  }

  return (
    <div>
      DISPLAY DATA
      <p>{tripData?.userName}</p>
      <p>{tripData?.city}</p>
      <p>{tripData?.country}</p>
    </div>
  );
}

export default Trip;
