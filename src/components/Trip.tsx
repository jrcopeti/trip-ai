"use client";
import { createTripInDB } from "@/actions/actions";
import { fetchResponse } from "@/api/openai";
import { useFormData } from "@/hooks/useFormData";
import { useTrip } from "@/hooks/useTrip";
import { Button } from "@nextui-org/react";
import {
  useMutation,
  useMutationState,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

function Trip() {
  const { tripData, isPending, error } = useTrip();
  const { formData } = useFormData();
  console.log("Form Data in Trip", formData);
  console.log("trip Data in Trip", tripData);

  const {
    mutate: createTrip,

    isPending: isCreatingTrip,
    error: createTripError,
  } = useMutation({
    mutationKey: ["createTrip"],
    mutationFn: (data) => createTripInDB(data),

    onSuccess: (responseData) => {
      console.log("success createTrip ");
      alert("Trip created successfully");
    },
    onError: (error) => {
      console.log(error);
    },
  });

  if (isPending) {
    return <div>Loading trip page...</div>;
  }

  const handleSaveTrip = () => {
    console.log("clicked");
    const finalData = {
      ...tripData,
      ...formData,
    };
    console.log("finalData", finalData);

    createTrip(finalData);
  };

  return (
    <div>
      DISPLAY DATA
      <p>{tripData?.userName}</p>
      <p>{tripData?.city}</p>
      <p>{tripData?.country}</p>
      <Button onClick={handleSaveTrip}>Do you want to save your trip?</Button>
    </div>
  );
}

export default Trip;
