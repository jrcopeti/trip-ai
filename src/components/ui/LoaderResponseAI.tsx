"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, type Variants } from "framer-motion";
import { TbBackpack } from "react-icons/tb";

import SquiggleLoader from "@/components/sorbet/SquiggleLoader";
import StickerBadge from "@/components/sorbet/StickerBadge";
import { generation } from "@/components/form/content";
import { inkPill, limePill } from "@/components/form/styles";

const messages = [
  "Planning your trip",
  "Please wait",
  "Analyzing your preferences",
  "Getting the best tours",
  "Checking the weather",
  "Packing your stuff",
  "We are almost there",
  "Thank you for using Trip AI",
];

const EASE = [0.22, 1, 0.36, 1] as const;

/** The sentence staggers its words in, and out again a little faster. */
const sentence: Variants = {
  hidden: {},
  shown: { transition: { staggerChildren: 0.09, delayChildren: 0.1 } },
  gone: { transition: { staggerChildren: 0.04 } },
};

/**
 * Each word rises out of a soft blur with a slight tilt that settles — a
 * different lean per word, so the line arrives like handwriting rather than as
 * one block. Under reduced motion the rise and tilt are skipped (transforms) and
 * the fade and blur still run.
 */
const word: Variants = {
  hidden: (i: number) => ({
    opacity: 0,
    y: 18,
    rotate: i % 2 === 0 ? -6 : 5,
    filter: "blur(6px)",
  }),
  shown: {
    opacity: 1,
    y: 0,
    rotate: 0,
    filter: "blur(0px)",
    transition: { duration: 0.7, ease: EASE },
  },
  gone: {
    opacity: 0,
    y: -12,
    filter: "blur(4px)",
    transition: { duration: 0.35, ease: "easeIn" },
  },
};

/**
 * Covers `/form` while a trip is generated: rotating messages, a note that the traveller may
 * leave, Cancel (`onCancel`, back to the form) and a way out to saved trips.
 */
function LoaderResponseAI({ onCancel }: { onCancel: () => void }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIndex((prevIndex) => (prevIndex + 1) % messages.length);
    }, 2800);
    return () => clearTimeout(timer);
  }, [index]);

  const message = messages[index];
  const words = message.split(" ");

  return (
    <div className="fixed inset-0 z-[99] grid place-items-center overflow-hidden bg-sorbet-canvas px-5 font-sorbet text-sorbet-ink antialiased sm:px-8">
      <div className="flex flex-col items-center gap-8">
        <SquiggleLoader className="h-20 w-32 text-sorbet-ink md:h-24 md:w-40" />
        {/* Reserved height: the messages wrap to two lines at 390px, and
            without it the squiggle jumps every time one swaps in. */}
        <div className="flex min-h-[9rem] items-start justify-center">
          <AnimatePresence mode="wait">
            <motion.h2
              key={message}
              variants={sentence}
              initial="hidden"
              animate="shown"
              exit="gone"
              className="max-w-3xl text-balance text-center text-[clamp(2rem,5vw,3.5rem)] font-extrabold leading-[1.02] tracking-[-0.03em]"
            >
              {/* Words are inline-block so each can rise and tilt; the spaces
                  stay as text between them, so the heading still reads as the
                  plain sentence. */}
              {words.map((w, i) => (
                <span key={`${w}-${i}`}>
                  <motion.span custom={i} variants={word} className="inline-block">
                    {w}
                  </motion.span>
                  {i < words.length - 1 && " "}
                </span>
              ))}
            </motion.h2>
          </AnimatePresence>
        </div>
        <p className="max-w-md text-balance text-center text-base text-sorbet-ink/70">
          {generation.loaderNote}
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <button type="button" onClick={onCancel} className={limePill}>
            {generation.cancel}
          </button>
          {/* A soft navigation, so the page's JS and the generation keep running. */}
          <Link href="/saved-trips" className={inkPill}>
            {generation.loaderLink}
          </Link>
        </div>
      </div>

      <StickerBadge
        label="packing up"
        icon={<TbBackpack />}
        tint="text-sorbet-lime"
        size={112}
        spin={24}
        className="absolute bottom-6 right-6 sm:bottom-10 sm:right-10"
      />
    </div>
  );
}

export default LoaderResponseAI;
