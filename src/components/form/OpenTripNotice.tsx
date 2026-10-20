"use client";
import Link from "next/link";
import { useOpenTrip } from "@/hooks/useOpenTrip";
import { tripPath } from "@/lib/generation";
import { openTrip as copy } from "./content";
import { smallInkPill } from "./styles";

/** The id "Plan my trip" is described by while it is held back. */
export const OPEN_TRIP_NOTICE = "open-trip-notice";

/**
 * Above every step while this browser's last trip is unanswered: why "Plan my trip" will be off,
 * and a way to that trip. The form stays usable, and its answers wait in the draft.
 */
function OpenTripNotice() {
  const tripUrl = useOpenTrip();
  if (!tripUrl) return null;

  return (
    <div className="mb-8 flex flex-col items-start gap-4 rounded-2xl bg-sorbet-lavender p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
      <p id={OPEN_TRIP_NOTICE} className="text-sm text-sorbet-ink sm:text-base">
        {copy.note}
      </p>
      <Link href={tripPath(tripUrl)} className={`shrink-0 ${smallInkPill}`}>
        {copy.view}
      </Link>
    </div>
  );
}

export default OpenTripNotice;
