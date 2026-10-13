"use client";

import Link from "next/link";
import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

import { BsCompass } from "react-icons/bs";
import { TbBackpack } from "react-icons/tb";
import { LuTreePalm } from "react-icons/lu";

import image1 from "@/assets/travel-photos/1.jpg";
import type { LatestTrip } from "@/db/actions";
import { defaultPlaceholder } from "@/lib/constants";
import { useIntro } from "./IntroContext";
import Polaroid from "@/components/sorbet/Polaroid";
import StickerBadge from "@/components/sorbet/StickerBadge";
import Squiggle from "./Squiggle";
import { heroDeckLabel, heroEyebrow } from "./content";


type Props = {
  /** The latest saved trips, newest first; up to three, and possibly none. */
  trips: LatestTrip[];
};

function Hero({ trips }: Props) {
  const ref = useRef<HTMLElement>(null);
  const { done: introDone } = useIntro();
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
    <section ref={ref} className="relative overflow-hidden bg-sorbet-canvas">
      {/* Stickers — decorative, hidden below md where they would crowd the type. */}
      {/* This one sits in the left gutter, beside the heading: its right edge is a
          1rem short of the content column (half of max-w-6xl, less the sm:px-8
          gutter), so it is placed from the centre, not the viewport edge. The
          gutter only fits its 104px from 85rem; below that it would sit on
          "Plan the trip.", so it is hidden. */}
      <motion.div
        style={{ y: slow }}
        className="parallax-drift absolute left-[calc(50%-41.5rem)] top-28 hidden min-[85rem]:block"
      >
        <StickerBadge label="go anywhere" icon={<BsCompass />} tint="text-sorbet-cyan" size={104} />
      </motion.div>
      <motion.div
        style={{ y: fast }}
        className="parallax-drift absolute right-[6%] top-20 hidden md:block"
      >
        <StickerBadge
          label="take it easy"
          icon={<LuTreePalm />}
          tint="text-sorbet-lime"
          size={120}
          spin={-30}
        />
      </motion.div>
      <motion.div
        style={{ y: slow }}
        className="parallax-drift absolute right-[8%] top-76 hidden lg:block"
      >
        <StickerBadge
          label="pack light"
          icon={<TbBackpack />}
          tint="text-sorbet-orchid"
          size={92}
          spin={34}
        />
      </motion.div>

      <div className="relative mx-auto max-w-6xl px-5 pb-24 pt-10 sm:px-8 md:pt-16">
        <p className="mb-6 text-sm font-medium uppercase tracking-[0.18em] text-sorbet-ink/50">
          {heroEyebrow}
        </p>

        <h1 className="max-w-5xl text-[clamp(2.75rem,7vw,5.5rem)] leading-[0.96] tracking-[-0.03em] text-sorbet-ink">
          <span className="block font-extrabold">Plan the trip.</span>
          <span className="block font-medium">Pack for the weather.</span>
        </h1>

        <div className="mt-8 flex items-center justify-between">
          <Squiggle
            play={introDone}
            delay={0.35}
            className="h-16 w-24 text-sorbet-ink md:h-20 md:w-32"
          />
          {/* Below md the gutter stickers are hidden, so the phone keeps one here,
              in the flow beside the squiggle, where a wrapping heading cannot
              run into it. */}
          <div data-sticker="phone" className="md:hidden">
            <StickerBadge
              label="go anywhere"
              icon={<BsCompass />}
              tint="text-sorbet-cyan"
              size={88}
            />
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <p className="max-w-md text-lg leading-relaxed text-sorbet-ink/75 md:text-xl">
            Describe where you are headed. Trip AI writes the itinerary, the
            tours worth doing, and a packing list that already knows the
            forecast.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/form"
              className="rounded-full bg-sorbet-ink px-7 py-4 text-base font-semibold text-sorbet-offwhite transition-transform hover:scale-[1.03] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sorbet-ink"
            >
              Plan a trip
            </Link>
            <Link
              href="/saved-trips"
              className="rounded-full bg-sorbet-lime px-7 py-4 text-base font-semibold text-sorbet-ink transition-transform hover:scale-[1.03] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sorbet-ink"
            >
              See saved trips
            </Link>
          </div>
        </div>

        {/* The deck is the product's output: the latest trips people kept. */}
        {trips.length > 0 && (
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
                className={`relative ${i > 0 ? "mt-8 md:ml-5 md:mt-0" : ""} w-60 md:w-64`}
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
        )}
      </div>
    </section>
  );
}

export default Hero;
