function layout({ children }: { children: React.ReactNode }) {
  return (
    <div className=" min-h-dvh overflow-hidden  bg-geopattern p-4 md:p-6 lg:p-8 ">
      <div className="to relative h-dvh rounded-2xl bg-gradient-to-r from-shark-200 via-shark-300 to-shark-200 p-2.5 shadow-xl">
        {children}
      </div>
    </div>
  );
}

export default layout;
