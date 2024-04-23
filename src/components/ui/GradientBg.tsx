import type { GradientBgProps } from "@/types";
function GradientBg({ position = "absolute", from, to, blur }: GradientBgProps) {
  return (
    <div
      className={`${position} left-0 top-0 -z-30 h-full w-full bg-gradient-to-b ${from} ${to} ${blur}`}
    ></div>
  );
}

export default GradientBg;
