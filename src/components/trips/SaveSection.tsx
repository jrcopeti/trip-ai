"use client";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useTripResponse } from "@/hooks/useTripResponse";
import { useImage } from "@/hooks/useImage";
import { useCreateTrip } from "@/hooks/useCreateTrip";
import defaultImage5 from "@/assets/travel-photos/9.jpg";
import { defaultPlaceholder } from "@/lib/constants";
import Closing, { buttonExtras, primaryPill, secondaryPill } from "./Closing";
import { closing as copy } from "./content";

/** The generated route's last section: keep the trip or not, then where next. */
function SaveSection() {
  const tripUrlParams = useParams();
  const { tripData: response, isTripSaved } = useTripResponse();
  const { handleYesAnswer, handleNoAnswer, isCreatingTrip } =
    useCreateTrip(tripUrlParams);
  const { imageData } = useImage();

  return (
    <Closing
      image={imageData?.tripImages[4] ?? defaultImage5}
      placeholder={imageData?.placeholder ?? defaultPlaceholder}
      tip={response?.tip}
      heading={isTripSaved ? copy.saved.heading : copy.save.question}
    >
      {!isTripSaved ? (
        <>
          <button
            type="button"
            onClick={handleYesAnswer}
            disabled={isCreatingTrip}
            className={`${primaryPill} ${buttonExtras}`}
          >
            {copy.save.yes}
          </button>
          <button
            type="button"
            onClick={handleNoAnswer}
            disabled={isCreatingTrip}
            className={`${secondaryPill} ${buttonExtras}`}
          >
            {copy.save.no}
          </button>
        </>
      ) : (
        <>
          <Link href={copy.saved.view.href} className={primaryPill}>
            {copy.saved.view.label}
          </Link>
          <Link href={copy.saved.another.href} className={secondaryPill}>
            {copy.saved.another.label}
          </Link>
        </>
      )}
    </Closing>
  );
}

export default SaveSection;
