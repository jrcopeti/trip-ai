import SquiggleLoader from "@/components/sorbet/SquiggleLoader";

/** The full-screen wait between routes: the looping ink squiggle on canvas. */
function Loader() {
  return (
    <div
      role="status"
      aria-label="Loading"
      className="fixed inset-0 z-40 grid place-items-center bg-sorbet-canvas text-sorbet-ink"
    >
      <SquiggleLoader className="h-20 w-32 md:h-24 md:w-40" />
    </div>
  );
}

export default Loader;
