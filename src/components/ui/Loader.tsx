import PuffLoader from "react-spinners/PuffLoader";

/** `--color-sorbet-ink`. react-spinners takes a colour value, not a class. */
export const SPINNER_INK = "#302e2d";

function Loader() {
  return (
    <div className="fixed inset-0 z-40 grid place-items-center bg-sorbet-canvas">
      <PuffLoader size={80} color={SPINNER_INK} />
    </div>
  );
}

export default Loader;
