"use client";
import { useState, type KeyboardEvent } from "react";
import { AnimatePresence, motion, type PanInfo } from "framer-motion";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa6";
import { LuMapPin } from "react-icons/lu";
import { tours as copy } from "./content";
import { CARD_TINTS } from "./tints";
import type { Tour } from "./tours";

/** How far a swipe has to travel, in px, before it counts as one. */
const SWIPE_PX = 60;

const EASE = [0.22, 1, 0.36, 1] as const;

const disc =
  "grid size-12 shrink-0 cursor-pointer place-items-center rounded-full bg-sorbet-ink text-sorbet-offwhite transition-transform hover:scale-105 motion-reduce:transition-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sorbet-ink";

/**
 * Chip and tour sit together at the top, so a short tour reads straight away;
 * any height a longer tour reserves (see the sizers below) falls under the text.
 */
const CARD =
  "col-start-1 row-start-1 flex flex-col gap-5 rounded-3xl p-6 sm:p-8 md:gap-6 md:p-10";

/**
 * A slide's content: chip, title, then the tour. Shared by the visible card and
 * the invisible sizers. Until the AI returns tour titles, the title slot holds a
 * muted placeholder so the card already has its final shape.
 */
function SlideBody({ n, tour }: { n: number; tour: Tour }) {
  return (
    <>
      <span className="text-sorbet-ink inline-flex w-fit items-center gap-1.5 rounded-full bg-white/70 px-3 py-1.5 text-sm font-medium">
        <LuMapPin size={14} aria-hidden />
        {copy.chip(n)}
      </span>
      <div>
        <h3
          data-placeholder={tour.title ? undefined : ""}
          className={`max-w-5xl text-xl leading-snug font-semibold tracking-[-0.01em] first-letter:uppercase md:text-2xl lg:text-[1.75rem] lg:leading-[1.3] ${
            tour.title ? "text-sorbet-ink" : "text-sorbet-ink/35"
          }`}
        >
          {tour.title ?? copy.untitled}
        </h3>
        <p className="text-sorbet-ink/75 mt-3 max-w-5xl text-justify text-lg leading-relaxed first-letter:uppercase md:text-xl">
          {tour.description}
        </p>
      </div>
    </>
  );
}

/**
 * The suggested tours, one wide card at a time. Previous and next wrap around,
 * the dots jump, a swipe or the arrow keys step, so the list can grow without
 * the section growing with it.
 *
 * Follows the WAI carousel pattern: the region is a named `carousel`, the card a
 * `slide` labelled "n of total", and the slide area is a polite live region so a
 * screen reader hears the new tour after pressing next. Only the current tour is
 * rendered for assistive tech.
 *
 * The controls sit above the card, so they never move whatever a tour's length,
 * and come before the slides in reading order, as the pattern recommends.
 *
 * Entering and leaving slides share one grid cell with an invisible copy of
 * every tour, so the card is always as tall as the longest one and never jumps
 * when the tour changes — nor does the page below it. Under reduced motion
 * `MotionProvider` drops the slide and keeps the fade.
 */
function ToursCarousel({ tours }: { tours: Tour[] }) {
  const [[index, direction], setPosition] = useState<[number, number]>([0, 0]);
  const total = tours.length;

  if (total === 0) return null;

  const current = Math.min(index, total - 1);
  const goTo = (target: number, dir: number) =>
    setPosition([(target + total) % total, dir]);
  const previous = () => goTo(current - 1, -1);
  const next = () => goTo(current + 1, 1);

  function onKeyDown(event: KeyboardEvent) {
    if (event.key === "ArrowRight") next();
    if (event.key === "ArrowLeft") previous();
  }

  function onDragEnd(_: unknown, info: PanInfo) {
    if (info.offset.x < -SWIPE_PX) next();
    else if (info.offset.x > SWIPE_PX) previous();
  }

  return (
    <section
      aria-roledescription="carousel"
      aria-label={copy.carousel}
      onKeyDown={onKeyDown}
      className="mt-12 md:mt-16"
    >
      {total > 1 && (
        <div className="mb-5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <p className="text-sorbet-ink text-sm font-semibold tabular-nums">
              {String(current + 1).padStart(2, "0")}
              <span className="text-sorbet-ink/45 font-medium">
                {" / "}
                {String(total).padStart(2, "0")}
              </span>
            </p>
            <ul className="flex flex-wrap items-center gap-1">
              {tours.map((_, i) => (
                <li key={i}>
                  {/* The dot is small; the button around it is a usable target. */}
                  <button
                    type="button"
                    aria-label={copy.goTo(i + 1)}
                    aria-current={i === current ? "true" : undefined}
                    onClick={() => goTo(i, i > current ? 1 : -1)}
                    className="group focus-visible:outline-sorbet-ink grid size-6 cursor-pointer place-items-center rounded-full focus-visible:outline-2 focus-visible:outline-offset-2"
                  >
                    <span
                      aria-hidden
                      className={`block h-2 rounded-full transition-all motion-reduce:transition-none ${
                        i === current
                          ? "bg-sorbet-ink w-5"
                          : "bg-sorbet-ink/25 group-hover:bg-sorbet-ink/50 w-2"
                      }`}
                    />
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              aria-label={copy.previous}
              onClick={previous}
              className={disc}
            >
              <FaArrowLeft size={14} aria-hidden />
            </button>
            <button
              type="button"
              aria-label={copy.next}
              onClick={next}
              className={disc}
            >
              <FaArrowRight size={14} aria-hidden />
            </button>
          </div>
        </div>
      )}

      <div aria-live="polite" className="grid overflow-hidden rounded-3xl">
        <AnimatePresence initial={false} custom={direction}>
          <motion.article
            key={current}
            custom={direction}
            role="group"
            aria-roledescription="slide"
            aria-label={copy.slide(current + 1, total)}
            variants={{
              enter: (dir: number) => ({ opacity: 0, x: dir * 48 }),
              center: { opacity: 1, x: 0 },
              exit: (dir: number) => ({ opacity: 0, x: dir * -48 }),
            }}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.45, ease: EASE }}
            drag={total > 1 ? "x" : false}
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.2}
            onDragEnd={onDragEnd}
            className={`${CARD} cursor-grab touch-pan-y active:cursor-grabbing ${CARD_TINTS[current % CARD_TINTS.length]}`}
          >
            <SlideBody n={current + 1} tour={tours[current]} />
          </motion.article>
        </AnimatePresence>

        {/*
          Every tour again, invisible, in the same cell: the cell is as tall as
          the longest tour at this width, so a longer or shorter one never moves
          the controls or the page below. Hidden from assistive tech and from
          find-in-page by `invisible`.
        */}
        {tours.map((tour, i) => (
          <div key={i} aria-hidden className={`${CARD} invisible`}>
            <SlideBody n={i + 1} tour={tour} />
          </div>
        ))}
      </div>
    </section>
  );
}

export default ToursCarousel;
