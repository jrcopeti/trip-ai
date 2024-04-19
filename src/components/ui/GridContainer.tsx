interface GridContainerProps {
  children: React.ReactNode;
  bg?: string;
}

function GridContainer({ children, bg }: GridContainerProps) {
  return (
    <div
      className={`z-30 grid h-[90%] w-[90%] grid-cols-1 grid-rows-2 gap-6 overflow-auto ${bg} shadow-xl lg:h-[80%] lg:w-[80%] lg:grid-cols-2 lg:grid-rows-none`}
    >
      {children}
    </div>
  );
}

export default GridContainer;
