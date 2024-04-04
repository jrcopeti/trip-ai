"use client";
import { createTripInDB } from "@/db/actions";
import { useImage } from "@/hooks/useImage";
import { useFormData } from "@/hooks/useFormData";
import { useTrip } from "@/hooks/useTrip";
import { Button } from "@nextui-org/react";
import {
  useMutation,
  useMutationState,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import Image from "next/image";
import { notFound } from "next/navigation";

function TripDetails() {
  const { tripData, isPendingResponseAI, errorResponseAI } = useTrip();
  const { formData } = useFormData();
  const { imageData, isPendingImage } = useImage();
  console.log("Form Data in Trip", formData);
  console.log("trip Data in Trip", tripData);

  const {
    mutate: createTrip,

    isPending: isCreatingTrip,
    error: createTripError,
  } = useMutation({
    mutationKey: ["trips"],
    mutationFn: (data) => createTripInDB(data),

    onSuccess: (responseData) => {
      console.log("success createTrip ");
      alert("Trip created successfully");
    },
    onError: (error) => {
      console.log(error);
    },
  });

  if (isPendingResponseAI) {
    return <div>Loading repsonse AI</div>;
  }

  if (isPendingImage) {
    return <div>Loading image...</div>;
  }

  if (!tripData) {
    notFound();
  }

  console.log(imageData, "imageData");

  const handleYesAnswer = () => {
    const saved = true;
    const finalData = {
      ...tripData,
      ...formData,
      image: imageData.tripImage,
      image2: imageData.tripImage2,
      image3: imageData.tripImage3,
      placeholder: imageData.placeholder,
      placeholder2: imageData.placeholder2,
      placeholder3: imageData.placeholder3,
      saved,
    };
    console.log("finalDataYES", finalData);

    createTrip(finalData);
  };

  const handleNoAnswer = () => {
    console.log("formDataNO", formData);
    const finalData = {
      ...formData,
      image: imageData.tripImage,
      image2: imageData.tripImage2,
      image3: imageData.tripImage3,
    };
    createTrip(finalData);
  };

  return (
    <div>
      DISPLAY DATA
      <p>{tripData?.userName}</p>
      <p>{tripData?.city}</p>
      <p>{tripData?.country}</p>
      <Button onClick={handleYesAnswer}>Do you want to save your trip?</Button>
      <Button onClick={handleNoAnswer}>No</Button>
      {imageData.tripImage && (
        <div>
          <Image
            src={imageData?.tripImage}
            width={500}
            height={400}
            alt={formData.city}
            priority
            className="mb-16 h-96 rounded-xl object-cover shadow-xl"
            placeholder="blur"
            blurDataURL={imageData?.placeholder}
          />
        </div>
      )}
      <Image
        src={formData?.flagUrl}
        width={30}
        height={30}
        alt={formData.country}
        priority
        className="mb-16 rounded-xl object-cover shadow-xl"
      />
    </div>
  );
}

export default TripDetails;
