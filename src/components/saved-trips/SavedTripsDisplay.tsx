"use client";
import { useSavedTrips } from "@/hooks/useSavedTrips";

import { TextField, Label, Input } from "@heroui/react";
import image1 from "@/assets/travel-photos/1.jpg";
import Polaroid from "@/components/sorbet/Polaroid";
import Reveal from "@/components/sorbet/Reveal";
import { SPINNER_INK } from "@/components/ui/Loader";
import ErrorComponent from "@/components/ui/NotFoundComponent";
import { defaultPlaceholder } from "@/lib/constants";
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
      <section className="bg-sorbet-canvas px-5 pt-10 pb-16 sm:px-8 md:pt-16 md:pb-20">
        <div className="mx-auto max-w-6xl">
          <p className="text-sorbet-ink/50 mb-6 text-sm font-medium tracking-[0.18em] uppercase">
            {header.eyebrow}
          </p>

          <h1 className="text-sorbet-ink max-w-5xl text-[clamp(2.75rem,7vw,5.5rem)] leading-[0.96] tracking-[-0.03em]">
            <span className="block font-extrabold">{header.heading.claim}</span>
            <span className="text-sorbet-ink/60 block font-medium">
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
            <Label className="text-sorbet-ink/45! text-xs font-medium tracking-[0.12em] uppercase">
              {header.search.label}
            </Label>
            <Input
              type="search"
              placeholder={header.search.placeholder}
              className="border-sorbet-ink/15 text-sorbet-ink placeholder:text-sorbet-ink/45 focus:border-sorbet-ink focus-visible:outline-sorbet-ink w-full rounded-full border bg-white px-6 py-4 text-base shadow-none hover:bg-white focus:bg-white focus:shadow-none focus:ring-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-solid sm:text-base"
            />
          </TextField>
        </div>
      </section>

      {/* Offwhite, not white: the polaroid frame is white paper and needs a
          ground to sit on, or only its shadow shows where the card ends. */}
      <section className="bg-sorbet-offwhite px-5 py-20 sm:px-8 md:py-28">
        <div className="mx-auto max-w-6xl">
          {isPendingSavedTrips ? (
            <div
              role="status"
              aria-label={loading.label}
              className="grid place-items-center py-10"
            >
              <PuffLoader size={80} color={SPINNER_INK} />
            </div>
          ) : savedTrips?.length === 0 ? (
            <div className="bg-sorbet-white mx-auto max-w-xl rounded-3xl p-8 text-center md:p-10">
              <h2 className="text-sorbet-ink text-2xl font-semibold">
                {empty.heading}
              </h2>
              <p className="text-sorbet-ink/70 mt-3 text-lg leading-relaxed">
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
                    <Polaroid
                      href={`/saved-trips/${trip.id}`}
                      image={trip.image ?? image1}
                      placeholder={trip.placeholder ?? defaultPlaceholder}
                      caption={`${trip.city.trim()}, ${trip.country}`}
                      username={`${trip.userName}`}
                      index={i}
                    />
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
