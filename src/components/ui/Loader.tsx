import PuffLoader from "react-spinners/PuffLoader";

function Loader() {
  return (
    <div className="left-0 top-0 z-[99] flex h-[calc(100dvh-3.5rem)] w-dvw items-center justify-center bg-gallery-50 ">
      <PuffLoader size={80} color="#4e888c" />
    </div>
  );
}

export default Loader;
