import PuffLoader from "react-spinners/PuffLoader";

function Loader() {
  return (
    <div className="fixed left-0 top-0 z-[99] flex h-screen w-screen items-center justify-center overflow-hidden bg-gradient-to-b from-gallery-100 to-neptune-200">
      <PuffLoader size={80} color="#4e888c" />
    </div>
  );
}

export default Loader;
