import Link from "next/link";

import { sortedTypes } from "@/data";
import Reveal from "./Reveal";

/** Rotating pastel fills so a long list still reads as one system. */
const tints = [
  "bg-sorbet-lime",
  "bg-sorbet-lavender",
  "bg-sorbet-blush",
  "bg-sorbet-cyan",
  "bg-sorbet-lime-punch",
  "bg-sorbet-orchid",
];

function TripTypePills() {
  return (
    <section className="bg-sorbet-offwhite px-5 py-20 sm:px-8 md:py-28">
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <h2 className="max-w-2xl text-[clamp(2rem,5vw,3.5rem)] font-extrabold leading-[1.02] tracking-[-0.03em] text-sorbet-ink">
            Twelve kinds of trip.
          </h2>
          <p className="mt-4 max-w-lg text-lg text-sorbet-ink/70">
            Pick one in the form and the itinerary changes shape around it.
          </p>
        </Reveal>

        <Reveal delay={0.08}>
          <ul className="mt-12 flex flex-wrap gap-3">
            {sortedTypes.map((type, i) => (
              <li key={type.value}>
                <Link
                  href="/form"
                  className={`${tints[i % tints.length]} inline-block rounded-full px-6 py-3.5 text-lg font-medium text-sorbet-ink transition-transform hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sorbet-ink md:text-xl`}
                >
                  {type.label}
                </Link>
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}

export default TripTypePills;
