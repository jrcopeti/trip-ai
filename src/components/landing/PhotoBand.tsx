import Image from "next/image";
import { FaArrowRight } from "react-icons/fa6";

import { itineraryCards, photos } from "./content";
import Reveal from "./Reveal";
import TripCard from "./TripCard";

function PhotoBand() {
  return (
    <section className="bg-white px-5 py-20 sm:px-8 md:py-28">
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <div className="relative overflow-hidden rounded-[2rem]">
            <Image
              src={photos.band.src}
              alt={photos.band.alt}
              placeholder="blur"
              sizes="(max-width: 1152px) 100vw, 1152px"
              className="h-[38vh] w-full object-cover md:h-[52vh]"
            />
            {/* Overlaid chip, as the reference does over its photography. */}
            <div className="absolute left-4 top-4 flex items-center gap-3 rounded-full bg-white/90 py-2 pl-4 pr-2 backdrop-blur-sm sm:left-6 sm:top-6">
              <span className="flex items-center gap-2 text-sm font-medium text-buddy-ink">
                <photos.band.Icon size={16} aria-hidden />
                {photos.band.label}
              </span>
              <span
                aria-hidden
                className="grid size-8 place-items-center rounded-full bg-buddy-ink text-buddy-offwhite"
              >
<FaArrowRight size={13} />
              </span>
            </div>
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <h2 className="mt-16 max-w-3xl text-[clamp(2rem,5vw,3.5rem)] leading-[1.02] tracking-[-0.03em] text-buddy-ink">
            <span className="font-extrabold">What comes back</span>{" "}
            <span className="font-medium text-buddy-ink/60">
              is a day you could actually walk.
            </span>
          </h2>
        </Reveal>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {itineraryCards.map((card, i) => (
            <Reveal key={card.title} delay={0.06 * i}>
              <TripCard card={card} className="h-full" />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export default PhotoBand;
