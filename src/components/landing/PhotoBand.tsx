import Image from "next/image";

import type { TravelPhoto } from "@/data";
import { kindIcon } from "@/components/sorbet/kinds";
import Reveal from "@/components/sorbet/Reveal";
import { CARD_TINTS } from "@/components/sorbet/tints";
import TripCard from "@/components/sorbet/TripCard";
import { bandHeading, sampleTours } from "./content";

/**
 * A wide travel photo — one of the bundled set, picked per request by the page —
 * then the five tours an answer holds, in the shape the AI returns them.
 */
function PhotoBand({ photo }: { photo: TravelPhoto }) {
  return (
    <section className="bg-white px-5 py-20 sm:px-8 md:py-28">
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <div className="relative overflow-hidden rounded-[2rem]">
            <Image
              src={photo.src}
              alt={photo.alt}
              placeholder="blur"
              blurDataURL={photo.placeholder}
              sizes="(max-width: 1152px) 100vw, 1152px"
              className="h-[38vh] w-full object-cover md:h-[52vh]"
            />
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <h2 className="mt-16 max-w-4xl text-[clamp(2rem,5vw,3.5rem)] leading-[1.02] tracking-[-0.03em] text-balance text-sorbet-ink">
            <span className="font-extrabold">{bandHeading.claim}</span>{" "}
            <span className="font-medium text-sorbet-ink/60">{bandHeading.qualifier}</span>
          </h2>
        </Reveal>

        {/* Five in a row from lg; in two columns the fifth spans both rather
            than sitting beside an empty slot. */}
        <div className="mt-12 grid gap-4 sm:grid-cols-2 sm:[&>*:last-child]:col-span-2 lg:grid-cols-5 lg:[&>*:last-child]:col-span-1">
          {sampleTours.map((tour, i) => (
            <Reveal key={tour.title} delay={0.06 * i}>
              <TripCard
                card={{
                  title: tour.title,
                  body: tour.description,
                  chip: tour.kind,
                  Icon: kindIcon(tour.kind),
                  tint: CARD_TINTS[i % CARD_TINTS.length],
                }}
                interactive={false}
                className="h-full"
              />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export default PhotoBand;
