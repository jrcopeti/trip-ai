import SquiggleLoader from "@/components/sorbet/SquiggleLoader";
import HeroDeck from "./HeroDeck";
import loadLatestTrips from "./loadLatestTrips";
import { heroDeckLoading } from "./content";

/**
 * The hero deck's data, fetched on its own so the landing does not wait for
 * it: the page renders `<Suspense fallback={<HeroDeckFallback />}>` around this
 * and streams the deck in when the query answers, or renders nothing when it
 * fails — after Prisma's own timeouts, if the database is unreachable.
 */
async function LatestTripsDeck() {
  const trips = await loadLatestTrips();
  return <HeroDeck trips={trips} />;
}

/**
 * Holds the deck's place while it loads, about one polaroid tall, so the trips
 * arriving don't push the page much. When none come back it collapses.
 */
export function HeroDeckFallback() {
  return (
    <div role="status" className="mt-16 flex h-80 items-center justify-center md:mt-20">
      <SquiggleLoader className="h-16 w-24 text-sorbet-ink/40" />
      <span className="sr-only">{heroDeckLoading}</span>
    </div>
  );
}

export default LatestTripsDeck;
