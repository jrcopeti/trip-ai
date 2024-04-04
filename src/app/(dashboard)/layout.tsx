import geopattern from "@/assets/geopattern.png";
function layout({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{ backgroundImage: `url(${geopattern.src})` }}
      className=" min-h-dvh  p-4 md:p-6 lg:p-8 "
    >
      <div className="to relative h-dvh overflow-auto rounded-2xl bg-gradient-to-r from-shark-200 via-shark-300 to-shark-200 p-2.5 shadow-xl">
        {children}
      </div>
    </div>
  );
}

export default layout;
