"use client";
import { useRef } from "react";
import { FaArrowDown, FaXmark } from "react-icons/fa6";
import { LuCamera } from "react-icons/lu";
import { useSavedTrips } from "@/hooks/useSavedTrips";

import { TextField, Label, Input } from "@heroui/react";
import image1 from "@/assets/travel-photos/1.jpg";
import Polaroid from "@/components/sorbet/Polaroid";
import Reveal from "@/components/sorbet/Reveal";
import SquiggleArrow from "@/components/sorbet/SquiggleArrow";
import StickerBadge from "@/components/sorbet/StickerBadge";
import SquiggleLoader from "@/components/sorbet/SquiggleLoader";
import ErrorComponent from "@/components/ui/NotFoundComponent";
import { defaultPlaceholder } from "@/lib/constants";
import { badge, empty, error, header, loading, more } from "./content";


/**
 * How far below the viewport top the search may sit before typing scrolls it up:
 * the 4rem nav plus the input's `scroll-mt-24` margin. Above this line the grid
 * is already in view and the page stays put.
 */
const REVEAL_THRESHOLD_PX = 96;

/**
 * Bring the results into view as the user types. At laptop height the header
 * fills the screen, so a search would otherwise change a grid nobody can see.
 * Scrolls the search up under the nav rather than jumping to the grid, so the
 * field being typed in stays on screen.
 *
 * Reading `matchMedia` here, in an event handler, is safe: nothing rendered
 * depends on it, so there is no server/client mismatch to worry about.
 */
function revealResults(input: HTMLInputElement | null) {
  if (!input || input.getBoundingClientRect().top <= REVEAL_THRESHOLD_PX) return;

  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  input.scrollIntoView({ block: "start", behavior: reduce ? "auto" : "smooth" });
}

/**
 * `/saved-trips`, in the sorbet system: a canvas header with the search, then the
 * polaroid grid on offwhite. The page wraps it with the font, ground and footer.
 */
function SavedTripsDisplay() {
  const {
    savedTrips,
    isPendingSavedTrips,
    isSearchingSavedTrips,
    savedTripsError,
    totalSavedTrips,
    hasMoreSavedTrips,
    loadMoreSavedTrips,
    isLoadingMoreSavedTrips,
    loadMoreFailed,
    setSearchTerm,
    searchTerm,
  } = useSavedTrips();
  const searchRef = useRef<HTMLInputElement>(null);

  function handleSearch(value: string) {
    setSearchTerm(value);
    revealResults(searchRef.current);
  }

  function clearSearch() {
    setSearchTerm("");
    searchRef.current?.focus();
  }

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
        <div className="relative mx-auto max-w-6xl">
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
            onChange={handleSearch}
            className="mt-10 flex max-w-lg flex-col gap-3"
          >
            <Label className="text-sorbet-ink/45 text-xs font-medium tracking-[0.12em] uppercase">
              {header.search.label}
            </Label>
            <div className="relative">
              {/* The native WebKit clear button is hidden — it cannot be
                  styled to the system, and Firefox draws none — and replaced
                  by the pill below. `pr-16` keeps text clear of it. */}
              <Input
                ref={searchRef}
                type="search"
                placeholder={header.search.placeholder}
                className="border-sorbet-ink/15 text-sorbet-ink placeholder:text-sorbet-ink/45 focus:border-sorbet-ink focus-visible:outline-sorbet-ink w-full scroll-mt-24 rounded-full border bg-white py-4 pr-16 pl-6 text-base shadow-none hover:bg-white focus:bg-white focus:shadow-none focus:ring-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-solid sm:text-base [&::-webkit-search-cancel-button]:hidden [&::-webkit-search-cancel-button]:appearance-none"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={clearSearch}
                  aria-label={header.search.clear}
                  className="bg-sorbet-ink/10 text-sorbet-ink hover:bg-sorbet-ink hover:text-sorbet-offwhite focus-visible:outline-sorbet-ink absolute top-1/2 right-3 grid size-9 -translate-y-1/2 cursor-pointer place-items-center rounded-full transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 motion-reduce:transition-none"
                >
                  <FaXmark size={14} aria-hidden />
                </button>
              )}
            </div>
          </TextField>

          {/* Hangs from the search into the grid's ground, pointing at the
              cards. Absolutely placed so it costs the header no height, and
              positioned, so it paints over the next section's background. */}
          <SquiggleArrow className="text-sorbet-ink absolute top-full left-2 z-10 mt-3 h-24 w-12 md:h-28 md:w-14" />

          {/* Fills the empty right of the search row, dropped to straddle the
              header and the grid like the squiggle opposite it. From `md` only:
              below it the search takes the full width and there is no right side. */}
          <StickerBadge
            label={badge.label}
            icon={<LuCamera />}
            tint="text-sorbet-orchid"
            size={128}
            spin={28}
            className="absolute right-0 -bottom-24 z-10 hidden md:block lg:right-8"
          />
        </div>
      </section>

      {/* Offwhite, not white: the polaroid frame is white paper and needs a
          ground to sit on, or only its shadow shows where the card ends. */}
      {/* A short top: at laptop height the header fills the screen, and the
          first row of cards should peek above the fold. */}
      <section className="bg-sorbet-offwhite px-5 pt-16 pb-20 sm:px-8 md:pt-16 md:pb-28">
        <div className="mx-auto max-w-6xl">
          {isPendingSavedTrips ? (
            <div
              role="status"
              aria-label={loading.label}
              className="grid place-items-center py-10"
            >
              <SquiggleLoader className="h-20 w-32 text-sorbet-ink" />
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
            <ul
              aria-busy={isSearchingSavedTrips}
              className={`grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3 transition-opacity motion-reduce:transition-none ${
                isSearchingSavedTrips ? "opacity-60" : ""
              }`}
            >
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

          {!isPendingSavedTrips && savedTrips && savedTrips.length > 0 && (
            <div className="mt-16 flex flex-col items-center gap-4">
              {hasMoreSavedTrips && (
                <button
                  type="button"
                  onClick={() => loadMoreSavedTrips()}
                  disabled={isLoadingMoreSavedTrips}
                  aria-busy={isLoadingMoreSavedTrips}
                  className="group bg-sorbet-ink text-sorbet-offwhite focus-visible:outline-sorbet-ink inline-flex cursor-pointer items-center gap-4 rounded-full py-3 pr-3 pl-8 text-lg font-semibold transition-transform hover:scale-[1.03] focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-wait disabled:opacity-70 disabled:hover:scale-100 motion-reduce:transition-none"
                >
                  {isLoadingMoreSavedTrips ? more.loading : more.button}
                  <span
                    aria-hidden
                    className="bg-sorbet-lime text-sorbet-ink grid size-11 place-items-center rounded-full transition-transform group-hover:translate-y-0.5 motion-reduce:transition-none"
                  >
                    <FaArrowDown size={15} />
                  </span>
                </button>
              )}
              {loadMoreFailed && !isLoadingMoreSavedTrips && (
                <p role="alert" className="text-sorbet-alert text-sm font-medium">
                  {more.failed}
                </p>
              )}
              {/* Live, so a screen reader hears the count grow after "Show more". */}
              <p
                aria-live="polite"
                className="text-sorbet-ink/45 text-xs font-medium tracking-[0.12em] uppercase"
              >
                {more.count(savedTrips.length, totalSavedTrips)}
              </p>
            </div>
          )}
        </div>
      </section>
    </>
  );
}

export default SavedTripsDisplay;
