"use client";

import { motion } from "framer-motion";

import type { LatestTrip } from "@/db/actions";
import Polaroid from "@/components/sorbet/Polaroid";
import { tripPhoto } from "@/components/trips/tripPhoto";
import { useIntro } from "./IntroContext";
import { hero } from "./content";

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
      aria-label={hero.deck.label}
      className="mt-16 flex flex-col items-center md:mt-20 md:flex-row md:items-end md:justify-center"
    >
      {trips.map((trip, i) => {
        const photo = tripPhoto(trip, "title");
        return (
          <motion.li
            key={trip.id}
            initial={{ opacity: 0, y: 28 }}
            animate={introDone ? { opacity: 1, y: 0 } : { opacity: 0, y: 28 }}
            transition={{ duration: 0.6, delay: 0.3 + 0.15 * i, ease: [0.22, 1, 0.36, 1] }}
            className={`relative ${i > 0 ? "mt-8 md:ml-5 md:mt-0" : ""} w-60 md:w-64`}
          >
            <Polaroid
              href={`/saved-trips/${trip.id}`}
              image={photo.src}
              placeholder={photo.blurDataURL}
              caption={`${trip.city.trim()}, ${trip.country}`}
              username={trip.userName}
              index={i}
            />
          </motion.li>
        );
      })}
    </ul>
  );
}

export default HeroDeck;
