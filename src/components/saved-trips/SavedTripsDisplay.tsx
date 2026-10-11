"use client";
import { useSavedTrips } from "@/hooks/useSavedTrips";

import { TextField, Label, Input } from "@heroui/react";
import Reveal from "@/components/sorbet/Reveal";
import { SPINNER_INK } from "@/components/ui/Loader";
import ErrorComponent from "@/components/ui/NotFoundComponent";
import SavedTripCard from "./SavedTripCard";
import { empty, error, header, loading } from "./content";

import { PuffLoader } from "react-spinners";

/**
 * `/saved-trips`, in the sorbet system: a canvas header with the search, then the
 * polaroid grid on offwhite. The page wraps it with the font, ground and footer.
 */
function SavedTripsDisplay() {
  const {
    savedTrips,
    isPendingSavedTrips,
    savedTripsError,
    setSearchTerm,
    searchTerm,
  } = useSavedTrips();

  if (savedTripsError) {
    return (
      <ErrorComponent
        message={error.message}
        path={error.path}
        button={error.button}
      />
    );
  }

  return (
    <>
      <section className="bg-sorbet-canvas px-5 pb-16 pt-10 sm:px-8 md:pb-20 md:pt-16">
        <div className="mx-auto max-w-6xl">
          <p className="mb-6 text-sm font-medium uppercase tracking-[0.18em] text-sorbet-ink/50">
            {header.eyebrow}
          </p>

          <h1 className="max-w-5xl text-[clamp(2.75rem,7vw,5.5rem)] leading-[0.96] tracking-[-0.03em] text-sorbet-ink">
            <span className="block font-extrabold">{header.heading.claim}</span>
            <span className="block font-medium text-sorbet-ink/60">
              {header.heading.qualifier}
            </span>
          </h1>

          <TextField
            value={searchTerm}
            onChange={setSearchTerm}
            className="mt-10 flex max-w-lg flex-col gap-3"
          >
            {/* `!` because globals.css has an unlayered `.label` colour for the
                unmigrated form, and unlayered CSS beats every layered utility. */}
            <Label className="text-xs font-medium uppercase tracking-[0.12em] text-sorbet-ink/45!">
              {header.search.label}
            </Label>
            <Input
              type="search"
              placeholder={header.search.placeholder}
              className="w-full rounded-full border border-sorbet-ink/15 bg-white px-6 py-4 text-base text-sorbet-ink shadow-none placeholder:text-sorbet-ink/45 hover:bg-white focus:border-sorbet-ink focus:bg-white focus:shadow-none focus:ring-0 focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-2 focus-visible:outline-sorbet-ink sm:text-base"
            />
          </TextField>
        </div>
      </section>

      {/* Offwhite, not white: the polaroid frame is white paper and needs a
          ground to sit on, or only its shadow shows where the card ends. */}
      <section className="bg-sorbet-offwhite px-5 py-20 sm:px-8 md:py-28">
        <div className="mx-auto max-w-6xl">
          {isPendingSavedTrips ? (
            <div role="status" aria-label={loading.label} className="grid place-items-center py-10">
              <PuffLoader size={80} color={SPINNER_INK} />
            </div>
          ) : savedTrips?.length === 0 ? (
            <div className="mx-auto max-w-xl rounded-3xl bg-sorbet-white p-8 text-center md:p-10">
              <h2 className="text-2xl font-semibold text-sorbet-ink">
                {empty.heading}
              </h2>
              <p className="mt-3 text-lg leading-relaxed text-sorbet-ink/70">
                {empty.body}
              </p>
            </div>
          ) : (
            <ul className="grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
              {savedTrips?.map((trip, i) => (
                <li key={trip.id}>
                  {/* Staggered along the row, not down the whole list: each row
                      enters the viewport on its own, so `0.06 * i` would hold the
                      twentieth card back over a second after it scrolled in. */}
                  <Reveal delay={0.06 * (i % 3)}>
                    <SavedTripCard trip={trip} index={i} />
                  </Reveal>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </>
  );
}

export default SavedTripsDisplay;
