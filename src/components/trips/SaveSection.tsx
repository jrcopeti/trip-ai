"use client";
import Link from "next/link";
import type { Trip } from "@/generated/prisma/client";
import { useSaveTrip } from "@/hooks/useSaveTrip";
import Closing, { buttonExtras, primaryPill, secondaryPill } from "./Closing";
import { closing as copy } from "./content";
import type { TripPhoto } from "./tripPhoto";

type Props = Pick<Trip, "tripUrl" | "saved" | "tip"> & { photo: TripPhoto };

/**
 * The generated route's last section: keep the trip or not, then where next.
 * A saved row is already answered; a discarded one is still unsaved, so after a
 * refresh the question comes back, and yes still saves it.
 */
function SaveSection({ tripUrl, saved, photo, tip }: Props) {
  const { handleYesAnswer, handleNoAnswer, isSavingTrip, isAnswered } = useSaveTrip(tripUrl);
  const answered = saved || isAnswered;

  return (
    <Closing
      image={photo.src}
      placeholder={photo.blurDataURL}
      tip={tip}
      heading={answered ? copy.saved.heading : copy.save.question}
    >
      {!answered ? (
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
