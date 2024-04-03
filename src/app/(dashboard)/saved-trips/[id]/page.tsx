"use client";
import { getSingleSavedTrip } from "@/actions/actions";
import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import Image from "next/image";

function SavedTripsPageId({ params }: { params: { id: number | string } }) {
  const {
    data: trip,
    isPending,
    error,
  } = useQuery({
    queryKey: ["trips", params.id],
    queryFn: () => getSingleSavedTrip(Number(params.id)),
  });

  const formattedStartDate = dayjs(trip?.startDate).format("DD MMM YYYY");
  const formattedEndDate = dayjs(trip?.endDate).format("DD MMM YYYY");

  return (
    <div>
      Saved Trips Page {params.id}
      <div>
        {isPending && <div>Loading single trip...</div>}

        <div className="grid grid-cols-3">
          <div>{trip?.userName}</div>
          <div>{trip?.city}</div>
          <div>{trip?.country}</div>
          <div>{formattedStartDate}</div>
          <div>{formattedEndDate}</div>
          <div>{trip?.luggageSize}</div>
          <div>{trip?.accommodation}</div>
          {(trip?.requiredItems as string[])?.map((item: string) => (
            <ul className="text-violay-600" key={item}>
              <li>{item}</li>
            </ul>
          ))}

          {(trip?.interests as string[])?.map((interest: string) => (
            <ul className="text-neptune-500" key={interest}>
              <li>{interest}</li>
            </ul>
          ))}

          <div> {trip?.note}</div>
          <div>{trip?.budget}</div>
          <div>
            <Image src={trip?.flagUrl} alt="flag" width={50} height={50} />{" "}
          </div>

          <div>
            <Image src={trip?.imageUrl} alt="flag" width={400} height={300} />{" "}
          </div>

          <div> title: {trip?.title}</div>
          <div className="text-deeporange-500">
            description: {trip?.description}
          </div>
        </div>

        {(trip?.objectsList as any)?.map((object: any) => (
          <ul key={object.item}>
            <li>{object.quantity}</li>
            <li>{object.item}</li>
            <li>{object.description}</li>
          </ul>
        ))}

        {(trip?.mustHave as string[])?.map((mustHave) => (
          <ul key={mustHave}>
            <li>{mustHave}</li>
          </ul>
        ))}
        {(trip?.tours as string[])?.map((tour) => (
          <ul key={tour}>
            <li>{tour}</li>
          </ul>
        ))}
      </div>
    </div>
  );
}

export default SavedTripsPageId;
