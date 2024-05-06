import type { GridContainerProps } from "@/types";

function GridContainer({
  children,
  bg,
  animationClass = "",
}: GridContainerProps) {
  return (
    <div
      className={`${animationClass} grid-container-locomotive-scroll z-30 grid h-[90%] w-[90%] grid-cols-1 grid-rows-2 overflow-auto ${bg} shadow-xl lg:h-[80%] lg:w-[80%] lg:grid-cols-2 lg:grid-rows-none rounded-sm`}
    >
      {children}
    </div>
  );
}

export default GridContainer;
