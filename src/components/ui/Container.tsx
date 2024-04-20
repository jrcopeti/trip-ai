import type { ContainerProps } from "@/types";

function Container({
  children,
  overflow,
  height = "h-[calc(100dvh-3.5rem)]",
  animationClass = "",
}: ContainerProps) {
  return (
    <div
      className={`${animationClass} relative flex ${height} items-center justify-center ${overflow}`}
    >
      {children}
    </div>
  );
}

export default Container;
