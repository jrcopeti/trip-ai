function layout({ children }: { children: React.ReactNode }) {
  return (
    <div className=" bg-geopattern min-h-dvh  p-4 md:p-6 lg:p-8  ">
      <div className="from-shark-200 via-shark-300 to to-shark-200 shadow-xl relative h-dvh rounded-2xl bg-gradient-to-r p-2.5">

          {children}

      </div>
    </div>
  );
}

export default layout;
