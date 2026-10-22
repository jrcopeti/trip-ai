"use client";
import Link from "next/link";
import type { Trip } from "@/generated/prisma/client";
import { useSaveTrip } from "@/hooks/useSaveTrip";
import defaultImage5 from "@/assets/travel-photos/9.jpg";
import { defaultPlaceholder } from "@/lib/constants";
import Closing, { buttonExtras, primaryPill, secondaryPill } from "./Closing";
import { closing as copy } from "./content";

type Props = Pick<Trip, "tripUrl" | "saved" | "placeholder" | "tip"> & { image?: string };

/**
 * The generated route's last section: keep the trip or not, then where next.
 * A saved row is already answered; a discarded one is still unsaved, so after a
 * refresh the question comes back, and yes still saves it.
 */
function SaveSection({ tripUrl, saved, image, placeholder, tip }: Props) {
  const { handleYesAnswer, handleNoAnswer, isSavingTrip, isAnswered } = useSaveTrip(tripUrl);
  const answered = saved || isAnswered;

  return (
    <Closing
      image={image ?? defaultImage5}
      placeholder={placeholder ?? defaultPlaceholder}
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
