"use client";

import { motion } from "framer-motion";

import image1 from "@/assets/travel-photos/1.jpg";
import type { LatestTrip } from "@/db/actions";
import { defaultPlaceholder } from "@/lib/constants";
import Polaroid from "@/components/sorbet/Polaroid";
import { useIntro } from "./IntroContext";
import { heroDeckLabel } from "./content";

/**
 * Stacking for the deck below `md`, where the cards overlap in a column: each
 * sits *under* the one before, so the overlap hides the top of a photo rather
 * than the caption on the lip above it.
 */
const stack = ["z-30", "z-20", "z-10"];

type Props = {
  /** The latest saved trips, newest first; up to three, and possibly none. */
  trips: LatestTrip[];
};

/**
 * The hero's deck: the product's output, the latest trips people kept. Its
 * cards wait for the intro's curtain to lift; streamed in after it has, they
 * deal in on arrival.
 */
function HeroDeck({ trips }: Props) {
  const { done: introDone } = useIntro();

  if (trips.length === 0) return null;

  return (
    <ul
      aria-label={heroDeckLabel}
      className="mt-16 flex flex-col items-center md:mt-20 md:flex-row md:items-end md:justify-center"
    >
      {trips.map((trip, i) => (
        <motion.li
          key={trip.id}
          initial={{ opacity: 0, y: 28 }}
          animate={introDone ? { opacity: 1, y: 0 } : { opacity: 0, y: 28 }}
          transition={{ duration: 0.6, delay: 0.3 + 0.15 * i, ease: [0.22, 1, 0.36, 1] }}
          className={`relative ${stack[i]} ${i > 0 ? "-mt-20 md:ml-5 md:mt-0" : ""} w-60 md:w-64`}
        >
          <Polaroid
            href={`/saved-trips/${trip.id}`}
            image={trip.image ?? image1}
            placeholder={trip.placeholder ?? defaultPlaceholder}
            caption={`${trip.city.trim()}, ${trip.country}`}
            username={trip.userName}
            index={i}
          />
        </motion.li>
      ))}
    </ul>
  );
}

export default HeroDeck;
