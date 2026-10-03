"use client";
import { useEffect, useState } from "react";
import { useConfirmOnPageExit } from "@/hooks/useConfirmonPageExit";
import { PuffLoader } from "react-spinners";
import { AnimatePresence, motion } from "framer-motion";

import { SPINNER_INK } from "./Loader";

const variants = {
  initial: { opacity: 0, y: 50 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -50 },
};

const messages = [
  "Planning your trip",
  "Please Wait",
  "Analyzing your preferences",
  "Getting the best tours",
  "Checking the weather",
  "Packing your stuff",
  "We are almost there",
  "Thank you for using Trip AI",
];

function LoaderResponseAI() {
  const [index, setIndex] = useState(0);
  useConfirmOnPageExit();

  useEffect(() => {
    const timer = setTimeout(() => {
      setIndex((prevIndex) => (prevIndex + 1) % messages.length);
    }, 2800);
    return () => clearTimeout(timer);
  }, [index]);

  return (
    <div className="fixed inset-0 z-[99] grid place-items-center overflow-hidden bg-sorbet-canvas px-5 font-sorbet text-sorbet-ink antialiased sm:px-8">
      <div className="flex flex-col items-center gap-10">
        <PuffLoader size={80} color={SPINNER_INK} />
        {/* Reserved height: the messages wrap to two lines at 390px, and
            without it the spinner jumps every time one swaps in. */}
        <AnimatePresence mode="wait">
          <motion.div
            className="flex min-h-[9rem] items-start justify-center"
            key={messages.at(index)}
            initial="initial"
            animate="animate"
            exit="exit"
            variants={variants}
            transition={{ duration: 1.3, ease: "easeInOut" }}
          >
            <h2 className="max-w-3xl text-balance text-center text-[clamp(2rem,5vw,3.5rem)] font-extrabold leading-[1.02] tracking-[-0.03em]">
              {messages.at(index)}
            </h2>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

export default LoaderResponseAI;
