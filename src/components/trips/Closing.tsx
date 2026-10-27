import type { ReactNode } from "react";
import Image, { type StaticImageData } from "next/image";
import Reveal from "@/components/sorbet/Reveal";
import { paragraphs } from "@/lib/utils";
import { MediaFrame, Paragraphs } from "./Section";
import { closing as copy } from "./content";

const pill =
  "inline-flex items-center justify-center rounded-full px-7 py-4 text-base font-semibold transition-transform hover:scale-[1.03] motion-reduce:transition-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sorbet-ink";

/** Primary on lime: the ink pill. */
export const primaryPill = `${pill} bg-sorbet-ink text-sorbet-offwhite`;

/**
 * Secondary on lime. The system's secondary is a lime pill, which would vanish
 * on this ground, so it is the nav Menu trigger's ink outline instead.
 */
export const secondaryPill = `${pill} border-2 border-sorbet-ink text-sorbet-ink`;

/** For `<button>`s: the pointer preflight drops, and the wait while saving. */
export const buttonExtras =
  "cursor-pointer disabled:cursor-wait disabled:opacity-60 disabled:hover:scale-100";

/**
 * The last section on both trip routes, on lime: the AI's tip as the lead (none when blank), then
 * whatever the route asks next — save or discard on a fresh trip, back or plan
 * another on a saved one.
 */
function Closing({
  image,
  placeholder,
  tip,
  heading,
  children,
}: {
  image: string | StaticImageData;
  placeholder: string;
  tip: string;
  heading: string;
  children: ReactNode;
}) {
  return (
    <section className="bg-sorbet-lime px-5 py-28 sm:px-8 md:py-40">
      <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-[1.6fr_1fr] lg:gap-16">
        <div>
          {paragraphs(tip).length > 0 && (
            <Reveal>
              <p className="text-sm font-medium uppercase tracking-[0.18em] text-sorbet-ink/50">
                {copy.eyebrow}
              </p>
              <Paragraphs
                text={tip}
                className="mt-4 max-w-2xl text-[clamp(1.25rem,2.5vw,1.875rem)] font-medium leading-snug tracking-[-0.02em] text-sorbet-ink"
              />
            </Reveal>
          )}
          <Reveal delay={0.08}>
            <h2 className="mt-14 text-2xl font-semibold text-sorbet-ink">{heading}</h2>
            <div className="mt-5 flex flex-wrap gap-3">{children}</div>
          </Reveal>
        </div>
        <Reveal delay={0.12}>
          <MediaFrame>
            <Image
              src={image}
              alt=""
              fill
              placeholder="blur"
              blurDataURL={placeholder}
              sizes="(min-width: 1024px) 400px, 100vw"
              className="object-cover"
            />
          </MediaFrame>
        </Reveal>
      </div>
    </section>
  );
}

export default Closing;
