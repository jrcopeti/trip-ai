import PuffLoader from "react-spinners/PuffLoader";

function Loader() {
  return (
    <div className="fixed left-0 top-0 z-50 flex h-dvh w-dvw items-center justify-center ">
      <PuffLoader size={80} color="#4e888c" />
    </div>
  );
}

export default Loader;
