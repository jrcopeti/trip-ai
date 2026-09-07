"use client";

import Link from "next/link";
import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

import { BsCompass } from "react-icons/bs";
import { TbBackpack } from "react-icons/tb";
import { LuTreePalm } from "react-icons/lu";

import StickerBadge from "./StickerBadge";
import Squiggle from "./Squiggle";
import TripCard from "./TripCard";
import { heroDeck } from "./content";

/** Fan angles for the deck, outer cards tilted away from centre. */
const fan = ["-rotate-3 md:-rotate-4", "rotate-2 md:rotate-0 md:-translate-y-4", "-rotate-1 md:rotate-4"];

function Hero() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  // Stickers drift at different rates so the hero has depth as it leaves.
  //
  // Parallax is a MotionValue bound to `style`, not an animation, so MotionConfig's
  // reduced-motion handling does not cover it. The `parallax-drift` class carries a
  // `transform: none !important` rule under prefers-reduced-motion (see globals.css),
  // which beats the inline transform without needing a client-only hook here.
  const slow = useTransform(scrollYProgress, [0, 1], [0, 90]);
  const fast = useTransform(scrollYProgress, [0, 1], [0, 170]);

  return (
    <section ref={ref} className="relative overflow-hidden bg-buddy-canvas">
      {/* Stickers — decorative, hidden below md where they would crowd the type. */}
      <motion.div
        style={{ y: slow }}
        className="parallax-drift absolute left-[4%] top-28 hidden md:block"
      >
        <StickerBadge label="go anywhere" icon={<BsCompass />} tint="text-buddy-cyan" size={104} />
      </motion.div>
      <motion.div
        style={{ y: fast }}
        className="parallax-drift absolute right-[6%] top-20 hidden md:block"
      >
        <StickerBadge
          label="take it easy"
          icon={<LuTreePalm />}
          tint="text-buddy-lime"
          size={120}
          spin={-30}
        />
      </motion.div>
      <motion.div
        style={{ y: slow }}
        className="parallax-drift absolute right-[8%] top-[38%] hidden lg:block"
      >
        <StickerBadge
          label="pack light"
          icon={<TbBackpack />}
          tint="text-buddy-orchid"
          size={92}
          spin={34}
        />
      </motion.div>

      <div className="relative mx-auto max-w-6xl px-5 pb-24 pt-10 sm:px-8 md:pt-16">
        <p className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/70 px-4 py-2 text-sm font-medium text-buddy-ink">
          <span className="size-2 rounded-full bg-buddy-indigo" aria-hidden />
          Your new travel friend
        </p>

        <h1 className="max-w-5xl text-[clamp(2.75rem,7vw,5.5rem)] leading-[0.96] tracking-[-0.03em] text-buddy-ink">
          <span className="block font-extrabold">Plan the trip.</span>
          <span className="block font-medium">Pack for the weather.</span>
        </h1>

        <Squiggle className="mt-8 h-16 w-24 text-buddy-ink md:h-20 md:w-32" />

        <div className="mt-6 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <p className="max-w-md text-lg leading-relaxed text-buddy-ink/75 md:text-xl">
            Describe where you are headed. Trip AI writes the itinerary, the
            tours worth doing, and a packing list that already knows the
            forecast.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/form"
              className="rounded-full bg-buddy-ink px-7 py-4 text-base font-semibold text-buddy-offwhite transition-transform hover:scale-[1.03] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-buddy-ink"
            >
              Plan a trip
            </Link>
            <Link
              href="/saved-trips"
              className="rounded-full bg-buddy-lime px-7 py-4 text-base font-semibold text-buddy-ink transition-transform hover:scale-[1.03] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-buddy-ink"
            >
              See saved trips
            </Link>
          </div>
        </div>

        {/* The deck stands in for the product surface: what Trip AI hands back. */}
        <div className="mt-16 flex flex-col items-center md:mt-20 md:flex-row md:items-end md:justify-center">
          {heroDeck.map((card, i) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.15 * i, ease: [0.22, 1, 0.36, 1] }}
              className={`${fan[i]} ${i > 0 ? "-mt-20 md:ml-5 md:mt-0" : ""} w-60 shadow-[0_18px_40px_-24px_rgba(48,46,45,0.55)] transition-transform duration-300 hover:-translate-y-2 md:w-64`}
            >
              <TripCard card={card} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Hero;
