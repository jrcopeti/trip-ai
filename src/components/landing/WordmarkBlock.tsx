import Logo from "@/components/sorbet/Logo";
import Reveal from "@/components/sorbet/Reveal";
import { features } from "./content";

function WordmarkBlock() {
  return (
    <section className="bg-white px-5 py-20 sm:px-8 md:py-28">
      <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[1.6fr_1fr] lg:gap-20">
        <Reveal>
          <p className="mb-8 text-sm font-medium uppercase tracking-[0.18em] text-sorbet-ink/50">
            {features.eyebrow}
          </p>

          {/* Logo lockup: the wordmark with the app tile tucked under its tail. */}
          <div data-logo-lockup className="flex flex-wrap items-end gap-x-2">
            <span className="text-[clamp(3.5rem,12vw,9rem)] font-extrabold leading-[0.8] tracking-[-0.05em] text-sorbet-ink">
              trip ai
            </span>
            <Logo size="lockup" className="shrink-0 -translate-y-[0.04em]" />
          </div>

          <p className="mt-12 max-w-xl text-lg leading-relaxed text-sorbet-ink/75 md:text-xl">
            One form, one answer. Trip AI turns a handful of details into a full
            itinerary, then checks it against the forecast so you know what to
            put in the bag before you leave.
          </p>
        </Reveal>

        <Reveal delay={0.1}>
          <dl className="grid gap-6 sm:grid-cols-2 lg:grid-cols-1">
            {features.items.map((feature) => (
              // Rules divide the features, so none above the first row: the
              // first item, plus the second while they sit in two columns.
              <div
                key={feature.title}
                className="border-t border-sorbet-ink/15 pt-4 first:border-t-0 first:pt-0 sm:nth-2:border-t-0 sm:nth-2:pt-0 lg:nth-2:border-t lg:nth-2:pt-4"
              >
                <dt className="text-lg font-semibold text-sorbet-ink">{feature.title}</dt>
                <dd className="mt-1 text-base leading-relaxed text-sorbet-ink/70">
                  {feature.body}
                </dd>
              </div>
            ))}
          </dl>
        </Reveal>
      </div>
    </section>
  );
}

export default WordmarkBlock;
