"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

import { useIntro } from "./IntroContext";

/**
 * Landing intro: three beats that set up the headline, then the wordmark, which
 * flies into its place in the nav as the ink panel lifts away.
 *
 * It overlays the server-rendered page rather than gating it, so the hero is in
 * the DOM from the first byte. Reduced motion and a JS-failure safety net are
 * both handled in CSS on `.landing-intro` (see globals.css), which keeps the
 * server and client trees identical.
 */

// Beat durations, ms. Tune here.
const BEATS = [
  { text: "Plan.", hold: 450 },
  { text: "Pack.", hold: 350 },
  { text: "Go.", hold: 450 },
];
const WORDMARK_HOLD = 850;
const EXIT_MS = 750;

const EASE = [0.76, 0, 0.24, 1] as const;

type Phase = { kind: "beat"; i: number } | { kind: "wordmark" } | { kind: "exit" } | { kind: "done" };

type Flight = { x: number; y: number; scale: number };

function Intro() {
  const [phase, setPhase] = useState<Phase>({ kind: "beat", i: 0 });
  const [flight, setFlight] = useState<Flight | null>(null);
  const wordmarkRef = useRef<HTMLSpanElement>(null);
  const { finish } = useIntro();

  // The CSS hides the intro under reduced motion; this makes the hero's own
  // entrances start right away instead of waiting out an intro nobody sees.
  // Read in an effect, not in render, so server and client trees stay equal.
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      finish();
      setPhase({ kind: "done" });
    }
  }, [finish]);

  useEffect(() => {
    if (phase.kind === "beat") {
      const next: Phase =
        phase.i < BEATS.length - 1 ? { kind: "beat", i: phase.i + 1 } : { kind: "wordmark" };
      const t = setTimeout(() => setPhase(next), BEATS[phase.i].hold);
      return () => clearTimeout(t);
    }

    if (phase.kind === "wordmark") {
      const t = setTimeout(() => {
        // Measure where the nav's wordmark sits and fly there. Done at exit time
        // rather than mount, so it is right for whatever the viewport is now.
        const from = wordmarkRef.current?.getBoundingClientRect();
        const to = document.querySelector<HTMLElement>("[data-wordmark]")?.getBoundingClientRect();
        if (from && to) {
          // Same string, font and weight on both sides, so the width ratio is the
          // exact font-size ratio. Height would be wrong: the nav's line box is
          // taller than its glyphs, while the intro uses leading-none.
          const scale = to.width / from.width;
          setFlight({
            x: to.left - from.left,
            y: to.top + (to.height - from.height * scale) / 2 - from.top,
            scale,
          });
        }
        // Hero entrances start as the curtain begins to lift.
        finish();
        setPhase({ kind: "exit" });
      }, WORDMARK_HOLD);
      return () => clearTimeout(t);
    }

    if (phase.kind === "exit") {
      const t = setTimeout(() => setPhase({ kind: "done" }), EXIT_MS);
      return () => clearTimeout(t);
    }
  }, [phase, finish]);

  if (phase.kind === "done") return null;

  const exiting = phase.kind === "exit";

  return (
    <div className="landing-intro pointer-events-none fixed inset-0 z-[60]" aria-hidden>
      {/* The curtain. */}
      <motion.div
        className="absolute inset-0 bg-sorbet-ink"
        animate={{ y: exiting ? "-100%" : "0%" }}
        transition={{ duration: EXIT_MS / 1000, ease: EASE }}
      />

      <div className="absolute inset-0 flex items-center justify-center">
        {/*
          Beats and the final wordmark share one presence group with mode="wait",
          so each word has fully left before the next arrives. Keeping the
          wordmark outside the group let "Go." exit and "trip ai" enter at the
          same moment, on top of each other.
        */}
        <AnimatePresence mode="wait">
          {phase.kind === "beat" ? (
            <motion.p
              key={BEATS[phase.i].text}
              className="font-sorbet text-[clamp(3.5rem,12vw,8rem)] font-extrabold leading-none tracking-[-0.04em] text-sorbet-offwhite"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -14 }}
              transition={{ duration: 0.16, ease: "easeOut" }}
            >
              {BEATS[phase.i].text}
            </motion.p>
          ) : (
            /*
              Final beat. Stable key: it stays mounted through the exit phase, and
              the flight is an animate change, not a presence exit. "with" fades;
              the wordmark is the only thing that travels. Transform-origin
              top-left so the flight lands on the nav's box.
            */
            <motion.div
              key="wordmark"
              className="flex flex-col items-center gap-4"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.24, ease: "easeOut" }}
            >
              <motion.span
                className="font-sorbet text-2xl font-medium text-sorbet-offwhite/70 md:text-3xl"
                animate={{ opacity: exiting ? 0 : 1 }}
                transition={{ duration: 0.2 }}
              >
                with
              </motion.span>
              <motion.span
                ref={wordmarkRef}
                className="origin-top-left font-sorbet text-[clamp(3.5rem,12vw,8rem)] font-extrabold leading-none tracking-tight text-sorbet-offwhite"
                animate={
                  exiting && flight
                    ? { x: flight.x, y: flight.y, scale: flight.scale, color: "#302e2d" }
                    : { x: 0, y: 0, scale: 1 }
                }
                transition={{ duration: EXIT_MS / 1000, ease: EASE }}
              >
                trip ai
              </motion.span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default Intro;
