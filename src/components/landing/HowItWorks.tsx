import Image from "next/image";

import { photos, steps } from "./content";
import Reveal from "./Reveal";

function HowItWorks() {
  return (
    <section className="bg-buddy-canvas px-5 py-20 sm:px-8 md:py-28">
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <h2 className="max-w-2xl text-[clamp(2rem,5vw,3.5rem)] font-extrabold leading-[1.02] tracking-[-0.03em] text-buddy-ink">
            Three steps, start to bag.
          </h2>
        </Reveal>

        <div className="mt-14 grid gap-10 lg:grid-cols-[1fr_0.8fr] lg:gap-16">
          {/* Numbered because the order genuinely matters here. */}
          <ol className="grid gap-8">
            {steps.map((step, i) => (
              <Reveal key={step.n} delay={0.07 * i}>
                <li className="flex gap-5 border-t border-buddy-ink/15 pt-6">
                  <span className="text-sm font-semibold tabular-nums text-buddy-ink/40">
                    {step.n}
                  </span>
                  <div>
                    <h3 className="text-2xl font-semibold text-buddy-ink">
                      {step.title}
                    </h3>
                    <p className="mt-2 max-w-md text-lg leading-relaxed text-buddy-ink/70">
                      {step.body}
                    </p>
                  </div>
                </li>
              </Reveal>
            ))}
          </ol>

          <Reveal delay={0.12} className="lg:sticky lg:top-24 lg:self-start">
            <div className="grid gap-4">
              {photos.pair.map((photo) => (
                <div
                  key={photo.label}
                  className="relative overflow-hidden rounded-[1.75rem]"
                >
                  <Image
                    src={photo.src}
                    alt={photo.alt}
                    placeholder="blur"
                    sizes="(max-width: 1024px) 100vw, 420px"
                    className="h-52 w-full object-cover md:h-60"
                  />
                  <span className="absolute bottom-3 left-3 rounded-full bg-white/90 px-3 py-1.5 text-xs font-medium text-buddy-ink backdrop-blur-sm">
                    {photo.label}
                  </span>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

export default HowItWorks;
