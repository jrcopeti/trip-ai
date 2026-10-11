import Image from "next/image";
import Link from "next/link";
import { FaArrowRight } from "react-icons/fa6";

import Reveal from "@/components/sorbet/Reveal";
import SiteFooter from "@/components/ui/SiteFooter";
import type { TravelPhoto } from "@/data";
import { closing, intro } from "./content";

type Props = {
  image: TravelPhoto;
};

/**
 * `/about`, in the sorbet system. A server component: the image is chosen by the
 * page and passed in, so there is no mount gate and nothing to hydrate but the
 * `Reveal` wrappers.
 */
function AboutComponent({ image }: Props) {
  return (
    <div className="min-h-dvh bg-sorbet-canvas font-sorbet text-sorbet-ink antialiased">
      <main>
        <section className="bg-sorbet-canvas px-5 pb-20 pt-10 sm:px-8 md:pb-28 md:pt-16">
          <div className="mx-auto max-w-6xl">
            <p className="mb-6 text-sm font-medium uppercase tracking-[0.18em] text-sorbet-ink/50">
              {intro.eyebrow}
            </p>

            <h1 className="max-w-5xl text-[clamp(2.75rem,7vw,5.5rem)] leading-[0.96] tracking-[-0.03em] text-sorbet-ink">
              <span className="block font-extrabold">{intro.heading.claim}</span>
              <span className="block font-medium text-sorbet-ink/60">
                {intro.heading.qualifier}
              </span>
            </h1>

            <div className="mt-10 grid gap-8 lg:grid-cols-[1.6fr_1fr] lg:items-end">
              <p className="max-w-2xl text-lg leading-relaxed text-sorbet-ink/75 md:text-xl">
                {intro.lead}
              </p>

              <p className="text-xs font-medium uppercase tracking-[0.12em] text-sorbet-ink/45 lg:justify-self-end">
                {intro.credit.prefix}{" "}
                <a
                  href={intro.credit.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full font-semibold text-sorbet-ink underline decoration-sorbet-ink/30 underline-offset-4 transition-colors hover:decoration-sorbet-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sorbet-ink"
                >
                  {intro.credit.name}
                </a>
              </p>
            </div>
          </div>
        </section>

        <section className="bg-white px-5 py-20 sm:px-8 md:py-28">
          <div className="mx-auto max-w-6xl">
            <Reveal>
              <div className="relative overflow-hidden rounded-[2rem]">
                <Image
                  src={image.src}
                  alt={image.alt}
                  placeholder="blur"
                  blurDataURL={image.placeholder}
                  sizes="(max-width: 1152px) 100vw, 1152px"
                  className="h-[38vh] w-full object-cover md:h-[60vh]"
                />
              </div>
            </Reveal>
          </div>
        </section>

        <section className="bg-sorbet-lime px-5 py-28 sm:px-8 md:py-40">
          <Reveal className="mx-auto max-w-4xl text-center">
            <h2 className="text-[clamp(2.5rem,8vw,6rem)] font-extrabold leading-[0.95] tracking-[-0.04em] text-sorbet-ink">
              {closing.heading}
            </h2>
            <p className="mx-auto mt-6 max-w-lg text-lg text-sorbet-ink/70 md:text-xl">
              {closing.body}
            </p>

            <div className="mt-10 flex justify-center">
              <Link
                href={closing.cta.href}
                className="group inline-flex items-center gap-4 rounded-full bg-sorbet-ink py-3 pl-8 pr-3 text-lg font-semibold text-sorbet-offwhite transition-transform hover:scale-[1.03] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sorbet-ink"
              >
                {closing.cta.label}
                <span
                  aria-hidden
                  className="grid size-11 place-items-center rounded-full bg-sorbet-lime text-sorbet-ink transition-transform group-hover:translate-x-1"
                >
                  <FaArrowRight size={15} />
                </span>
              </Link>
            </div>
          </Reveal>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}

export default AboutComponent;
