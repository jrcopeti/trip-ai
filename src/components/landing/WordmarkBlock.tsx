import Reveal from "./Reveal";

const meta = [
  { label: "Model", value: "Claude Sonnet" },
  { label: "Weather", value: "OpenWeather" },
  { label: "Photos", value: "Unsplash" },
  { label: "Steps in the form", value: "Seven" },
];

function WordmarkBlock() {
  return (
    <section className="bg-white px-5 py-20 sm:px-8 md:py-28">
      <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[1.6fr_1fr] lg:gap-20">
        <Reveal>
          <p className="mb-8 text-sm font-medium uppercase tracking-[0.18em] text-buddy-ink/50">
            Your new travel friend
          </p>

          {/* Logo lockup: the wordmark with the app tile tucked under its tail. */}
          <div className="flex flex-wrap items-end gap-x-2">
            <span className="text-[clamp(3.5rem,12vw,9rem)] font-extrabold leading-[0.8] tracking-[-0.05em] text-buddy-ink">
              trip ai
            </span>
            <span className="grid size-16 shrink-0 -translate-y-1 place-items-center rounded-2xl bg-buddy-orchid text-sm font-extrabold text-buddy-ink md:size-24 md:rounded-3xl md:text-lg">
              trip ai
            </span>
          </div>

          <p className="mt-12 max-w-xl text-lg leading-relaxed text-buddy-ink/75 md:text-xl">
            One form, one answer. Trip AI turns a handful of details into a full
            itinerary, then checks it against the forecast so you know what to
            put in the bag before you leave.
          </p>
        </Reveal>

        <Reveal delay={0.1}>
          <dl className="grid gap-6 sm:grid-cols-2 lg:grid-cols-1">
            {meta.map((row) => (
              <div key={row.label} className="border-t border-buddy-ink/15 pt-4">
                <dt className="text-xs font-medium uppercase tracking-[0.12em] text-buddy-ink/45">
                  {row.label}
                </dt>
                <dd className="mt-1 text-lg font-semibold text-buddy-ink">
                  {row.value}
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
