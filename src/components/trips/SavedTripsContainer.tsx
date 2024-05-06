import type { SavedTripsContainerProps } from "@/types";

function SavedTripsContainer({ children, bg = "" }: SavedTripsContainerProps) {
  return <div className={`z-30 h-[100%] w-[100%] gap-6 ${bg}`}>{children}</div>;
}

export default SavedTripsContainer;
