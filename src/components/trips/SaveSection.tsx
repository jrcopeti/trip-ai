"use client";
import Link from "next/link";
import { useTripResponse } from "@/hooks/useTripResponse";
import { useSaveTrip } from "@/hooks/useSaveTrip";
import defaultImage5 from "@/assets/travel-photos/9.jpg";
import { defaultPlaceholder } from "@/lib/constants";
import Closing, { buttonExtras, primaryPill, secondaryPill } from "./Closing";
import { closing as copy } from "./content";

/** The generated route's last section: keep the trip or not, then where next. */
function SaveSection() {
  const { tripData: response, isTripSaved } = useTripResponse();
  const { handleYesAnswer, handleNoAnswer, isSavingTrip } = useSaveTrip();

  return (
    <Closing
      image={response?.tripImages[4] ?? defaultImage5}
      placeholder={response?.placeholder ?? defaultPlaceholder}
      tip={response?.tip}
      heading={isTripSaved ? copy.saved.heading : copy.save.question}
    >
      {!isTripSaved ? (
        <>
          <button
            type="button"
            onClick={handleYesAnswer}
            disabled={isSavingTrip}
            className={`${primaryPill} ${buttonExtras}`}
          >
            {copy.save.yes}
          </button>
          <button
            type="button"
            onClick={handleNoAnswer}
            disabled={isSavingTrip}
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
